using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Authentication.Dtos;



namespace Authentication.Services;

public interface IAuthenticationService
{
    Task<string> Register(Dtos.RegisterRequest request, ClaimsPrincipal currentUser);
    Task<LoginResponse> Login(LoginRequest request);
}
