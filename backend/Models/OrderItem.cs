using Authentication.Models;

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid OrderId { get; set; }
    public Order Order { get; set; }

    public Guid? OrderSummaryId { get; set; } // ✅ make nullable if unused
    public OrderSummaryModel? OrderSummary { get; set; }

    public string Title { get; set; }
    public string Description { get; set; }
    public string Image { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }
}
