using System.Globalization;
using Capitec.Api.Models;

namespace Capitec.Api.Services;

public class SpendingService
{
    private static readonly TimeSpan SouthAfricaOffset = TimeSpan.FromHours(2);
    private static readonly List<SpendingFilterCategory> Categories =
    [
        new("Groceries", "#FF6B6B", "shopping-cart"),
        new("Entertainment", "#4ECDC4", "film"),
        new("Transportation", "#45B7D1", "car"),
        new("Dining", "#F7DC6F", "utensils"),
        new("Shopping", "#BB8FCE", "shopping-bag"),
        new("Utilities", "#85C1E9", "zap")
    ];

    private static readonly List<DateRangePreset> DateRangePresets =
    [
        new("Last 7 days", "7d"),
        new("Last 30 days", "30d"),
        new("Last 90 days", "90d"),
        new("Last year", "1y")
    ];

    private static readonly string[][] Merchants =
    [
        ["Pick n Pay", "Checkers", "Woolworths Food"],
        ["Netflix", "Ster-Kinekor", "Spotify"],
        ["Uber", "Gautrain", "Engen"],
        ["Nando’s", "Seattle Coffee Co.", "Mugg & Bean"],
        ["Takealot", "Mr Price", "Clicks"],
        ["Prepaid electricity", "Vodacom", "Municipal water"]
    ];

    private readonly DateOnly _today;
    private readonly List<DemoTransaction> _transactions;

    public SpendingService()
    {
        var now = DateTimeOffset.UtcNow.ToOffset(SouthAfricaOffset);
        _today = DateOnly.FromDateTime(now.DateTime);
        _transactions = GenerateTransactions(now);
    }

    public CustomerProfile GetProfile(string customerId)
    {
        ValidateCustomer(customerId);
        var oldest = _transactions[^1];
        return new CustomerProfile("12345", "John Doe", "john.doe@example.com", oldest.Date.UtcDateTime.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            "premium", TotalSpent(_transactions), "ZAR");
    }

    public SpendingSummary GetSummary(string customerId, string period, string? startDate, string? endDate, string? category)
    {
        ValidateCustomer(customerId);
        var selectedCategory = ValidateCategory(category);
        var range = ResolveRange(period, startDate, endDate);
        var current = FilterTransactions(range.StartDate, range.EndDate, selectedCategory);
        var days = range.EndDate.DayNumber - range.StartDate.DayNumber + 1;
        var previous = FilterTransactions(range.StartDate.AddDays(-days), range.StartDate.AddDays(-1), selectedCategory);
        var total = TotalSpent(current);

        return new SpendingSummary(
            period,
            total,
            current.Count,
            current.Count == 0 ? 0 : RoundCents(total / current.Count),
            TopCategory(current),
            new ComparedToPrevious(PercentChange(total, TotalSpent(previous)), PercentChange(current.Count, previous.Count)));
    }

