namespace TheGame.Entities;

public class Match
{
    public int Id { get; set; }
    public Player Player1 { get; set; } = new Player();
    public int Player1Id { get; set; }
    public Player Player2 { get; set; } = new Player();
    public int? Player2Id { get; set; }
    public int? WinnerId { get; set; }
    public string BoardState { get; set; } = "";
    public string CurrentPlayerName { get; set; } = "";
    public int? MatchPassword { get; set; }
    public MatchStatus MatchStatus {get; set;}
}