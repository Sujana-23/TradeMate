
using System.ComponentModel.DataAnnotations;

namespace backend.models;

public class VerifyResetOtpRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    [RegularExpression(@"^\d{6}$")]
    public string Otp { get; set; } = "";
}
