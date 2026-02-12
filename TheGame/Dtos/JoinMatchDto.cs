using TheGame.Responses;

namespace TheGame.Dtos;

public class JoinMatchDto
{
    public int MatchId { get; set; }
    public int Player2Id { get; set; }
    public string? Password { get; set; } = null;
}