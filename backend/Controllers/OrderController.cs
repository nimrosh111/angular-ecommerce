using Authentication.Db;
using Authentication.Dtos;
using Authentication.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Authentication.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly AppDbContext _db;

        public OrderController(AppDbContext db)
        {
            _db = db;
        }


        [HttpPost("save")]
        public async Task<IActionResult> SaveOrder([FromBody] List<CartItemDto> cartItems)
        {
            try
            {
                if (cartItems == null || !cartItems.Any())
                    return BadRequest("Cart is empty");

                Console.WriteLine("🔥 Incoming cart items:");
                foreach (var item in cartItems)
                {
                    Console.WriteLine($"Title: {item.Title}, Quantity: {item.Quantity}, CustomerId: {item.CustomerId}");
                }

                var customerId = cartItems.First().CustomerId;

                var order = new Order
                {
                    CustomerId = customerId,
                    Items = cartItems.Select(item => new OrderItem
                    {
                        Title = item.Title,
                        Description = item.Description,
                        Image = item.Image,
                        Quantity = item.Quantity,
                        Price = item.Price,
                        Total = item.Total
                    }).ToList()
                };

                await _db.Orders.AddAsync(order);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Order placed successfully", orderId = order.Id });
            }
            catch (Exception ex)
            {
                Console.WriteLine("🔥 SaveOrder ERROR:", ex.Message);
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }



    }
}
