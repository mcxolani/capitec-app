package com.capitec.demo.loan;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record EligibilityRequest(
        @NotNull @Valid PersonalInfo personalInfo,
        @NotNull @Valid FinancialInfo financialInfo,
        @NotNull @Valid LoanDetails loanDetails
) {
    public record PersonalInfo(
            @Min(0) int age,
            @NotBlank @Pattern(regexp = "employed|self_employed|unemployed|retired") String employmentStatus,
            @Min(0) int employmentDuration
    ) {}

    public record FinancialInfo(
            @DecimalMin("0.01") double monthlyIncome,
            @DecimalMin("0") double monthlyExpenses,
            @DecimalMin("0") double existingDebt,
            @Min(300) @Max(850) Integer creditScore
    ) {}

    public record LoanDetails(
            @DecimalMin("0") double requestedAmount,
            @Min(1) int loanTerm,
            @NotBlank @Pattern(regexp = "debt_consolidation|home_improvement|education|medical|other") String loanPurpose
    ) {}
}
