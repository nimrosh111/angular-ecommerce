namespace Authentication.Models
{
    public class UpdateQuantity
    {
        public Guid CustomerId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}
