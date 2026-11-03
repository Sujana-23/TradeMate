using System.Text;
using backend.services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Existing services
builder.Services.AddHttpClient();
builder.Services.AddHttpClient<ExchangeRateService>();
builder.Services.AddHttpClient<HistoricalRateBackfill>();

// Authentication service
builder.Services.AddScoped<AuthService>();

builder.Services.AddScoped<TrendsService>();
builder.Services.AddScoped<ProfileService>();

// JWT authentication
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new Exception("JWT key missing.");

builder.Services.AddAuthentication(
    JwtBearerDefaults.AuthenticationScheme
)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        )
    };
});

builder.Services.AddAuthorization();

// CORS
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

app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// Existing exchange-rate endpoint - unchanged
app.MapGet("/", () => "TradeMate API is running");

app.MapGet("/api/exchangerates", async (ExchangeRateService service) =>
{
    var rates = await service.GetRatesAsync();
    return rates;
});

// Existing backfill functionality
if (args.Contains("--backfill-rates"))
{
    await app.Services
        .GetRequiredService<HistoricalRateBackfill>()
        .RunAsync();

    return;
}

app.Run();
