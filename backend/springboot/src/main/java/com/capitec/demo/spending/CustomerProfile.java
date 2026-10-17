package com.capitec.demo.spending;

public record CustomerProfile(
        String customerId,
        String name,
        String email,
        String joinDate,
        String accountType,
        double totalSpent,
        String currency
) {}
