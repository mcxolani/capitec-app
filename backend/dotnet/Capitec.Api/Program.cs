var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
    options.SwaggerDoc("v1", new() { Title = "Capitec Demo API", Version = "v1" }));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options => options.RouteTemplate = "openapi/{documentName}.json");
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "Capitec Demo API v1"));
}

app.MapGroup("/api")
    .MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .WithName("GetHealth")
    .WithTags("Health")
    .WithOpenApi();

app.Run();
