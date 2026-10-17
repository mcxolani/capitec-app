package com.capitec.demo.loan;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record RateRequest(
        @DecimalMin("5000") @DecimalMax("1500000") double loanAmount,
        @Min(6) @Max(72) int loanTerm,
        @Min(300) @Max(850) Integer creditScore,
        @NotBlank String loanType
) {
}
