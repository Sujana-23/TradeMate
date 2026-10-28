using backend.services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient();
builder.Services.AddHttpClient<ExchangeRateService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowReactApp");

app.MapGet("/", () => "TradeMate API is running");
app.MapGet("/api/exchangerates", async (ExchangeRateService service) => await service.GetRatesAsync());
app.Run();