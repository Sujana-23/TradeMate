
using System.ComponentModel.DataAnnotations;

namespace backend.models;

public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";
}
