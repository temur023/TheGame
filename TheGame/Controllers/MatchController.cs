using Microsoft.AspNetCore.Mvc;
using TheGame.Entities;
using TheGame.Filters;
using TheGame.Services;

namespace TheGame.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchController(IMatchService service):Controller
{
    [HttpGet("get-all")]
    public async Task<IActionResult> GetAll([FromQuery] MatchesFilter filter)
    {
        var response = await service.GetAll(filter);
        if (response.StatusCode != 200)
            return StatusCode(response.StatusCode, response);
        return Ok(response);
    }

    [HttpPost("create")]
    public async Task<IActionResult> Create(Match match)
    {
        var response = await service.Create(match);
        if (response.StatusCode != 200)
            return StatusCode(response.StatusCode, response);
        return Ok(response);
    }

    [HttpPut("join-match")]
    public async Task<IActionResult> JoinMatch(int matchId, int player2Id)
    {
        var response = await service.JoinMatch(matchId, player2Id);
        if (response.StatusCode != 200)
            return StatusCode(response.StatusCode, response);
        return Ok(response);
    }
}