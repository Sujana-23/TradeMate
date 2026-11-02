
namespace backend.models;

public class User
{
    public int UserId { get; set; }
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string? PasswordHash { get; set; }
    public bool TermsAccepted { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}
