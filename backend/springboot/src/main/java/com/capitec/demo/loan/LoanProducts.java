package com.capitec.demo.loan;

import java.util.List;

public record LoanProducts(List<Product> products) {
    public record Product(
            String id,
            String name,
            String description,
            int minAmount,
            int maxAmount,
            int minTerm,
            int maxTerm,
            InterestRateRange interestRateRange,
            List<String> purposes
    ) {
    }

    public record InterestRateRange(double min, double max) {
    }
}
