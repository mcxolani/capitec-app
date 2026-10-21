namespace Capitec.Api.Models;

public record Position(double Lat, double Lng);

public record Branch(string Id, string Name, string Address, Position Position, string? Phone, string Hours);

public record LoanProducts(List<LoanProduct> Products);

public record LoanProduct(
    string Id,
    string Name,
    string Description,
    int MinAmount,
    int MaxAmount,
    int MinTerm,
    int MaxTerm,
    InterestRateRange InterestRateRange,
    List<string> Purposes);

public record InterestRateRange(double Min, double Max);

public record ValidationRules(
    PersonalInfoRules PersonalInfo,
    FinancialInfoRules FinancialInfo,
    LoanDetailsRules LoanDetails);

public record PersonalInfoRules(RangeRule Age, OptionsRule EmploymentStatus, MinRule EmploymentDuration);

public record FinancialInfoRules(MinRule MonthlyIncome, MinRule MonthlyExpenses, RangeRule CreditScore);

public record LoanDetailsRules(RangeRule RequestedAmount, RangeRule LoanTerm);

public record RangeRule(int Min, int Max, bool Required, string ErrorMessage);

public record MinRule(int Min, bool Required, string ErrorMessage);

public record OptionsRule(bool Required, List<string> Options, string ErrorMessage);

public record RateRequest(double LoanAmount, int LoanTerm, int? CreditScore, string LoanType);

public record RateResponse(
    double InterestRate,
    double MonthlyPayment,
    double TotalInterest,
    double TotalRepayment,
    List<PaymentScheduleEntry> PaymentSchedule);

public record PaymentScheduleEntry(int Month, double Payment, double Principal, double Interest, double Balance);

public record EligibilityRequest(PersonalInfo PersonalInfo, FinancialInfo FinancialInfo, LoanDetails LoanDetails);

public record PersonalInfo(int Age, string EmploymentStatus, int EmploymentDuration);

public record FinancialInfo(double MonthlyIncome, double MonthlyExpenses, double ExistingDebt, int? CreditScore);

public record LoanDetails(double RequestedAmount, int LoanTerm, string LoanPurpose);

public record EligibilityResponse(
    EligibilityResult EligibilityResult,
    RecommendedLoan RecommendedLoan,
    AffordabilityAnalysis AffordabilityAnalysis);

public record EligibilityResult(bool IsEligible, int ApprovalLikelihood, string RiskCategory, string DecisionReason);

public record RecommendedLoan(
    double MaxAmount,
    double RecommendedAmount,
    double InterestRate,
    double MonthlyPayment,
    double TotalRepayment);

public record AffordabilityAnalysis(
    double DisposableIncome,
    double DebtToIncomeRatio,
    double LoanToIncomeRatio,
    string AffordabilityScore);

public record CustomerProfile(
    string CustomerId,
    string Name,
    string Email,
    string JoinDate,
    string AccountType,
    double TotalSpent,
    string Currency);

public record SpendingDateRange(string StartDate, string EndDate);

public record SpendingSummary(
    string Period,
    double TotalSpent,
    int TransactionCount,
    double AverageTransaction,
    string? TopCategory,
    ComparedToPrevious ComparedToPrevious);

public record ComparedToPrevious(double? SpentChange, double? TransactionChange);

public record SpendingCategories(SpendingDateRange DateRange, double TotalAmount, List<SpendingCategory> Categories);

public record SpendingCategory(
    string Name,
    double Amount,
    double Percentage,
    int TransactionCount,
    string Color,
    string Icon);

public record SpendingTrends(List<MonthTrend> Trends);

public record MonthTrend(string Month, double TotalSpent, int TransactionCount, double AverageTransaction);

public record SpendingTransactions(List<Transaction> Transactions, Pagination Pagination);

public record Transaction(
    string Id,
    DateTimeOffset Date,
    string Merchant,
    string Category,
    double Amount,
    string Description,
    string PaymentMethod,
    string Icon,
    string CategoryColor);

public record Pagination(int Total, int Limit, int Offset, bool HasMore);

public record SpendingGoals(List<SpendingGoal> Goals);

public record SpendingGoal(
    string Id,
    string Category,
    double MonthlyBudget,
    double CurrentSpent,
    double PercentageUsed,
    int DaysRemaining,
    string Status);

public record SpendingFilters(List<SpendingFilterCategory> Categories, List<DateRangePreset> DateRangePresets);

public record SpendingFilterCategory(string Name, string Color, string Icon);

public record DateRangePreset(string Label, string Value);
