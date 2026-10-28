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
app.MapGet("/api/exchangerates", async (ExchangeRateService service) => {
    Console.WriteLine("API CALLED: /api/exchangerates");

    var rates = await service.GetRatesAsync();

    Console.WriteLine("Exchange rates fetched successfully.");

    return rates;
});
app.Run();