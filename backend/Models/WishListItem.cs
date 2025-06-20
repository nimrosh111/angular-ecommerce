using System.ComponentModel.DataAnnotations;

namespace Authentication.Models
{
    public class WishListItem
    {
        [Key]
        public int Id { get; set; }

        public Guid CustomerId { get; set; }

        public int ProductId { get; set; }

        public string Image { get; set; } = "";

        public string Title { get; set; } = "";

        public string Description { get; set; } = "";

        public decimal Price { get; set; }
    }
}
