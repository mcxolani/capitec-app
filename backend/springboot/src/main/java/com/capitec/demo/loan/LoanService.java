package com.capitec.demo.loan;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.capitec.demo.loan.LoanProducts.InterestRateRange;
import com.capitec.demo.loan.LoanProducts.Product;
import com.capitec.demo.loan.ValidationRules.FinancialInfo;
import com.capitec.demo.loan.ValidationRules.LoanDetails;
import com.capitec.demo.loan.ValidationRules.MinRule;
import com.capitec.demo.loan.ValidationRules.OptionsRule;
import com.capitec.demo.loan.ValidationRules.PersonalInfo;
import com.capitec.demo.loan.ValidationRules.RangeRule;

@Service
public class LoanService {
    private static final double MIN_LOAN = 5_000;
    private static final double MAX_LOAN = 300_000;
    private static final double MIN_INCOME = 5_000;
    private static final double AFFORDABILITY_SHARE = 0.8;

    private static final LoanProducts PRODUCTS = new LoanProducts(List.of(
            new Product(
                    "personal_loan",
                    "Personal Loan",
                    "Flexible personal financing for various needs",
                    5_000,
                    300_000,
                    6,
                    60,
                    new InterestRateRange(10.5, 18.5),
                    List.of("debt_consolidation", "home_improvement", "education", "medical", "other")
            ),
            new Product(
                    "vehicle_loan",
                    "Vehicle Finance",
                    "Financing for new and used vehicles",
                    50_000,
                    1_500_000,
                    12,
                    72,
                    new InterestRateRange(8.5, 15.0),
                    List.of("new_vehicle", "used_vehicle")
            )
    ));

    private static final ValidationRules VALIDATION_RULES = new ValidationRules(
            new PersonalInfo(
                    new RangeRule(18, 65, true, "Age must be between 18 and 65"),
                    new OptionsRule(true, List.of("employed", "self_employed", "unemployed", "retired"),
                            "Please select your employment status"),
                    new MinRule(3, true, "Minimum 3 months employment required")
            ),
            new FinancialInfo(
                    new MinRule(5_000, true, "Minimum monthly income of R5,000 required"),
                    new MinRule(0, true, "Please enter your monthly expenses"),
                    new RangeRule(300, 850, false, "Credit score must be between 300 and 850")
            ),
            new LoanDetails(
                    new RangeRule(5_000, 300_000, true,
                            "Loan amount must be between R5,000 and R300,000"),
                    new RangeRule(6, 60, true, "Loan term must be between 6 and 60 months")
            )
    );

    public LoanProducts getProducts() {
        return PRODUCTS;
    }

    public ValidationRules getValidationRules() {
        return VALIDATION_RULES;
    }

    public RateResponse calculateRate(RateRequest request) {
        validateRateRequest(request);
        double interestRate = interestRateFor(request.loanType(), request.creditScore());
        return LoanCalculator.calculate(request.loanAmount(), interestRate, request.loanTerm());
    }

    public EligibilityResponse checkEligibility(EligibilityRequest request) {
        var personal = request.personalInfo();
        var financial = request.financialInfo();
        var loan = request.loanDetails();

        double disposable = roundCents(financial.monthlyIncome() - financial.monthlyExpenses());
        double debtToIncome = financial.existingDebt() / financial.monthlyIncome() * 100;
        double interestRate = interestRateFor("personal_loan", financial.creditScore());
        double maxPayment = disposable * AFFORDABILITY_SHARE;
        RateResponse requested = LoanCalculator.calculate(loan.requestedAmount(), interestRate, loan.loanTerm());
        String declineReason = declineReason(request, disposable, debtToIncome);

        double maxAmount = declineReason == null
                ? maxAffordableAmount(maxPayment, interestRate, loan.loanTerm())
                : 0;
        boolean fitsBudget = declineReason == null && requested.monthlyPayment() <= maxPayment;
        double recommendedAmount = fitsBudget ? loan.requestedAmount() : maxAmount >= MIN_LOAN ? maxAmount : 0;
        RateResponse recommended = LoanCalculator.calculate(recommendedAmount, interestRate, loan.loanTerm());
        String riskCategory = declineReason != null ? "high" : riskCategoryFor(debtToIncome, financial.creditScore());
        int approvalLikelihood = approvalLikelihood(
                recommendedAmount, recommended.monthlyPayment(), maxPayment, riskCategory, financial.creditScore());

        return new EligibilityResponse(
                new EligibilityResponse.EligibilityResult(
                        fitsBudget,
                        approvalLikelihood,
                        riskCategory,
                        decisionReason(declineReason, fitsBudget, requested.monthlyPayment(), disposable,
                                recommendedAmount, maxAmount, loan.loanTerm())
                ),
                new EligibilityResponse.RecommendedLoan(
                        maxAmount,
                        recommendedAmount,
                        interestRate,
                        recommended.monthlyPayment(),
                        recommended.totalRepayment()
                ),
                new EligibilityResponse.AffordabilityAnalysis(
                        disposable,
                        percent(debtToIncome),
                        percent(loan.requestedAmount() / (financial.monthlyIncome() * 12) * 100),
                        affordabilityScoreFor(disposable, financial.monthlyIncome())
                )
        );
    }

