using Capitec.Api.Services;
using Capitec.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
    options.SwaggerDoc("v1", new() { Title = "Capitec Demo API", Version = "v1" }));
builder.Services.AddSingleton<BranchService>();
builder.Services.AddSingleton<LoanService>();
builder.Services.AddSingleton<SpendingService>();

var app = builder.Build();

app.Use(async (context, next) =>
{
    try
    {
        await next(context);
    }
    catch (ApiException exception)
    {
        await Results.Problem(statusCode: exception.StatusCode, title: exception.Message).ExecuteAsync(context);
    }
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options => options.RouteTemplate = "openapi/{documentName}.json");
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "Capitec Demo API v1"));
}

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }))
    .WithName("GetHealth")
    .WithTags("Health")
    .WithOpenApi();

app.MapGet("/api/branches", (BranchService service) => service.GetBranches())
    .WithName("GetBranches")
    .WithTags("Branches")
    .WithOpenApi();

var loans = app.MapGroup("/api/loans").WithTags("Loans");
loans.MapGet("/products", (LoanService service) => service.GetProducts())
    .WithName("GetLoanProducts")
    .WithOpenApi();
loans.MapGet("/validation-rules", (LoanService service) => service.GetValidationRules())
    .WithName("GetLoanValidationRules")
    .WithOpenApi();
loans.MapPost("/calculate-rate", (LoanService service, RateRequest request) => service.CalculateRate(request))
    .WithName("CalculateLoanRate")
    .ProducesProblem(400)
    .WithOpenApi();
loans.MapPost("/eligibility", (LoanService service, EligibilityRequest request) => service.CheckEligibility(request))
    .WithName("CheckLoanEligibility")
    .ProducesProblem(400)
    .WithOpenApi();

var customers = app.MapGroup("/api/customers/{customerId}").WithTags("Spending");
customers.MapGet("/profile", (string customerId, SpendingService service) => service.GetProfile(customerId))
    .WithName("GetCustomerProfile")
    .ProducesProblem(404)
    .WithOpenApi();
customers.MapGet("/spending/summary", (string customerId, SpendingService service,
    string period = "30d", string? startDate = null, string? endDate = null, string? category = null) =>
    service.GetSummary(customerId, period, startDate, endDate, category))
    .WithName("GetSpendingSummary")
    .ProducesProblem(400)
    .ProducesProblem(404)
    .WithOpenApi();
customers.MapGet("/spending/categories", (string customerId, SpendingService service,
    string period = "30d", string? startDate = null, string? endDate = null, string? category = null) =>
    service.GetCategories(customerId, period, startDate, endDate, category))
    .WithName("GetSpendingCategories")
    .ProducesProblem(400)
    .ProducesProblem(404)
    .WithOpenApi();
customers.MapGet("/spending/trends", (string customerId, SpendingService service, int months = 12, string? category = null) =>
    service.GetTrends(customerId, months, category))
    .WithName("GetSpendingTrends")
    .ProducesProblem(400)
    .ProducesProblem(404)
    .WithOpenApi();
customers.MapGet("/transactions", (string customerId, SpendingService service, int limit = 20, int offset = 0,
    string? category = null, string? period = null, string? startDate = null, string? endDate = null, string sortBy = "date_desc") =>
    service.GetTransactions(customerId, limit, offset, category, period, startDate, endDate, sortBy))
    .WithName("GetCustomerTransactions")
    .ProducesProblem(400)
    .ProducesProblem(404)
    .WithOpenApi();
customers.MapGet("/goals", (string customerId, SpendingService service, string? category = null) =>
    service.GetGoals(customerId, category))
    .WithName("GetSpendingGoals")
    .ProducesProblem(400)
    .ProducesProblem(404)
    .WithOpenApi();
customers.MapGet("/filters", (string customerId, SpendingService service) => service.GetFilters(customerId))
    .WithName("GetSpendingFilters")
    .ProducesProblem(404)
    .WithOpenApi();

app.Run();
