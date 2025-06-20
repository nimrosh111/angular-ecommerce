namespace Authentication.Dtos
{
    public class FakeStoreProductDto
    {
        public int Id { get; set; } // Will be ignored
        public string Title { get; set; } = "";
        public decimal Price { get; set; }
        public string Description { get; set; } = "";
        public string Category { get; set; } = "";
        public string Image { get; set; } = "";
    }
}
