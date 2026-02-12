namespace TheGame.Dtos;

public class GetLeaderboardDto
{
    public string Name { get; set; } = "";
    public int Wins { get; set; } = 0;
    public int Losses { get; set; } = 0;
    public int Draws { get; set; } = 0;

}