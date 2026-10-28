namespace backend.models;

public class ExchangeRateResponse {
    public string? result{get;set;}
    public string? base_code{get;set;}
    public long? time_last_update_unix {get;set;}
    public Dictionary<string,decimal>? rates{get;set;}
}