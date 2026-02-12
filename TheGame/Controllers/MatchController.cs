using Microsoft.AspNetCore.Mvc;
using TheGame.Dtos;
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
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var response = await service.GetById(id); 
        
        if (response.StatusCode != 200)
            return StatusCode(response.StatusCode, response);
            
        return Ok(response);
    }
    
    [HttpPost("create")]
    public async Task<IActionResult> Create([FromBody] CreateMatchDto match)
    {
        var response = await service.Create(match);
        if (response.StatusCode != 200)
            return StatusCode(response.StatusCode, response);
        return Ok(response);
    }

    [HttpPut("join-match")]
    public async Task<IActionResult> JoinMatch([FromBody] JoinMatchDto dto)
    {
        var response = await service.JoinMatch(dto);
        if (response.StatusCode != 200)
            return StatusCode(response.StatusCode, response);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMatch(int id)
    {
        var response = await service.Delete(id);
        if (response.StatusCode != 200)
            return StatusCode(response.StatusCode, response);
        return Ok(response);
    }
    [HttpGet("leaderboard")]
    public async Task<IActionResult> GetLeaderboard()
    {
        var response = await service.Leaderboard();
        if (response.StatusCode != 200)
            return StatusCode(response.StatusCode, response);
        return Ok(response);
    }
    
}