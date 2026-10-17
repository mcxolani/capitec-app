package com.capitec.demo.spending;

import java.util.List;

public record SpendingGoals(List<Goal> goals) {
    public record Goal(
            String id,
            String category,
            double monthlyBudget,
            double currentSpent,
            double percentageUsed,
            int daysRemaining,
            String status
    ) {}
}
