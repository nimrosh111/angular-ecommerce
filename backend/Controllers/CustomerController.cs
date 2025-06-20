using System.Security.Claims;
using Authentication.Db;
using Authentication.Entities;
using Authentication.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class CustomerController : ControllerBase
{
    private readonly AppDbContext dbContext;

    public CustomerController(AppDbContext dbContext)
    {
        this.dbContext = dbContext;
    }






    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<IActionResult> GetCustomerById(Guid id)
    {
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

        // Corrected claim name to extract the actual user ID from JWT
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var customer = await dbContext.customers
            .Include(c => c.IdentityUser)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (customer == null)
            return NotFound(new { message = "Customer not found." });

        // Customer can only view their own data (unless they're also Admin)
        if (roles.Contains("Customer") && !roles.Contains("Admin") && currentUserId != id.ToString())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You can only access your own customer data." });
        }

        return Ok(customer);
    }







    // ✅ Admin can view all customers
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllCustomers()
    {
        var customers = await dbContext.customers.ToListAsync();
        return Ok(customers);
    }






    // ✅ Customer can update their own info | Admin can update anyone
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> UpdateCustomer([FromRoute] Guid id, [FromBody] Customer updatedCustomer)
    {
        if (id != updatedCustomer.Id)
        {
            return BadRequest(new { message = "Customer ID mismatch between route and body." });
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(new { message = "Validation failed", errors });
        }

        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (roles.Contains("Customer") && !roles.Contains("Admin") && currentUserId != id.ToString())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "You can only update your own account." });
        }

        var customer = await dbContext.customers.FirstOrDefaultAsync(x => x.Id == id);
        if (customer == null)
        {
            return NotFound(new { message = "Customer not found." });
        }

        customer.Name = updatedCustomer.Name;
        customer.Email = updatedCustomer.Email;
        customer.Username = updatedCustomer.Username;
        customer.Phone = updatedCustomer.Phone;
        customer.Age = updatedCustomer.Age;

        await dbContext.SaveChangesAsync();
        return Ok(customer);
    }











    // ❌ Only Admin can delete a customer
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var customer = await dbContext.customers.FirstOrDefaultAsync(x => x.Id == id);
        if (customer == null)
            return NotFound("Customer not found.");

        dbContext.customers.Remove(customer);
        await dbContext.SaveChangesAsync();
        return Ok(new { message = "Customer deleted successfully." });
    }
}
