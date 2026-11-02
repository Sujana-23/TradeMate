
using System.ComponentModel.DataAnnotations;

namespace backend.models;

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    public string? Phone { get; set; }

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = "";

    [Required]
    public string ConfirmPassword { get; set; } = "";

    public bool TermsAccepted { get; set; }
}
