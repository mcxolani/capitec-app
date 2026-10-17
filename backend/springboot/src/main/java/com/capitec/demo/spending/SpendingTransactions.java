package com.capitec.demo.spending;

import java.time.Instant;
import java.util.List;

public record SpendingTransactions(List<Transaction> transactions, Pagination pagination) {
    public record Transaction(
            String id,
            Instant date,
            String merchant,
            String category,
            double amount,
            String description,
            String paymentMethod,
            String icon,
            String categoryColor
    ) {}

    public record Pagination(int total, int limit, int offset, boolean hasMore) {}
}
