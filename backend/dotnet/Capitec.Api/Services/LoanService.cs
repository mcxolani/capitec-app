using System.Globalization;
using Capitec.Api.Models;

namespace Capitec.Api.Services;

public class LoanService
{
    private const double MinLoan = 5_000;
    private const double MaxLoan = 300_000;
    private const double MinIncome = 5_000;
    private const double AffordabilityShare = 0.8;

    private static readonly LoanProducts Products = new(
    [
        new LoanProduct("personal_loan", "Personal Loan", "Flexible personal financing for various needs", 5_000, 300_000, 6, 60,
            new InterestRateRange(10.5, 18.5), ["debt_consolidation", "home_improvement", "education", "medical", "other"]),
        new LoanProduct("vehicle_loan", "Vehicle Finance", "Financing for new and used vehicles", 50_000, 1_500_000, 12, 72,
            new InterestRateRange(8.5, 15.0), ["new_vehicle", "used_vehicle"])
    ]);

    private static readonly ValidationRules Rules = new(
        new PersonalInfoRules(
            new RangeRule(18, 65, true, "Age must be between 18 and 65"),
            new OptionsRule(true, ["employed", "self_employed", "unemployed", "retired"], "Please select your employment status"),
            new MinRule(3, true, "Minimum 3 months employment required")),
        new FinancialInfoRules(
            new MinRule(5_000, true, "Minimum monthly income of R5,000 required"),
            new MinRule(0, true, "Please enter your monthly expenses"),
            new RangeRule(300, 850, false, "Credit score must be between 300 and 850")),
        new LoanDetailsRules(
            new RangeRule(5_000, 300_000, true, "Loan amount must be between R5,000 and R300,000"),
            new RangeRule(6, 60, true, "Loan term must be between 6 and 60 months")));

    public LoanProducts GetProducts() => Products;

    public ValidationRules GetValidationRules() => Rules;

    public RateResponse CalculateRate(RateRequest request)
    {
        ValidateRateRequest(request);
        var interestRate = InterestRateFor(request.LoanType, request.CreditScore);
        return Calculate(request.LoanAmount, interestRate, request.LoanTerm);
    }

    public EligibilityResponse CheckEligibility(EligibilityRequest request)
    {
        ValidateEligibilityRequest(request);
        var personal = request.PersonalInfo;
        var financial = request.FinancialInfo;
        var loan = request.LoanDetails;

        var disposable = RoundCents(financial.MonthlyIncome - financial.MonthlyExpenses);
        var debtToIncome = financial.ExistingDebt / financial.MonthlyIncome * 100;
        var interestRate = InterestRateFor("personal_loan", financial.CreditScore);
        var maxPayment = disposable * AffordabilityShare;
        var requested = Calculate(loan.RequestedAmount, interestRate, loan.LoanTerm);
        var declineReason = DeclineReason(request, disposable, debtToIncome);
        var maxAmount = declineReason is null ? MaxAffordableAmount(maxPayment, interestRate, loan.LoanTerm) : 0;
        var fitsBudget = declineReason is null && requested.MonthlyPayment <= maxPayment;
        var recommendedAmount = fitsBudget ? loan.RequestedAmount : maxAmount >= MinLoan ? maxAmount : 0;
        var recommended = Calculate(recommendedAmount, interestRate, loan.LoanTerm);
        var riskCategory = declineReason is not null ? "high" : RiskCategoryFor(debtToIncome, financial.CreditScore);

        return new EligibilityResponse(
            new EligibilityResult(
                fitsBudget,
                ApprovalLikelihood(recommendedAmount, recommended.MonthlyPayment, maxPayment, riskCategory, financial.CreditScore),
                riskCategory,
                DecisionReason(declineReason, fitsBudget, requested.MonthlyPayment, disposable, recommendedAmount, maxAmount, loan.LoanTerm)),
            new RecommendedLoan(maxAmount, recommendedAmount, interestRate, recommended.MonthlyPayment, recommended.TotalRepayment),
            new AffordabilityAnalysis(
                disposable,
                RoundTo(debtToIncome, 1),
                RoundTo(loan.RequestedAmount / (financial.MonthlyIncome * 12) * 100, 1),
                AffordabilityScoreFor(disposable, financial.MonthlyIncome)));
    }

