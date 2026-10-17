package com.capitec.demo.spending;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SpendingService {
    private static final ZoneId SOUTH_AFRICA = ZoneId.of("Africa/Johannesburg");
    private static final List<Category> CATEGORIES = List.of(
            new Category("Groceries", "#FF6B6B", "shopping-cart"),
            new Category("Entertainment", "#4ECDC4", "film"),
            new Category("Transportation", "#45B7D1", "car"),
            new Category("Dining", "#F7DC6F", "utensils"),
            new Category("Shopping", "#BB8FCE", "shopping-bag"),
            new Category("Utilities", "#85C1E9", "zap")
    );
    private static final String[][] MERCHANTS = {
            {"Pick n Pay", "Checkers", "Woolworths Food"},
            {"Netflix", "Ster-Kinekor", "Spotify"},
            {"Uber", "Gautrain", "Engen"},
            {"Nando’s", "Seattle Coffee Co.", "Mugg & Bean"},
            {"Takealot", "Mr Price", "Clicks"},
            {"Prepaid electricity", "Vodacom", "Municipal water"}
    };

    private final List<SpendingTransaction> transactions = generateTransactions(Instant.now());

    public CustomerProfile getProfile(String customerId) {
        if (!customerId.equals("12345")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        }

        SpendingTransaction oldest = transactions.getLast();
        long totalCents = transactions.stream().mapToLong(transaction -> Math.round(transaction.amount() * 100)).sum();
        String joinDate = oldest.date().atZone(ZoneOffset.UTC).toLocalDate().toString();
        return new CustomerProfile("12345", "John Doe", "john.doe@example.com", joinDate,
                "premium", totalCents / 100.0, "ZAR");
    }

    private List<SpendingTransaction> generateTransactions(Instant now) {
        LocalDate today = now.atZone(SOUTH_AFRICA).toLocalDate();
        YearMonth currentMonth = YearMonth.from(today);
        SeededRandom random = new SeededRandom();
        List<SpendingTransaction> result = new ArrayList<>();

        for (int monthsAgo = 24; monthsAgo >= 0; monthsAgo--) {
            YearMonth month = currentMonth.minusMonths(monthsAgo);
            int count = 42 + (int) (random.next() * 9);
            for (int i = 0; i < count; i++) {
                int categoryIndex = i % CATEGORIES.size();
                int day = 1 + (int) (random.next() * month.lengthOfMonth());
                Instant date = LocalDate.of(month.getYear(), month.getMonth(), day)
                        .atTime(8 + i % 10, 0).toInstant(ZoneOffset.UTC);
                long amountCents = 2_500 + (int) (random.next() * (categoryIndex == 0 ? 32_000 : 18_000));
                if (date.isAfter(now)) continue;

                Category category = CATEGORIES.get(categoryIndex);
                String merchant = MERCHANTS[categoryIndex][(int) (random.next() * 3)];
                result.add(new SpendingTransaction(
                        "txn_" + month + "_" + i,
                        date,
                        merchant,
                        category.name(),
                        amountCents / 100.0,
                        category.name() + " purchase",
                        categoryIndex == 5 ? "Debit Order" : "Debit Card",
                        category.icon(),
                        category.color()
                ));
            }
        }

        result.sort(Comparator.comparing(SpendingTransaction::date).reversed()
                .thenComparing(SpendingTransaction::id));
        return List.copyOf(result);
    }

    private record Category(String name, String color, String icon) {}

    private record SpendingTransaction(
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

    private static class SeededRandom {
        private long seed = 12_345;

        private double next() {
            seed = (1_664_525L * seed + 1_013_904_223L) & 0xffff_ffffL;
            return seed / 4_294_967_296.0;
        }
    }
}
