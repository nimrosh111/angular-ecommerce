namespace Authentication.Dtos
{
    public class CartItemDto
    {
        public int ProductId { get; set; }         
        public string Title { get; set; }
        public string Description { get; set; }
        public string Image { get; set; }

        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
        public Guid CustomerId { get; set; }
    }
}
