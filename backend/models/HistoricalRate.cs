
namespace backend.models;

public class HistoricalRate
{
    public DateTime RateDate { get; set; }

    public string CurrencyCode { get; set; } = "";

    public decimal Rate { get; set; }

    public string? Source { get; set; }
}
