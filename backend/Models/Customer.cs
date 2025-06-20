using Authentication.Entities;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class Customer
{
    [Key]
    public Guid Id { get; set; }

    public string? Name { get; set; }       // ✅ Nullable
    public string Email { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string? Phone { get; set; }      // ✅ Nullable
    public string? Age { get; set; }        // ✅ Nullable

    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpires { get; set; }

    [Required]
    public string IdentityUserId { get; set; } = null!;

    [ForeignKey("IdentityUserId")]
    public User IdentityUser { get; set; } = null!;
}
