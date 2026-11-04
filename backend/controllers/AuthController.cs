using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.models;
using backend.services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly IConfiguration _configuration;

    public AuthController(
        AuthService authService,
        IConfiguration configuration)
    {
        _authService = authService;
        _configuration = configuration;
    }

    // SEND OTP
    [HttpPost("send-otp")]
    public async Task<IActionResult> SendOtp(SendOtpRequest request)
    {
        try
        {
            await _authService.SendOtpAsync(request.Email);

            return Ok(new
            {
                success = true,
                message = "OTP sent successfully. Please check your email."
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                message = "Unable to send OTP. Please try again later."
            });
        }
    }

    // VERIFY REGISTRATION OTP
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp(VerifyOtpRequest request)
    {
        try
        {
            var verificationToken = await _authService.VerifyOtpAsync(
                request.Email,
                request.Otp
            );

            return Ok(new
            {
                success = true,
                message = "Email verified successfully.",
                verificationToken
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // REGISTER
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        try
        {
            var user = await _authService.RegisterAsync(request);

            return Ok(new
            {
                success = true,
                message = "Registration successful.",
                userId = user.UserId,
                email = user.Email
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    // LOGIN
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _authService.LoginAsync(request);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            success = true,
            message = "Login successful.",
            token,
            user = new
            {
                user.UserId,
                user.Email,
                user.Phone
            }
        });
    }

    // FORGOT PASSWORD - SEND RESET OTP
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        ForgotPasswordRequest request)
    {
        try
        {
            await _authService.ForgotPasswordAsync(request.Email);

            return Ok(new
            {
                success = true,
                message = "Password reset OTP sent to your email."
            });
        }
        catch (ArgumentException)
        {
            return Ok(new
            {
                success = true,
                message = "If the account exists, a password reset OTP will be sent to your email."
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Unable to process request. Please try again later."
            });
        }
    }

    // VERIFY PASSWORD RESET OTP
    [HttpPost("verify-reset-otp")]
    public async Task<IActionResult> VerifyResetOtp(
        VerifyResetOtpRequest request)
    {
        try
        {
            var verificationToken =
                await _authService.VerifyPasswordResetOtpAsync(
                    request.Email,
                    request.Otp
                );

            return Ok(new
            {
                success = true,
                message = "OTP verified successfully.",
                verificationToken
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Unable to verify OTP. Please try again later."
            });
        }
    }

    // RESET PASSWORD
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        ResetPasswordRequest request)
    {
        try
        {
            await _authService.ResetPasswordAsync(request);

            return Ok(new
            {
                success = true,
                message = "Password reset successfully."
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception)
        {
            return StatusCode(500, new
            {
                success = false,
                message = "Unable to reset password. Please try again later."
            });
        }
    }

    // GENERATE JWT
    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        var key = jwtSettings["Key"]
            ?? throw new InvalidOperationException("JWT key missing.");

        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        );

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
