
using System.Data;
using backend.DTOs;
using Microsoft.Data.SqlClient;

namespace backend.services;

public class TrendsService
{
    private readonly string _connectionString;

    public TrendsService(IConfiguration configuration)
    {
        _connectionString =
            configuration.GetConnectionString("TradeMate")
            ?? throw new Exception("TradeMate connection string missing.");
    }

    public async Task<List<HistoricalRateDto>> GetHistoricalRatesAsync(
        DateTime startDate,
        DateTime endDate,
        string fromCurrency,
        string toCurrency)
    {
        var ratesByDate =
            new Dictionary<DateTime, Dictionary<string, decimal>>();

        await using var connection =
            new SqlConnection(_connectionString);

        await connection.OpenAsync();

        const string sql = """
            SELECT RateDate, CurrencyCode, Rate
            FROM dbo.ExchangeRates
            WHERE RateDate >= @StartDate
              AND RateDate < @EndDateExclusive
              AND CurrencyCode IN (@FromCurrency, @ToCurrency)
            ORDER BY RateDate ASC;
            """;

        await using var command = new SqlCommand(sql, connection);

        command.Parameters.Add("@StartDate", SqlDbType.Date)
            .Value = startDate.Date;

        command.Parameters.Add("@EndDateExclusive", SqlDbType.Date)
            .Value = endDate.Date.AddDays(1);

        command.Parameters.Add("@FromCurrency", SqlDbType.Char, 3)
            .Value = fromCurrency;

        command.Parameters.Add("@ToCurrency", SqlDbType.Char, 3)
            .Value = toCurrency;

        await using var reader = await command.ExecuteReaderAsync();

        while (await reader.ReadAsync())
        {
            DateTime date = reader.GetDateTime(0).Date;
            string currency = reader.GetString(1).Trim();
            decimal rate = reader.GetDecimal(2);

            if (!ratesByDate.ContainsKey(date))
            {
                ratesByDate[date] =
                    new Dictionary<string, decimal>();
            }

            ratesByDate[date][currency] = rate;
        }

        var result = new List<HistoricalRateDto>();

        foreach (var item in ratesByDate.OrderBy(x => x.Key))
        {
            decimal fromRate;
            decimal toRate;

            if (fromCurrency == "INR")
                fromRate = 1m;
            else if (!item.Value.TryGetValue(fromCurrency, out fromRate))
                continue;

            if (toCurrency == "INR")
                toRate = 1m;
            else if (!item.Value.TryGetValue(toCurrency, out toRate))
                continue;

            if (fromRate <= 0 || toRate <= 0)
                continue;

            result.Add(new HistoricalRateDto
            {
                Date = item.Key,
                FromCurrency = fromCurrency,
                ToCurrency = toCurrency,
                Rate = Math.Round(fromRate / toRate, 10)
            });
        }

        return result;
    }
}
