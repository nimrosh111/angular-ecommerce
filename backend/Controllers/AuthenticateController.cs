using Authentication.Db;
using Authentication.Dtos;
using Authentication.Entities;
using Authentication.Models;
using Authentication.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthenticationApi.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly IAuthenticationService _authenticationService;
    private readonly AppDbContext _dbContext;
    private readonly UserManager<User> _userManager;

    public UserController(AppDbContext dbContext, IAuthenticationService authenticationService, UserManager<User> userManager)
    {
        _authenticationService = authenticationService;
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authenticationService.Login(request);
        return Ok(response);
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // ✅ Check if customer already exists
        var existing = await _dbContext.customers
            .FirstOrDefaultAsync(c => c.Email == request.Email || c.Username == request.Username);

        if (existing != null)
            return BadRequest("Customer already exists.");

        // ✅ Call AuthenticationService to register Identity user and assign roles
        var resultMessage = await _authenticationService.Register(request, HttpContext.User);

        // ✅ Create associated Customer record
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return BadRequest("User creation failed in Identity.");

        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            Username = request.Username,
            IdentityUserId = user.Id,
            Name = null,
            Phone = null,
            Age = null
        };

        await _dbContext.customers.AddAsync(customer);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = resultMessage, customer });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var customer = await _dbContext.customers.FirstOrDefaultAsync(c => c.Email == request.Email);
        if (customer == null)
            return BadRequest("Customer with this email does not exist.");

        var token = Guid.NewGuid().ToString();
        customer.ResetToken = token;
        customer.ResetTokenExpires = DateTime.UtcNow.AddMinutes(30);

        await _dbContext.SaveChangesAsync();

        // In production, send via email
        return Ok(new { message = "Reset token generated", token });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var customer = await _dbContext.customers.FirstOrDefaultAsync(c =>
            c.Email == request.Email &&
            c.ResetToken == request.Token &&
            c.ResetTokenExpires > DateTime.UtcNow);

        if (customer == null)
            return BadRequest("Invalid or expired reset token.");

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            return NotFound("User not found.");

        var removePassword = await _userManager.RemovePasswordAsync(user); // optional
        var addPassword = await _userManager.AddPasswordAsync(user, request.NewPassword);

        if (!addPassword.Succeeded)
            return BadRequest("Failed to reset password.");

        customer.ResetToken = null;
        customer.ResetTokenExpires = null;

        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Password reset successfully." });
    }
}
