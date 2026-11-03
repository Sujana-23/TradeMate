
using System.Text;
using backend.models;
using backend.services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Memory Cache for OTP and verification tokens
builder.Services.AddMemoryCache();

// Existing HTTP clients
builder.Services.AddHttpClient();
builder.Services.AddHttpClient<ExchangeRateService>();
builder.Services.AddHttpClient<HistoricalRateBackfill>();

// Authentication service
builder.Services.AddScoped<AuthService>();

// Other existing services
builder.Services.AddScoped<TrendsService>();
builder.Services.AddScoped<ProfileService>();

// Email configuration
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings")
);

// Email service
builder.Services.AddScoped<IEmailService, EmailService>();

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

// Authorization
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

// Middleware
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// Root endpoint
app.MapGet("/", () => "TradeMate API is running");

// Exchange rates endpoint
app.MapGet("/api/exchangerates", async (ExchangeRateService service) =>
{
    var rates = await service.GetRatesAsync();
    return rates;
});

// Historical rate backfill
if (args.Contains("--backfill-rates"))
{
    await app.Services
        .GetRequiredService<HistoricalRateBackfill>()
        .RunAsync();

    return;
}

app.Run();
