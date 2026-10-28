namespace backend.services;
using backend.models;

public class ExchangeRateService {
    
    private readonly HttpClient _httpClient;

    public ExchangeRateService(HttpClient httpClient) {
        _httpClient = httpClient;
    }

    public string GetStatus() {
        return "Exchange rate service is ready";
    }

    public async Task<ExchangeRateResponse> GetRatesAsync() {
        var response = await _httpClient.GetFromJsonAsync<ExchangeRateResponse>("https://open.er-api.com/v6/latest/INR");
        
        if(response is null) {
            throw new Exception("No exchange-rate data recieved.");
        }
        
        return response;
    }

}