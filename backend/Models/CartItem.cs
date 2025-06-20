namespace Authentication.Models;
public class CartItem
{
    public int Id { get; set; } // Auto-increment
    public int ProductId { get; set; }

    public Guid CustomerId { get; set; }

    public string Title { get; set; }
    public string Description { get; set; }
    public string Image { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Total { get; set; }
}

