using Microsoft.AspNetCore.Mvc;
using TheGame.Entities;
using TheGame.Services;

namespace TheGame.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlayerController(IPlayerService service):Controller
{
    [HttpPost("create")]
    public async Task<IActionResult> Create(Player player)
    {
        var response = await service.Create(player);
        if (response.StatusCode != 200)
            return StatusCode(response.StatusCode, response);
        return Ok(response);
    }
}