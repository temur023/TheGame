namespace TheGame.Entities;

public class Match
{
    public int Id { get; set; }
    public Player Player1 { get; set; } = new Player();
    public int Player1Id { get; set; }
    public Player Player2 { get; set; } = new Player();
    public int Player2Id { get; set; }
    public string BoardState { get; set; } = "";
    public string CurrentPlayerName { get; set; } = "";
}