
using backend.services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrendsController : ControllerBase
{
    private readonly TrendsService _trendsService;

    public TrendsController(TrendsService trendsService)
    {
        _trendsService = trendsService;
    }

    [HttpGet("historical")]
    public async Task<IActionResult> GetHistoricalRates(
        [FromQuery] string period = "month",
        [FromQuery] string fromCurrency = "USD",
        [FromQuery] string toCurrency = "INR",
        [FromQuery] int? year = null,
        [FromQuery] int? month = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        fromCurrency = fromCurrency.Trim().ToUpperInvariant();
        toCurrency = toCurrency.Trim().ToUpperInvariant();

        if (!IsValidCurrencyCode(fromCurrency) ||
            !IsValidCurrencyCode(toCurrency))
        {
            return BadRequest(new
            {
                message = "Invalid currency code."
            });
        }

        DateTime today = DateTime.UtcNow.Date;

        DateTime start;
        DateTime end;

        if (startDate.HasValue || endDate.HasValue)
        {
            if (!startDate.HasValue || !endDate.HasValue ||
                year.HasValue || month.HasValue)
            {
                return BadRequest(new
                {
                    message = "Provide both startDate and endDate."
                });
            }

            start = startDate.Value.Date;
            end = endDate.Value.Date;
        }
        else if (year.HasValue || month.HasValue)
        {
            if (!year.HasValue || !month.HasValue ||
                year < 1900 || year > today.Year ||
                month < 1 || month > 12)
            {
                return BadRequest(new
                {
                    message = "Provide a valid year and month."
                });
            }

            start = new DateTime(year.Value, month.Value, 1);
            end = start.AddMonths(1).AddDays(-1);
        }
        else
        {
            switch (period.Trim().ToLowerInvariant())
            {
                case "week":
                    start = today.AddDays(-6);
                    end = today;
                    break;

                case "month":
                    start = today.AddMonths(-1);
                    end = today;
                    break;

                case "year":
                    start = today.AddYears(-1);
                    end = today;
                    break;

                default:
                    return BadRequest(new
                    {
                        message = "Period must be week, month or year."
                    });
            }
        }

        if (start > end || end > today)
        {
            return BadRequest(new
            {
                message = "Invalid date range."
            });
        }

        if ((end - start).TotalDays > 3660)
        {
            return BadRequest(new
            {
                message = "Maximum date range is 10 years."
            });
        }

        var rates = await _trendsService.GetHistoricalRatesAsync(
            start,
            end,
            fromCurrency,
            toCurrency
        );

        return Ok(rates);
    }

    private static bool IsValidCurrencyCode(string currency)
    {
        return currency.Length == 3 &&
               currency.All(c => c >= 'A' && c <= 'Z');
    }
}
