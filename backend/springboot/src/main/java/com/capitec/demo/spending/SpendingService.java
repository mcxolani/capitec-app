package com.capitec.demo.spending;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
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
    private static final List<SpendingFilters.DateRangePreset> DATE_RANGE_PRESETS = List.of(
            new SpendingFilters.DateRangePreset("Last 7 days", "7d"),
            new SpendingFilters.DateRangePreset("Last 30 days", "30d"),
            new SpendingFilters.DateRangePreset("Last 90 days", "90d"),
            new SpendingFilters.DateRangePreset("Last year", "1y")
    );
    private static final String[][] MERCHANTS = {
            {"Pick n Pay", "Checkers", "Woolworths Food"},
            {"Netflix", "Ster-Kinekor", "Spotify"},
            {"Uber", "Gautrain", "Engen"},
            {"Nando’s", "Seattle Coffee Co.", "Mugg & Bean"},
            {"Takealot", "Mr Price", "Clicks"},
            {"Prepaid electricity", "Vodacom", "Municipal water"}
    };

    private final Instant snapshotTime = Instant.now();
    private final LocalDate today = snapshotTime.atZone(SOUTH_AFRICA).toLocalDate();
    private final List<SpendingTransaction> transactions = generateTransactions(snapshotTime);

    public CustomerProfile getProfile(String customerId) {
        validateCustomer(customerId);

        SpendingTransaction oldest = transactions.getLast();
        long totalCents = transactions.stream().mapToLong(transaction -> Math.round(transaction.amount() * 100)).sum();
        String joinDate = oldest.date().atZone(ZoneOffset.UTC).toLocalDate().toString();
        return new CustomerProfile("12345", "John Doe", "john.doe@example.com", joinDate,
                "premium", totalCents / 100.0, "ZAR");
    }

    public SpendingSummary getSummary(String customerId, String period, String startDate, String endDate, String category) {
        validateCustomer(customerId);
        String selectedCategory = validateCategory(category);
        SpendingDateRange range = resolveRange(period, startDate, endDate);
        List<SpendingTransaction> current = filterTransactions(range.startDate(), range.endDate(), selectedCategory);
        long days = ChronoUnit.DAYS.between(range.startDate(), range.endDate()) + 1;
        List<SpendingTransaction> previous = filterTransactions(
                range.startDate().minusDays(days), range.startDate().minusDays(1), selectedCategory);
        double totalSpent = totalSpent(current);

        return new SpendingSummary(
                period,
                totalSpent,
                current.size(),
                current.isEmpty() ? 0 : roundCents(totalSpent / current.size()),
                topCategory(current),
                new SpendingSummary.ComparedToPrevious(
                        percentChange(totalSpent, totalSpent(previous)),
                        percentChange(current.size(), previous.size())
                )
        );
    }

    public SpendingCategories getCategories(
            String customerId, String period, String startDate, String endDate, String category) {
        validateCustomer(customerId);
        String selectedCategory = validateCategory(category);
        SpendingDateRange range = resolveRange(period, startDate, endDate);
        List<SpendingTransaction> matches = filterTransactions(range.startDate(), range.endDate(), selectedCategory);
        double totalAmount = totalSpent(matches);

        List<SpendingCategories.Category> categories = CATEGORIES.stream()
                .map(option -> {
                    List<SpendingTransaction> categoryMatches = matches.stream()
                            .filter(transaction -> transaction.category().equals(option.name())).toList();
                    double amount = totalSpent(categoryMatches);
                    double percentage = totalAmount == 0 ? 0 : Math.round(amount / totalAmount * 1_000) / 10.0;
                    return new SpendingCategories.Category(
                            option.name(), amount, percentage, categoryMatches.size(), option.color(), option.icon());
                })
                .filter(option -> option.transactionCount() > 0)
                .sorted(Comparator.comparingDouble(SpendingCategories.Category::amount).reversed())
                .toList();

        return new SpendingCategories(
                new SpendingCategories.DateRange(range.startDate().toString(), range.endDate().toString()),
                totalAmount,
                categories
        );
    }

    public SpendingTrends getTrends(String customerId, int months, String category) {
        validateCustomer(customerId);
        if (months < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "months must be zero or greater");
        }

        String selectedCategory = validateCategory(category);
        int count = Math.min(months, 24);
        YearMonth currentMonth = YearMonth.from(today);
        List<SpendingTrends.MonthTrend> trends = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            YearMonth month = currentMonth.minusMonths(count - i - 1L);
            List<SpendingTransaction> matches = filterTransactions(
                    month.atDay(1), month.atEndOfMonth(), selectedCategory);
            double totalSpent = totalSpent(matches);
            trends.add(new SpendingTrends.MonthTrend(
                    month.toString(),
                    totalSpent,
                    matches.size(),
                    matches.isEmpty() ? 0 : roundCents(totalSpent / matches.size())
            ));
        }

        return new SpendingTrends(trends);
    }

    public SpendingTransactions getTransactions(String customerId, int limit, int offset, String category,
            String period, String startDate, String endDate, String sortBy) {
        validateCustomer(customerId);
        if (limit < 0 || offset < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "limit and offset must be zero or greater");
        }
        if (!List.of("date_desc", "date_asc", "amount_desc", "amount_asc").contains(sortBy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sortBy value");
        }

        String selectedCategory = validateCategory(category);
        List<SpendingTransaction> matches;
        if (period == null && startDate == null && endDate == null) {
            matches = transactions.stream()
                    .filter(transaction -> selectedCategory == null || transaction.category().equals(selectedCategory))
                    .toList();
        } else {
            SpendingDateRange range = resolveRange(period == null ? "30d" : period, startDate, endDate);
            matches = filterTransactions(range.startDate(), range.endDate(), selectedCategory);
        }

        Comparator<SpendingTransaction> order = switch (sortBy) {
            case "date_asc" -> Comparator.comparing(SpendingTransaction::date);
            case "amount_asc" -> Comparator.comparingDouble(SpendingTransaction::amount);
            case "amount_desc" -> Comparator.comparingDouble(SpendingTransaction::amount).reversed();
            default -> Comparator.comparing(SpendingTransaction::date).reversed();
        };
        List<SpendingTransaction> sorted = new ArrayList<>(matches);
        sorted.sort(order.thenComparing(SpendingTransaction::id));

        int pageLimit = Math.min(limit, 100);
        List<SpendingTransactions.Transaction> page = sorted.stream()
                .skip(offset)
                .limit(pageLimit)
                .map(transaction -> new SpendingTransactions.Transaction(
                        transaction.id(),
                        transaction.date(),
                        transaction.merchant(),
                        transaction.category(),
                        transaction.amount(),
                        transaction.description(),
                        transaction.paymentMethod(),
                        transaction.icon(),
                        transaction.categoryColor()
                ))
                .toList();

        return new SpendingTransactions(
                page,
                new SpendingTransactions.Pagination(
                        sorted.size(), pageLimit, offset, (long) offset + pageLimit < sorted.size())
        );
    }

    public SpendingGoals getGoals(String customerId, String category) {
        validateCustomer(customerId);
        String selectedCategory = validateCategory(category);
        YearMonth month = YearMonth.from(today);
        int daysRemaining = month.lengthOfMonth() - today.getDayOfMonth();
        List<Budget> budgets = List.of(new Budget("Entertainment", 1_000), new Budget("Groceries", 1_500));

        List<SpendingGoals.Goal> goals = budgets.stream()
                .filter(budget -> selectedCategory == null || budget.category().equals(selectedCategory))
                .map(budget -> {
                    double currentSpent = totalSpent(filterTransactions(month.atDay(1), today, budget.category()));
                    double usage = currentSpent / budget.monthlyBudget();
                    String status = usage > 1 ? "over_budget" : usage >= 0.8 ? "warning" : "on_track";
                    return new SpendingGoals.Goal(
                            "goal_" + budget.category().toLowerCase(),
                            budget.category(),
                            budget.monthlyBudget(),
                            currentSpent,
                            Math.round(usage * 10_000) / 100.0,
                            daysRemaining,
                            status
                    );
                })
                .toList();

        return new SpendingGoals(goals);
    }

    public SpendingFilters getFilters(String customerId) {
        validateCustomer(customerId);
        List<SpendingFilters.Category> categories = CATEGORIES.stream()
                .map(category -> new SpendingFilters.Category(category.name(), category.color(), category.icon()))
                .toList();
        return new SpendingFilters(categories, DATE_RANGE_PRESETS);
    }

    private int periodDays(String period) {
        return switch (period) {
            case "7d" -> 7;
            case "30d" -> 30;
            case "90d" -> 90;
            case "1y" -> 365;
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported period");
        };
    }

    private SpendingDateRange resolveRange(String period, String startDate, String endDate) {
        int days = periodDays(period);
        if ((startDate == null) != (endDate == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Both startDate and endDate are required");
        }

        LocalDate start = startDate == null ? today.minusDays(days - 1) : parseDate(startDate);
        LocalDate end = endDate == null ? today : parseDate(endDate);
        if (start.isAfter(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startDate must be on or before endDate");
        }
        return new SpendingDateRange(start, end);
    }

    private String validateCategory(String category) {
        if (category == null || category.isBlank()) return null;
        if (CATEGORIES.stream().noneMatch(option -> option.name().equals(category))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported category");
        }
        return category;
    }

    private void validateCustomer(String customerId) {
        if (!customerId.equals("12345")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        }
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dates must use YYYY-MM-DD format");
        }
    }

    private List<SpendingTransaction> filterTransactions(LocalDate start, LocalDate end, String category) {
        Instant from = start.atStartOfDay(SOUTH_AFRICA).toInstant();
        Instant until = end.plusDays(1).atStartOfDay(SOUTH_AFRICA).toInstant();
        return transactions.stream()
                .filter(transaction -> !transaction.date().isBefore(from) && transaction.date().isBefore(until))
                .filter(transaction -> category == null || category.isBlank() || transaction.category().equals(category))
                .toList();
    }

    private double totalSpent(List<SpendingTransaction> matches) {
        return matches.stream().mapToLong(transaction -> Math.round(transaction.amount() * 100)).sum() / 100.0;
    }

    private String topCategory(List<SpendingTransaction> matches) {
        String top = null;
        double highest = -1;
        for (Category category : CATEGORIES) {
            double amount = totalSpent(matches.stream()
                    .filter(transaction -> transaction.category().equals(category.name())).toList());
            if (amount > highest) {
                highest = amount;
                top = amount > 0 ? category.name() : top;
            }
        }
        return top;
    }

    private Double percentChange(double current, double previous) {
        if (previous > 0) return Math.round((current - previous) / previous * 1_000) / 10.0;
        return current > 0 ? null : 0.0;
    }

    private double roundCents(double amount) {
        return Math.round(amount * 100) / 100.0;
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

    private record SpendingDateRange(LocalDate startDate, LocalDate endDate) {}

    private record Budget(String category, double monthlyBudget) {}

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
