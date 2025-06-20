using Authentication.Db;
using Authentication.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Authentication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/wishlist/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToWishlist([FromBody] WishListItem item)
        {
            try
            {
                if (item == null || item.CustomerId == Guid.Empty)
                    return BadRequest("Invalid wishlist item.");

                var exists = await _context.WishlistItems
                    .AnyAsync(w => w.ProductId == item.ProductId && w.CustomerId == item.CustomerId);

                if (exists)
                    return Conflict("Item already in wishlist.");

                await _context.WishlistItems.AddAsync(item);
                await _context.SaveChangesAsync();

                return Ok("Item added to wishlist.");
            }
            catch (Exception ex)
            {
                // Log the error (optional)
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/wishlist/{customerId}
        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetWishlist(Guid customerId)
        {
            var items = await _context.WishlistItems
                .Where(w => w.CustomerId == customerId)
                .ToListAsync();

            return Ok(items);
        }

        // DELETE: api/wishlist/product/{productId}/{customerId}
        [HttpDelete("product/{productId}/{customerId}")]
        public async Task<IActionResult> RemoveFromWishlist(int productId, Guid customerId)
        {
            var item = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.ProductId == productId && w.CustomerId == customerId);

            if (item == null)
                return NotFound("Item not found in wishlist.");

            _context.WishlistItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok("Item removed from wishlist.");
        }

        // DELETE: api/wishlist/clear/{customerId}
        [HttpDelete("clear/{customerId}")]
        public async Task<IActionResult> ClearWishlist(Guid customerId)
        {
            var items = await _context.WishlistItems
                .Where(w => w.CustomerId == customerId)
                .ToListAsync();

            _context.WishlistItems.RemoveRange(items);
            await _context.SaveChangesAsync();

            return Ok("Wishlist cleared.");
        }
    }
}
