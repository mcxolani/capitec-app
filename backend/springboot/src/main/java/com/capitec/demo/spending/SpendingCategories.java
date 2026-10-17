package com.capitec.demo.spending;

import java.util.List;

public record SpendingCategories(DateRange dateRange, double totalAmount, List<Category> categories) {
    public record DateRange(String startDate, String endDate) {}

    public record Category(
            String name,
            double amount,
            double percentage,
            int transactionCount,
            String color,
            String icon
    ) {}
}
