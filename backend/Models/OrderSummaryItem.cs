using Authentication.Models;

public class OrderSummaryItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid OrderSummaryId { get; set; }
    public OrderSummaryModel OrderSummary { get; set; }

    public string Title { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
}
