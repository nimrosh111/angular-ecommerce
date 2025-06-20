using Authentication.Db;
using Authentication.Dtos;
using Authentication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ProAuthentication.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ILogger<ProductController> _logger;

        public ProductController(AppDbContext db, ILogger<ProductController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ✅ View all products with pagination
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _db.Products.ToListAsync();

            if (products == null || !products.Any())
                return NotFound("No products found.");

            return Ok(products);
        }






        // ✅ Add a single product manually (admin only)
        [HttpPost("import-single")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportSingleProduct([FromBody] ProductCreateDto dto)
        {
            if (dto == null)
                return BadRequest("Invalid product data.");

            if (string.IsNullOrEmpty(dto.Title) || dto.Price <= 0 || string.IsNullOrEmpty(dto.Category))
                return BadRequest("Product title, price, and category are required.");

            try
            {
                bool exists = await _db.Products.AnyAsync(p => p.Title == dto.Title);
                if (exists)
                    return Conflict("Product with this title already exists.");

                var product = new Product
                {
                    Title = dto.Title,
                    Price = dto.Price,
                    Description = dto.Description ?? "",
                    Category = dto.Category,
                    Image = dto.Image ?? "",
                    Quantity = dto.Quantity > 0 ? dto.Quantity : 1,
                    Total = dto.Price * (dto.Quantity > 0 ? dto.Quantity : 1)
                };

                // No need to assign Id, EF Core will generate it
                await _db.Products.AddAsync(product);
                await _db.SaveChangesAsync();

                return Ok(product);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, $"EF Save Error: {dbEx.InnerException?.Message ?? dbEx.Message}");
                return StatusCode(500, $"Save error: {dbEx.InnerException?.Message ?? dbEx.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error importing product: {dto.Title}");
                return StatusCode(500, "Unhandled server error");
            }

        }


        // ✅ Update an existing product (admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            if (updatedProduct == null || id != updatedProduct.Id)
                return BadRequest("Invalid product data or ID mismatch.");

            try
            {
                var product = await _db.Products.FindAsync(id);
                if (product == null)
                    return NotFound("Product not found.");

                // Optional: Prevent title duplication on update
                bool duplicateTitle = await _db.Products.AnyAsync(p => p.Title == updatedProduct.Title && p.Id != id);
                if (duplicateTitle)
                    return Conflict("Another product with this title already exists.");

                product.Title = updatedProduct.Title;
                product.Price = updatedProduct.Price;
                product.Description = updatedProduct.Description ?? "";
                product.Category = updatedProduct.Category ?? "Uncategorized";
                product.Image = updatedProduct.Image ?? "";
                product.Quantity = updatedProduct.Quantity;
                product.Total = updatedProduct.Price * updatedProduct.Quantity;

                await _db.SaveChangesAsync();

                return Ok(new { message = "Product updated successfully.", product });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product.");
                return StatusCode(500, "Internal server error");
            }
        }
        [HttpPost("import-all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportAllFromExternalApi()
        {
            using var httpClient = new HttpClient();

            try
            {
                var response = await httpClient.GetAsync("https://fakestoreapi.com/products");
                if (!response.IsSuccessStatusCode)
                    return StatusCode(500, "Failed to fetch products from external API.");

                var content = await response.Content.ReadAsStringAsync();

                var externalProducts = System.Text.Json.JsonSerializer.Deserialize<List<FakeStoreProductDto>>(content, new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (externalProducts == null || !externalProducts.Any())
                    return BadRequest("No products found in external API.");

                int addedCount = 0;

                foreach (var item in externalProducts)
                {
                    bool exists = await _db.Products.AnyAsync(p => p.Title == item.Title);
                    if (!exists)
                    {
                        var product = new Product
                        {
                            Title = item.Title,
                            Price = item.Price,
                            Description = item.Description ?? "",
                            Category = item.Category ?? "Uncategorized",
                            Image = item.Image ?? "",
                            Quantity = 1,
                            Total = item.Price
                        };

                        await _db.Products.AddAsync(product);
                        addedCount++;
                    }
                }

                await _db.SaveChangesAsync();
                return Ok($"{addedCount} products imported successfully.");
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Error saving imported products.");
                return StatusCode(500, "Database save error: " + dbEx.InnerException?.Message ?? dbEx.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in ImportAllFromExternalApi");
                return StatusCode(500, $"Unhandled server error: {ex.Message}");
            }
        }


        // ✅ Delete a product (admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _db.Products.FindAsync(id);
                if (product == null)
                    return NotFound("Product not found.");

                _db.Products.Remove(product);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Product deleted successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting product with ID {id}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