    private static RateResponse Calculate(double principal, double annualRate, int termMonths)
    {
        var monthlyRate = annualRate / 100 / 12;
        var monthlyPayment = monthlyRate == 0
            ? RoundCents(principal / termMonths)
            : RoundCents(principal * monthlyRate / (1 - Math.Pow(1 + monthlyRate, -termMonths)));
        var balance = principal;
        var totalRepayment = 0d;
        var schedule = new List<PaymentScheduleEntry>();

        for (var month = 1; month <= termMonths; month++)
        {
            var interest = RoundCents(balance * monthlyRate);
            var principalPaid = month == termMonths ? balance : RoundCents(monthlyPayment - interest);
            balance = RoundCents(balance - principalPaid);
            var payment = RoundCents(principalPaid + interest);
            totalRepayment += payment;
            schedule.Add(new PaymentScheduleEntry(month, payment, principalPaid, interest, balance));
        }

        totalRepayment = RoundCents(totalRepayment);
        return new RateResponse(annualRate, monthlyPayment, RoundCents(totalRepayment - principal), totalRepayment, schedule);
    }

    private static string? DeclineReason(EligibilityRequest request, double disposable, double debtToIncome)
    {
        var personal = request.PersonalInfo;
        var financial = request.FinancialInfo;
        var loan = request.LoanDetails;

        if (loan.RequestedAmount < MinLoan || loan.RequestedAmount > MaxLoan)
            return $"Loan amounts are between {FormatRand(MinLoan)} and {FormatRand(MaxLoan)}.";
        if (loan.LoanTerm < 6 || loan.LoanTerm > 60)
            return "Loan terms are between 6 and 60 months.";
        if (personal.Age < 18 || personal.Age > 65)
            return "Applicants must be aged 18 to 65.";
        if (personal.EmploymentStatus == "unemployed")
            return "A regular income from employment is required.";
        if (personal.EmploymentStatus != "retired" && personal.EmploymentDuration < 3)
            return "At least 3 months in your current employment is required.";
        if (financial.MonthlyIncome < MinIncome)
            return $"A monthly income of at least {FormatRand(MinIncome)} is required.";
        if (disposable <= 0)
            return "Your monthly expenses leave no income available for repayments.";
        if (debtToIncome > 40)
            return "Existing debt repayments are above 40% of your income.";
        return null;
    }

    private static double MaxAffordableAmount(double payment, double annualRate, int termMonths)
    {
        if (payment <= 0) return 0;
        var monthlyRate = annualRate / 100 / 12;
        var amount = payment * (1 - Math.Pow(1 + monthlyRate, -termMonths)) / monthlyRate;
        return Math.Min(MaxLoan, Math.Floor(amount / 1_000) * 1_000);
    }

    private static string RiskCategoryFor(double debtToIncome, int? creditScore)
    {
        if (debtToIncome > 35 || creditScore is < 550) return "high";
        if (debtToIncome <= 20 && creditScore is >= 650) return "low";
        return "medium";
    }

    private static string AffordabilityScoreFor(double disposable, double income)
    {
        var share = disposable / income;
        return share >= 0.3 ? "good" : share >= 0.15 ? "fair" : "poor";
    }

    private static int ApprovalLikelihood(double amount, double monthlyPayment, double maxPayment, string riskCategory, int? creditScore)
    {
        if (amount == 0) return 0;
        var usage = maxPayment > 0 ? monthlyPayment / maxPayment : 1;
        var riskPenalty = riskCategory switch { "low" => 0, "medium" => 15, _ => 35 };
        var scorePenalty = creditScore is null ? 10 : 0;
        var usagePenalty = Math.Floor(Math.Max(0, usage - 0.5) * 40 + 0.5);
        return (int)Math.Min(95, Math.Max(5, 100 - riskPenalty - usagePenalty - scorePenalty));
    }

