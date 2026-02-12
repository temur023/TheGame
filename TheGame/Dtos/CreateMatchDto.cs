using TheGame.Entities;

namespace TheGame.Dtos;

public class CreateMatchDto
{
    public int Player1Id { get; set; }
    public string CurrentPlayerName { get; set; } = "";
    public int CurrentPlayerId { get; set; }
    public string? MatchPassword { get; set; } = null;
}