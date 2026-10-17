package com.capitec.demo.loan;

import java.util.List;

public record ValidationRules(
        PersonalInfo personalInfo,
        FinancialInfo financialInfo,
        LoanDetails loanDetails
) {
    public record PersonalInfo(RangeRule age, OptionsRule employmentStatus, MinRule employmentDuration) {
    }

    public record FinancialInfo(MinRule monthlyIncome, MinRule monthlyExpenses, RangeRule creditScore) {
    }

    public record LoanDetails(RangeRule requestedAmount, RangeRule loanTerm) {
    }

    public record RangeRule(int min, int max, boolean required, String errorMessage) {
    }

    public record MinRule(int min, boolean required, String errorMessage) {
    }

    public record OptionsRule(boolean required, List<String> options, String errorMessage) {
    }
}
