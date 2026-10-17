package com.capitec.demo.spending;

import java.util.List;

public record SpendingTrends(List<MonthTrend> trends) {
    public record MonthTrend(String month, double totalSpent, int transactionCount, double averageTransaction) {}
}