    public SpendingCategories GetCategories(string customerId, string period, string? startDate, string? endDate, string? category)
    {
        ValidateCustomer(customerId);
        var selectedCategory = ValidateCategory(category);
        var range = ResolveRange(period, startDate, endDate);
        var matches = FilterTransactions(range.StartDate, range.EndDate, selectedCategory);
        var total = TotalSpent(matches);
        var result = Categories
            .Select(option =>
            {
                var categoryMatches = matches.Where(transaction => transaction.Category == option.Name).ToList();
                var amount = TotalSpent(categoryMatches);
                return new SpendingCategory(option.Name, amount,
                    total == 0 ? 0 : RoundTo(amount / total * 100, 1), categoryMatches.Count, option.Color, option.Icon);
            })
            .Where(option => option.TransactionCount > 0)
            .OrderByDescending(option => option.Amount)
            .ToList();

        return new SpendingCategories(new SpendingDateRange(range.StartDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            range.EndDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)), total, result);
    }

    public SpendingTrends GetTrends(string customerId, int months, string? category)
    {
        ValidateCustomer(customerId);
        if (months < 0) throw new ApiException(400, "months must be zero or greater.");
        var selectedCategory = ValidateCategory(category);
        var count = Math.Min(months, 24);
        var currentMonth = new DateOnly(_today.Year, _today.Month, 1);
        var trends = new List<MonthTrend>();

        for (var i = 0; i < count; i++)
        {
            var first = currentMonth.AddMonths(-(count - i - 1));
            var last = first.AddMonths(1).AddDays(-1);
            var matches = FilterTransactions(first, last, selectedCategory);
            var total = TotalSpent(matches);
            trends.Add(new MonthTrend(first.ToString("yyyy-MM", CultureInfo.InvariantCulture), total, matches.Count,
                matches.Count == 0 ? 0 : RoundCents(total / matches.Count)));
        }

        return new SpendingTrends(trends);
    }

    public SpendingTransactions GetTransactions(string customerId, int limit, int offset, string? category,
        string? period, string? startDate, string? endDate, string sortBy)
    {
        ValidateCustomer(customerId);
        if (limit < 0 || offset < 0) throw new ApiException(400, "limit and offset must be zero or greater.");
        if (sortBy is not ("date_desc" or "date_asc" or "amount_desc" or "amount_asc"))
            throw new ApiException(400, "Unsupported sortBy value.");

        var selectedCategory = ValidateCategory(category);
        List<DemoTransaction> matches;
        if (period is null && startDate is null && endDate is null)
            matches = _transactions.Where(transaction => selectedCategory is null || transaction.Category == selectedCategory).ToList();
        else
        {
            var range = ResolveRange(period ?? "30d", startDate, endDate);
            matches = FilterTransactions(range.StartDate, range.EndDate, selectedCategory);
        }

        var sorted = sortBy switch
        {
            "date_asc" => matches.OrderBy(transaction => transaction.Date).ThenBy(transaction => transaction.Id),
            "amount_asc" => matches.OrderBy(transaction => transaction.Amount).ThenBy(transaction => transaction.Id),
            "amount_desc" => matches.OrderByDescending(transaction => transaction.Amount).ThenBy(transaction => transaction.Id),
            _ => matches.OrderByDescending(transaction => transaction.Date).ThenBy(transaction => transaction.Id)
        };
        var pageLimit = Math.Min(limit, 100);
        var page = sorted.Skip(offset).Take(pageLimit).Select(transaction => transaction.ToResponse()).ToList();
        return new SpendingTransactions(page, new Pagination(matches.Count, pageLimit, offset, (long)offset + pageLimit < matches.Count));
    }

    public SpendingGoals GetGoals(string customerId, string? category)
    {
        ValidateCustomer(customerId);
        var selectedCategory = ValidateCategory(category);
        var monthStart = new DateOnly(_today.Year, _today.Month, 1);
        var daysRemaining = DateTime.DaysInMonth(_today.Year, _today.Month) - _today.Day;
        var budgets = new[] { (Category: "Entertainment", Amount: 1_000d), (Category: "Groceries", Amount: 1_500d) };
        var goals = budgets
            .Where(budget => selectedCategory is null || budget.Category == selectedCategory)
            .Select(budget =>
            {
                var spent = TotalSpent(FilterTransactions(monthStart, _today, budget.Category));
                var usage = spent / budget.Amount;
                var status = usage > 1 ? "over_budget" : usage >= 0.8 ? "warning" : "on_track";
                return new SpendingGoal($"goal_{budget.Category.ToLowerInvariant()}", budget.Category, budget.Amount,
                    spent, RoundTo(usage * 100, 2), daysRemaining, status);
            })
            .ToList();
        return new SpendingGoals(goals);
    }

    public SpendingFilters GetFilters(string customerId)
    {
        ValidateCustomer(customerId);
        return new SpendingFilters(Categories, DateRangePresets);
    }

    private DateRange ResolveRange(string period, string? startDate, string? endDate)
    {
        var days = period switch
        {
            "7d" => 7,
            "30d" => 30,
            "90d" => 90,
            "1y" => 365,
            _ => throw new ApiException(400, "Unsupported period.")
        };
        if ((startDate is null) != (endDate is null)) throw new ApiException(400, "Both startDate and endDate are required.");
        var start = startDate is null ? _today.AddDays(1 - days) : ParseDate(startDate);
        var end = endDate is null ? _today : ParseDate(endDate);
        if (start > end) throw new ApiException(400, "startDate must be on or before endDate.");
        return new DateRange(start, end);
    }

    private static DateOnly ParseDate(string value)
    {
        if (DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date)) return date;
        throw new ApiException(400, "Dates must use YYYY-MM-DD format.");
    }

    private static string? ValidateCategory(string? category)
    {
        if (string.IsNullOrWhiteSpace(category)) return null;
        if (Categories.All(option => option.Name != category)) throw new ApiException(400, "Unsupported category.");
        return category;
    }

    private static void ValidateCustomer(string customerId)
    {
        if (customerId != "12345") throw new ApiException(404, "Customer not found.");
    }

    private List<DemoTransaction> FilterTransactions(DateOnly start, DateOnly end, string? category)
    {
        var from = new DateTimeOffset(start.ToDateTime(TimeOnly.MinValue), SouthAfricaOffset).ToUniversalTime();
        var until = new DateTimeOffset(end.AddDays(1).ToDateTime(TimeOnly.MinValue), SouthAfricaOffset).ToUniversalTime();
        return _transactions.Where(transaction => transaction.Date >= from && transaction.Date < until)
            .Where(transaction => category is null || transaction.Category == category).ToList();
    }

    private string? TopCategory(List<DemoTransaction> transactions)
    {
        string? top = null;
        var highest = -1d;
        foreach (var category in Categories)
        {
            var amount = TotalSpent(transactions.Where(transaction => transaction.Category == category.Name).ToList());
            if (amount > highest)
            {
                highest = amount;
                if (amount > 0) top = category.Name;
            }
        }
        return top;
    }

    private static double? PercentChange(double current, double previous) =>
        previous > 0 ? RoundTo((current - previous) / previous * 100, 1) : current > 0 ? null : 0;

    private static double TotalSpent(IEnumerable<DemoTransaction> transactions) =>
        transactions.Sum(transaction => (long)Math.Floor(transaction.Amount * 100 + 0.5)) / 100d;

    private static double RoundCents(double amount) => RoundTo(amount, 2);

    private static double RoundTo(double amount, int places)
    {
        var scale = Math.Pow(10, places);
        return Math.Floor(amount * scale + 0.5) / scale;
    }

    private static List<DemoTransaction> GenerateTransactions(DateTimeOffset now)
    {
        var today = DateOnly.FromDateTime(now.DateTime);
        var currentMonth = new DateOnly(today.Year, today.Month, 1);
        var random = new SeededRandom();
        var result = new List<DemoTransaction>();

        for (var monthsAgo = 24; monthsAgo >= 0; monthsAgo--)
        {
            var first = currentMonth.AddMonths(-monthsAgo);
            var days = DateTime.DaysInMonth(first.Year, first.Month);
            var count = 42 + (int)(random.Next() * 9);
            for (var i = 0; i < count; i++)
            {
                var categoryIndex = i % Categories.Count;
                var day = 1 + (int)(random.Next() * days);
                var date = new DateTimeOffset(first.Year, first.Month, day, 8 + i % 10, 0, 0, TimeSpan.Zero);
                var amountCents = 2_500 + (int)(random.Next() * (categoryIndex == 0 ? 32_000 : 18_000));
                if (date > now) continue;
                var category = Categories[categoryIndex];
                var merchant = Merchants[categoryIndex][(int)(random.Next() * 3)];
                result.Add(new DemoTransaction($"txn_{first.ToString("yyyy-MM", CultureInfo.InvariantCulture)}_{i}", date, merchant, category.Name,
                    amountCents / 100d, $"{category.Name} purchase", categoryIndex == 5 ? "Debit Order" : "Debit Card",
                    category.Icon, category.Color));
            }
        }

        return result.OrderByDescending(transaction => transaction.Date).ThenBy(transaction => transaction.Id, StringComparer.Ordinal).ToList();
    }

    private sealed record DemoTransaction(
        string Id, DateTimeOffset Date, string Merchant, string Category, double Amount,
        string Description, string PaymentMethod, string Icon, string CategoryColor)
    {
        public Transaction ToResponse() => new(Id, Date, Merchant, Category, Amount, Description, PaymentMethod, Icon, CategoryColor);
    }

    private sealed record DateRange(DateOnly StartDate, DateOnly EndDate);

    private sealed class SeededRandom
    {
        private uint _seed = 12_345;

        public double Next()
        {
            _seed = unchecked(1_664_525 * _seed + 1_013_904_223);
            return _seed / 4_294_967_296d;
        }
    }
}