    private String declineReason(EligibilityRequest request, double disposable, double debtToIncome) {
        var personal = request.personalInfo();
        var financial = request.financialInfo();
        var loan = request.loanDetails();

        if (loan.requestedAmount() < MIN_LOAN || loan.requestedAmount() > MAX_LOAN)
            return "Loan amounts are between " + formatRand(MIN_LOAN) + " and " + formatRand(MAX_LOAN) + ".";
        if (loan.loanTerm() < 6 || loan.loanTerm() > 60)
            return "Loan terms are between 6 and 60 months.";
        if (personal.age() < 18 || personal.age() > 65)
            return "Applicants must be aged 18 to 65.";
        if (personal.employmentStatus().equals("unemployed"))
            return "A regular income from employment is required.";
        if (!personal.employmentStatus().equals("retired") && personal.employmentDuration() < 3)
            return "At least 3 months in your current employment is required.";
        if (financial.monthlyIncome() < MIN_INCOME)
            return "A monthly income of at least " + formatRand(MIN_INCOME) + " is required.";
        if (disposable <= 0)
            return "Your monthly expenses leave no income available for repayments.";
        if (debtToIncome > 40)
            return "Existing debt repayments are above 40% of your income.";
        return null;
    }

    private double maxAffordableAmount(double payment, double annualRate, int termMonths) {
        if (payment <= 0) return 0;
        double monthlyRate = annualRate / 100 / 12;
        double amount = payment * (1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate;
        return Math.min(MAX_LOAN, Math.floor(amount / 1_000) * 1_000);
    }

    private String riskCategoryFor(double debtToIncome, Integer creditScore) {
        if (debtToIncome > 35 || creditScore != null && creditScore < 550) return "high";
        if (debtToIncome <= 20 && creditScore != null && creditScore >= 650) return "low";
        return "medium";
    }

    private String affordabilityScoreFor(double disposable, double income) {
        double share = disposable / income;
        if (share >= 0.3) return "good";
        if (share >= 0.15) return "fair";
        return "poor";
    }

    private int approvalLikelihood(double amount, double monthlyPayment, double maxPayment,
            String riskCategory, Integer creditScore) {
        if (amount == 0) return 0;
        double usage = maxPayment > 0 ? monthlyPayment / maxPayment : 1;
        int riskPenalty = switch (riskCategory) {
            case "low" -> 0;
            case "medium" -> 15;
            default -> 35;
        };
        int scorePenalty = creditScore == null ? 10 : 0;
        return (int) Math.min(95, Math.max(5,
                100 - riskPenalty - Math.round(Math.max(0, usage - 0.5) * 40) - scorePenalty));
    }

    private String decisionReason(String declined, boolean fitsBudget, double requestedPayment, double disposable,
            double recommendedAmount, double maxAmount, int loanTerm) {
        if (declined != null) return declined;
        if (fitsBudget) {
            return "The repayment of " + formatRand(requestedPayment) + " a month fits within 80% of your disposable income of "
                    + formatRand(disposable) + ".";
        }
        if (recommendedAmount > 0) {
            return "The repayment of " + formatRand(requestedPayment) + " a month is more than 80% of your disposable income. "
                    + "You could afford up to " + formatRand(maxAmount) + " over " + loanTerm + " months.";
        }
        return "Your disposable income of " + formatRand(disposable)
                + " can't cover the repayment on the minimum loan of " + formatRand(MIN_LOAN) + ".";
    }

    private double percent(double value) {
        return Math.round(value * 10) / 10.0;
    }

    private double roundCents(double value) {
        return Math.round(value * 100) / 100.0;
    }

    private String formatRand(double value) {
        return "R" + String.format(Locale.US, "%,d", Math.round(value));
    }

    private void validateRateRequest(RateRequest request) {
        switch (request.loanType()) {
            case "personal_loan" -> {
                if (request.loanAmount() > 300_000 || request.loanTerm() > 60) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount or term is outside personal loan limits");
                }
            }
            case "vehicle_loan" -> {
                if (request.loanAmount() < 50_000 || request.loanTerm() < 12) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount or term is below vehicle loan limits");
                }
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported loan type");
        }
    }

    private double interestRateFor(String loanType, Integer creditScore) {
        double personalRate = creditScore == null ? 15.5
                : creditScore >= 750 ? 10.5
                : creditScore >= 650 ? 12.5
                : creditScore >= 550 ? 15.5
                : 18.5;

        if (loanType.equals("personal_loan")) return personalRate;

        double position = (personalRate - 10.5) / (18.5 - 10.5);
        return Math.round((8.5 + position * (15 - 8.5)) * 100) / 100.0;
    }
}
