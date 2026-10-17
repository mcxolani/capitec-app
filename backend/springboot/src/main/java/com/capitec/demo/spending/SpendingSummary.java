package com.capitec.demo.spending;

public record SpendingSummary(
        String period,
        double totalSpent,
        int transactionCount,
        double averageTransaction,
        String topCategory,
        ComparedToPrevious comparedToPrevious
) {
    public record ComparedToPrevious(Double spentChange, Double transactionChange) {}
}
