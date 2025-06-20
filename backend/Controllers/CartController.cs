using Authentication.Db;
using Authentication.Dtos;
using Authentication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Authentication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Customer")]  // Only Customers allowed
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CartController> _logger;

        public CartController(AppDbContext context, ILogger<CartController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private Guid GetCustomerId()
        {
            var customerIdClaim = User.FindFirst("CustomerId")?.Value
                               ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                               ?? User.FindFirst("sub")?.Value;

            _logger.LogInformation("Extracted CustomerId: {CustomerId}", customerIdClaim);

            if (string.IsNullOrWhiteSpace(customerIdClaim) || !Guid.TryParse(customerIdClaim, out var customerId))
            {
                _logger.LogWarning("Invalid or missing Customer ID claim: {Claim}", customerIdClaim);
                return Guid.Empty;
            }

            return customerId;
        }





        // GET: api/cart
        [HttpGet]
        public async Task<IActionResult> GetMyCart()
        {
            var customerId = GetCustomerId();
            if (customerId == Guid.Empty)
                return Unauthorized();

            var cart = await _context.CartItems
                .Where(c => c.CustomerId == customerId)
                .ToListAsync();

            return Ok(cart);
        }

        [HttpPost("save")]
        public async Task<IActionResult> SaveCart([FromBody] List<CartItemDto> cartItemDtos)
        {
            var customerId = GetCustomerId();
            if (customerId == Guid.Empty)
                return Unauthorized();

            if (cartItemDtos == null || !cartItemDtos.Any())
                return BadRequest("Cart is empty");

            try
            {
                // ✅ Collect all unique product IDs from the cart
                var productIds = cartItemDtos.Select(dto => dto.ProductId).ToList();

                // ✅ Get existing products in bulk
                var existingProducts = await _context.Products
                    .Where(p => productIds.Contains(p.Id))
                    .Select(p => p.Id)
                    .ToListAsync();

                var newProducts = new List<Product>();
                var cartItems = new List<CartItem>();

                foreach (var dto in cartItemDtos)
                {
                    // Add only if the product doesn't already exist
                    if (!existingProducts.Contains(dto.ProductId))
                    {
                        newProducts.Add(new Product
                        {
                            Id = dto.ProductId,
                            Title = dto.Title,
                            Description = dto.Description,
                            Image = dto.Image,
                            Price = dto.Price,
                            Quantity = dto.Quantity,
                            Total = dto.Total
                        });
                    }

                    // Add cart item regardless
                    cartItems.Add(new CartItem
                    {
                        ProductId = dto.ProductId,
                        Title = dto.Title,
                        Description = dto.Description,
                        Image = dto.Image,
                        Quantity = dto.Quantity,
                        Price = dto.Price,
                        Total = dto.Total,
                        CustomerId = customerId
                    });
                }

                // ✅ Save new products (if any)
                if (newProducts.Any())
                    await _context.Products.AddRangeAsync(newProducts);

                // ✅ Save cart items
                await _context.CartItems.AddRangeAsync(cartItems);

                // ✅ One SaveChanges to improve performance
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cart saved successfully", count = cartItems.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving cart to database.");
                return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
            }
        }




        [HttpDelete("product/{productId}")]
        public async Task<IActionResult> DeleteProductFromCart(int productId)
        {
            var customerId = GetCustomerId();
            if (customerId == Guid.Empty)
                return Unauthorized();

            _logger.LogInformation("DeleteProductFromCart called with productId={ProductId} for customerId={CustomerId}", productId, customerId);

            var matchingItems = await _context.CartItems
                .Where(ci => ci.ProductId == productId && ci.CustomerId == customerId)
                .ToListAsync();

            if (!matchingItems.Any())
            {
                _logger.LogWarning("No cart items found for productId={ProductId}, customerId={CustomerId}", productId, customerId);
                return NotFound("Item not found.");
            }

            _context.CartItems.RemoveRange(matchingItems);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted {Count} cart items for productId={ProductId}, customerId={CustomerId}", matchingItems.Count, productId, customerId);

            return Ok(new { message = "Item(s) removed from cart.", count = matchingItems.Count });
        }









        // DELETE: api/cart/clear
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var customerId = GetCustomerId();
            _logger.LogInformation("ClearCart called by CustomerId: {CustomerId}", customerId);

            if (customerId == Guid.Empty)
            {
                _logger.LogWarning("Unauthorized ClearCart attempt: CustomerId is empty");
                return Unauthorized();
            }

            try
            {
                var items = await _context.CartItems
                    .Where(c => c.CustomerId == customerId)
                    .ToListAsync();

                if (!items.Any())
                    return NotFound("Cart is already empty.");

                _context.CartItems.RemoveRange(items);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Cart cleared." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing cart.");
                return StatusCode(500, "An error occurred while clearing the cart.");
            }
        }


        // PUT: api/cart/update-quantity
        [HttpPut("update-quantity")]
        public async Task<IActionResult> UpdateQuantity([FromBody] UpdateQuantity request)
        {
            var customerId = GetCustomerId();
            if (customerId == Guid.Empty)
                return Unauthorized();

            var item = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.ProductId == request.ProductId && ci.CustomerId == customerId);

            if (item == null)
                return NotFound("Item not found in cart.");

            item.Quantity = request.Quantity;
            item.Total = item.Price * request.Quantity;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Quantity updated." });

        }
    }
}
