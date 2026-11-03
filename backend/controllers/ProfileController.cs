
using System.Security.Claims;
using backend.DTOs;
using backend.services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly ProfileService _profileService;

    public ProfileController(ProfileService profileService)
    {
        _profileService = profileService;
    }

    // GET: api/profile
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        int? userId = GetLoggedInUserId();

        if (userId == null)
            return Unauthorized();

        var profile = await _profileService.GetProfileAsync(
            userId.Value
        );

        if (profile == null)
        {
            return NotFound(new
            {
                message = "User profile not found."
            });
        }

        return Ok(profile);
    }

    // PUT: api/profile
    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileDto request)
    {
        int? userId = GetLoggedInUserId();

        if (userId == null)
            return Unauthorized();

        try
        {
            bool updated = await _profileService.UpdateProfileAsync(
                userId.Value,
                request
            );

            if (!updated)
            {
                return NotFound(new
                {
                    message = "User profile not found."
                });
            }

            var updatedProfile =
                await _profileService.GetProfileAsync(userId.Value);

            return Ok(new
            {
                success = true,
                message = "Profile updated successfully.",
                profile = updatedProfile
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

    // PUT: api/profile/change-password
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordDto request)
    {
        int? userId = GetLoggedInUserId();

        if (userId == null)
            return Unauthorized();

        try
        {
            bool changed =
                await _profileService.ChangePasswordAsync(
                    userId.Value,
                    request
                );

            if (!changed)
            {
                return NotFound(new
                {
                    message = "User not found or password could not be updated."
                });
            }

            return Ok(new
            {
                success = true,
                message = "Password changed successfully."
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET USER ID FROM JWT
    private int? GetLoggedInUserId()
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (!int.TryParse(userIdClaim, out int userId))
            return null;

        return userId;
    }
}