    private static string DecisionReason(string? declined, bool fitsBudget, double requestedPayment, double disposable,
        double recommendedAmount, double maxAmount, int loanTerm)
    {
        if (declined is not null) return declined;
        if (fitsBudget)
            return $"The repayment of {FormatRand(requestedPayment)} a month fits within 80% of your disposable income of {FormatRand(disposable)}.";
        if (recommendedAmount > 0)
            return $"The repayment of {FormatRand(requestedPayment)} a month is more than 80% of your disposable income. You could afford up to {FormatRand(maxAmount)} over {loanTerm} months.";
        return $"Your disposable income of {FormatRand(disposable)} can't cover the repayment on the minimum loan of {FormatRand(MinLoan)}.";
    }

    private static void ValidateRateRequest(RateRequest request)
    {
        if (request.LoanAmount < 5_000 || request.LoanAmount > 1_500_000 || request.LoanTerm < 6 || request.LoanTerm > 72)
            throw new ApiException(400, "Loan amount or term is outside the supported limits.");
        if (request.CreditScore is < 300 or > 850)
            throw new ApiException(400, "Credit score must be between 300 and 850.");

        switch (request.LoanType)
        {
            case "personal_loan" when request.LoanAmount <= 300_000 && request.LoanTerm <= 60:
            case "vehicle_loan" when request.LoanAmount >= 50_000 && request.LoanTerm >= 12:
                return;
            case "personal_loan":
                throw new ApiException(400, "Amount or term is outside personal loan limits.");
            case "vehicle_loan":
                throw new ApiException(400, "Amount or term is below vehicle loan limits.");
            default:
                throw new ApiException(400, "Unsupported loan type.");
        }
    }

    private static void ValidateEligibilityRequest(EligibilityRequest request)
    {
        if (request.PersonalInfo is null || request.FinancialInfo is null || request.LoanDetails is null)
            throw new ApiException(400, "Personal info, financial info, and loan details are required.");

        var personal = request.PersonalInfo;
        var financial = request.FinancialInfo;
        var loan = request.LoanDetails;
        if (personal.Age < 0 || personal.EmploymentDuration < 0 ||
            string.IsNullOrWhiteSpace(personal.EmploymentStatus) ||
            !Rules.PersonalInfo.EmploymentStatus.Options.Contains(personal.EmploymentStatus))
            throw new ApiException(400, "Personal information is invalid.");
        if (financial.MonthlyIncome <= 0 || financial.MonthlyExpenses < 0 || financial.ExistingDebt < 0 ||
            financial.CreditScore is < 300 or > 850)
            throw new ApiException(400, "Financial information is invalid.");
        if (loan.RequestedAmount < 0 || loan.LoanTerm < 1 ||
            string.IsNullOrWhiteSpace(loan.LoanPurpose) ||
            !Products.Products[0].Purposes.Contains(loan.LoanPurpose))
            throw new ApiException(400, "Loan details are invalid.");
    }

    private static double InterestRateFor(string loanType, int? creditScore)
    {
        var personalRate = creditScore switch
        {
            null => 15.5,
            >= 750 => 10.5,
            >= 650 => 12.5,
            >= 550 => 15.5,
            _ => 18.5
        };
        if (loanType == "personal_loan") return personalRate;
        var position = (personalRate - 10.5) / (18.5 - 10.5);
        return RoundTo(8.5 + position * (15 - 8.5), 2);
    }

    private static double RoundCents(double amount) => RoundTo(amount, 2);

    private static double RoundTo(double amount, int places)
    {
        var scale = Math.Pow(10, places);
        return Math.Floor(amount * scale + 0.5) / scale;
    }

    private static string FormatRand(double amount) => "R" + Math.Floor(amount + 0.5).ToString("N0", CultureInfo.InvariantCulture);
}
