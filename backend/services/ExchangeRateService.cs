
using System.Globalization;
using System.Text.Json.Serialization;
using System.Data;
using backend.models;
using Microsoft.Data.SqlClient;

namespace backend.services;

public class ExchangeRateService
{
    private readonly HttpClient _httpClient;
    private readonly string _connectionString;

    private readonly string[] _currencies =
    {
        "USD", "EUR", "GBP", "AED", "JPY",
        "AUD", "CAD", "SGD", "CHF"
    };

    public ExchangeRateService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _connectionString =
            configuration.GetConnectionString("TradeMate")
            ?? throw new Exception("TradeMate connection string missing.");
    }

    public string GetStatus() => "Exchange rate service is ready";

    public async Task<ExchangeRateResponse> GetRatesAsync()
    {
        await SyncMissingRatesAsync();

        var rates = new Dictionary<string, decimal>
        {
            ["INR"] = 1m
        };

        long? latestTimestamp = null;

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        const string sql = """
            SELECT CurrencyCode, Rate, RateDate
            FROM dbo.ExchangeRates e
            WHERE RateDate = (
                SELECT MAX(RateDate)
                FROM dbo.ExchangeRates
                WHERE CurrencyCode = e.CurrencyCode
            );
            """;

        await using var command = new SqlCommand(sql, connection);
        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            var currency = reader.GetString(0).Trim();
            rates[currency] = reader.GetDecimal(1);

            var timestamp = new DateTimeOffset(
                DateTime.SpecifyKind(
                    reader.GetDateTime(2), DateTimeKind.Utc))
                .ToUnixTimeSeconds();

            if (latestTimestamp == null || timestamp > latestTimestamp)
                latestTimestamp = timestamp;
        }

        return new ExchangeRateResponse
        {
            result = "success",
            base_code = "INR",
            time_last_update_unix = latestTimestamp,
            rates = rates
        };
    }

    private async Task SyncMissingRatesAsync()
    {
        var today = DateTime.UtcNow.Date;

        await using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();

        foreach (var currency in _currencies)
        {
            const string latestSql = """
                SELECT MAX(RateDate)
                FROM dbo.ExchangeRates
                WHERE CurrencyCode = @Currency;
                """;

            await using var command = new SqlCommand(latestSql, connection);
            command.Parameters.Add("@Currency", SqlDbType.Char, 3).Value = currency;

            var result = await command.ExecuteScalarAsync();

            var lastDate = result == null || result == DBNull.Value
                ? today.AddYears(-1)
                : Convert.ToDateTime(result).Date;

            if (lastDate >= today)
                continue;

            var from = lastDate.AddDays(1).ToString("yyyy-MM-dd");
            var to = today.ToString("yyyy-MM-dd");

            var url =
                $"https://api.frankfurter.dev/v2/rates" +
                $"?base={currency}&quotes=INR&from={from}&to={to}";

            var records =
                await _httpClient.GetFromJsonAsync<List<FrankfurterRate>>(url);

            if (records == null)
                continue;

            foreach (var record in records)
            {
                if (record.Base != currency ||
                    record.Quote != "INR" ||
                    record.Rate <= 0)
                    continue;

                var date = DateTime.ParseExact(
                    record.Date, "yyyy-MM-dd",
                    CultureInfo.InvariantCulture);

                await SaveRateAsync(connection, date, currency, record.Rate);
                await SaveRateAsync(connection, date, "INR", 1m);
            }
        }
    }

    private static async Task SaveRateAsync(
        SqlConnection connection,
        DateTime date,
        string currency,
        decimal rate)
    {
        const string sql = """
            IF EXISTS (
                SELECT 1 FROM dbo.ExchangeRates
                WHERE RateDate = @Date AND CurrencyCode = @Currency
            )
                UPDATE dbo.ExchangeRates
                SET Rate = @Rate,
                    Source = 'Frankfurter',
                    FetchedAt = SYSUTCDATETIME()
                WHERE RateDate = @Date AND CurrencyCode = @Currency;
            ELSE
                INSERT INTO dbo.ExchangeRates
                    (RateDate, CurrencyCode, Rate, Source)
                VALUES
                    (@Date, @Currency, @Rate, 'Frankfurter');
            """;

        await using var command = new SqlCommand(sql, connection);
        command.Parameters.Add("@Date", SqlDbType.Date).Value = date;
        command.Parameters.Add("@Currency", SqlDbType.Char, 3).Value = currency;

        var parameter = command.Parameters.Add("@Rate", SqlDbType.Decimal);
        parameter.Precision = 19;
        parameter.Scale = 10;
        parameter.Value = rate;

        await command.ExecuteNonQueryAsync();
    }

    private sealed class FrankfurterRate
    {
        [JsonPropertyName("date")]
        public string Date { get; set; } = "";

        [JsonPropertyName("base")]
        public string Base { get; set; } = "";

        [JsonPropertyName("quote")]
        public string Quote { get; set; } = "";

        [JsonPropertyName("rate")]
        public decimal Rate { get; set; }
    }
}
