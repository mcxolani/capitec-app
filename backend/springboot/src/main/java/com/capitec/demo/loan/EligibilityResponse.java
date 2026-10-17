package com.capitec.demo.loan;

public record EligibilityResponse(
        EligibilityResult eligibilityResult,
        RecommendedLoan recommendedLoan,
        AffordabilityAnalysis affordabilityAnalysis
) {
    public record EligibilityResult(boolean isEligible, int approvalLikelihood, String riskCategory, String decisionReason) {}

    public record RecommendedLoan(
            double maxAmount,
            double recommendedAmount,
            double interestRate,
            double monthlyPayment,
            double totalRepayment
    ) {}

    public record AffordabilityAnalysis(
            double disposableIncome,
            double debtToIncomeRatio,
            double loanToIncomeRatio,
            String affordabilityScore
    ) {}
}
