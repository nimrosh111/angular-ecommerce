using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Authentication.Db;
using Authentication.Dtos;
using Authentication.Entities;
using Authentication.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Authentication.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _appDbContext;

    public AuthenticationService(UserManager<User> userManager, IConfiguration configuration, AppDbContext appDbContext)
    {
        _userManager = userManager;
        _configuration = configuration;
        _appDbContext = appDbContext;
    }

    public async Task<string> Register(RegisterRequest request, ClaimsPrincipal currentUser)
    {
        var userByEmail = await _userManager.FindByEmailAsync(request.Email);
        var userByUsername = await _userManager.FindByNameAsync(request.Username);

        if (userByEmail is not null || userByUsername is not null)
        {
            throw new ArgumentException($"User with email {request.Email} or username {request.Username} already exists.");
        }

        var identityUser = new User
        {
            Email = request.Email,
            UserName = request.Username,
            SecurityStamp = Guid.NewGuid().ToString()
        };

        var result = await _userManager.CreateAsync(identityUser, request.Password);
        if (!result.Succeeded)
        {
            throw new ArgumentException($"Unable to register user {request.Username}. Errors: {GetErrorsText(result.Errors)}");
        }

        // Always assign Customer role
        await _userManager.AddToRoleAsync(identityUser, "Customer");

        // Check if any admins exist
        var existingAdmins = await _userManager.GetUsersInRoleAsync("Admin");

        if (string.Equals(request.Role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            if (!existingAdmins.Any())
            {
                // First admin ever – allow creation
                await _userManager.AddToRoleAsync(identityUser, "Admin");
            }
            else
            {
                // Only existing Admins can assign Admin role
                var isAdmin = currentUser?.IsInRole("Admin") ?? false;
                if (!isAdmin)
                    throw new UnauthorizedAccessException("Only an admin can assign the Admin role.");

                await _userManager.AddToRoleAsync(identityUser, "Admin");
            }
        }

        return "Registered successfully";
    }

    public async Task<LoginResponse> Login(LoginRequest request)
    {
        var user = await _userManager.FindByNameAsync(request.Username) ??
                   await _userManager.FindByEmailAsync(request.Username);

        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new ArgumentException("Invalid credentials.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Customer";

        // 🔥 Fetch your custom Customer ID from the AppDbContext
        var customer = await _appDbContext.customers
            .FirstOrDefaultAsync(c => c.IdentityUserId == user.Id);

        if (customer == null)
            throw new Exception("Customer not found in DB");

        // ✅ Correctly inject CustomerId into JWT (not Identity user ID)
        var authClaims = new List<Claim>
        {
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, customer.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        authClaims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = GetToken(authClaims);
        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return new LoginResponse
        {
            JwtToken = jwt,
            CustomerId = customer.Id,
            Roles = roles.ToList()
        };
    }

    private JwtSecurityToken GetToken(IEnumerable<Claim> authClaims)
    {
        var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!));

        return new JwtSecurityToken(
            issuer: _configuration["JWT:ValidIssuer"],
            audience: _configuration["JWT:ValidAudience"],
            expires: DateTime.Now.AddHours(3),
            claims: authClaims,
            signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
        );
    }

    private string GetErrorsText(IEnumerable<IdentityError> errors)
    {
        return string.Join(", ", errors.Select(error => error.Description));
    }
}
