using Capitec.Api.Services;
using Capitec.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
    options.SwaggerDoc("v1", new() { Title = "Capitec Demo API", Version = "v1" }));
builder.Services.AddSingleton<LoanService>();

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

app.Run();
