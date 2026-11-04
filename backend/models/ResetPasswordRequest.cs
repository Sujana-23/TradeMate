using System.ComponentModel.DataAnnotations;

namespace backend.models;

public class ResetPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string VerificationToken { get; set; } = "";

    [Required]
    [MinLength(8)]
    public string NewPassword { get; set; } = "";

    [Required]
    public string ConfirmPassword { get; set; } = "";
}
