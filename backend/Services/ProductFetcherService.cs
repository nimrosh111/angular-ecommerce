using Authentication.Models;


namespace ProductImportApi.Services;

public class ProductFetcherService
{
    private readonly HttpClient _http;

    public ProductFetcherService(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<Product>> FetchProductsFromFakeApiAsync()
    {
        var products = await _http.GetFromJsonAsync<List<Product>>("https://fakestoreapi.com/products");
        return products ?? new List<Product>();
    }
}
