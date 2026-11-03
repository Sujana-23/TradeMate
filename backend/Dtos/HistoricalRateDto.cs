
namespace backend.DTOs;

public class HistoricalRateDto
{
    public DateTime Date { get; set; }

    public string FromCurrency { get; set; } = "";

    public string ToCurrency { get; set; } = "";

    public decimal Rate { get; set; }
}
