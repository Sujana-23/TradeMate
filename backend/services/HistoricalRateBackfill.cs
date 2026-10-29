
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Data.SqlClient;
using System.Data;

public class HistoricalRateBackfill
{
    private readonly HttpClient _http;
    private readonly string _connectionString;

    private readonly string[] _currencies =
    {
        "USD", "EUR", "GBP", "AED", "JPY",
        "AUD", "CAD", "SGD", "CHF"
    };

    public HistoricalRateBackfill(
        HttpClient http,
        IConfiguration configuration)
    {
        _http = http;
        _connectionString =
            configuration.GetConnectionString("TradeMate")
            ?? throw new Exception("TradeMate connection string missing.");
    }

    public async Task RunAsync()
    {
        var endDate = DateTime.UtcNow.Date;
        var startDate = endDate.AddYears(-1);

        var from = startDate.ToString("yyyy-MM-dd");
        var to = endDate.ToString("yyyy-MM-dd");

        var rates = new List<RateRow>();

        foreach (var currency in _currencies)
        {
            var url =
                $"https://api.frankfurter.dev/v2/rates" +
                $"?base={currency}&quotes=INR&from={from}&to={to}";

            Console.WriteLine($"Fetching {currency}...");

            var response = await _http.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            var records =
                JsonSerializer.Deserialize<List<ApiRate>>(json)
                ?? new List<ApiRate>();

            foreach (var record in records)
            {
                if (record.Base != currency ||
                    record.Quote != "INR" ||
                    record.Rate <= 0)
                    continue;

                rates.Add(new RateRow(
                    DateTime.ParseExact(
                        record.Date, "yyyy-MM-dd",
                        CultureInfo.InvariantCulture),
                    currency,
                    record.Rate));
            }
        }

        // INR is always worth 1 INR.
        var dates = rates.Select(r => r.Date).Distinct().ToList();

        foreach (var date in dates)
            rates.Add(new RateRow(date, "INR", 1m));

        await using var connection =
            new SqlConnection(_connectionString);

        await connection.OpenAsync();

        await using var transaction =
            (SqlTransaction)await connection.BeginTransactionAsync();

        try
        {
            foreach (var item in rates)
            {
                const string sql = """
                    IF EXISTS (
                        SELECT 1 FROM dbo.ExchangeRates
                        WHERE RateDate = @Date
                          AND CurrencyCode = @Currency
                    )
                        UPDATE dbo.ExchangeRates
                        SET Rate = @Rate,
                            Source = 'Frankfurter',
                            FetchedAt = SYSUTCDATETIME()
                        WHERE RateDate = @Date
                          AND CurrencyCode = @Currency
                    ELSE
                        INSERT INTO dbo.ExchangeRates
                            (RateDate, CurrencyCode, Rate, Source)
                        VALUES
                            (@Date, @Currency, @Rate, 'Frankfurter');
                    """;

                await using var command =
                    new SqlCommand(sql, connection, transaction);

                command.Parameters.Add("@Date", SqlDbType.Date)
                    .Value = item.Date;
                command.Parameters.Add("@Currency", SqlDbType.Char, 3)
                    .Value = item.Currency;

                var rateParameter =
                    command.Parameters.Add("@Rate", SqlDbType.Decimal);
                rateParameter.Precision = 19;
                rateParameter.Scale = 10;
                rateParameter.Value = item.Rate;

                await command.ExecuteNonQueryAsync();
            }

            await transaction.CommitAsync();

            Console.WriteLine(
                $"Backfill completed. Saved {rates.Count} observations.");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private class ApiRate
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

    private record RateRow(DateTime Date, string Currency, decimal Rate);
}
