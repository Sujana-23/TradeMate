
namespace backend.DTOs;

public class ProfileResponseDto
{
    public string Email { get; set; } = "";

    public string? Phone { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool TermsAccepted { get; set; }
}
