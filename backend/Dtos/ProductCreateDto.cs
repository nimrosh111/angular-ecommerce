namespace Authentication.Dtos
{
    public class ProductCreateDto
    {
        public string Title { get; set; } = "";
        public decimal Price { get; set; }
        public string Description { get; set; } = "";
        public string Category { get; set; } = "";
        public string Image { get; set; } = "";
        public int Quantity { get; set; }
        public decimal Total { get; set; }

    }

}
