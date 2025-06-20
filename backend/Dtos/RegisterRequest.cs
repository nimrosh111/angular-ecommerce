using System.ComponentModel.DataAnnotations;

namespace Authentication.Dtos
{
    public class RegisterRequest
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }

        [RegularExpression("^(Admin|Customer)$", ErrorMessage = "Role must be either 'Admin' or 'Customer'.")]
        public string? Role { get; set; } = "Customer";
    }
}
