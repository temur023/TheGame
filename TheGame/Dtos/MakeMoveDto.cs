namespace TheGame.Dtos;

public class MakeMoveDto
{
    public int PlayerId { get; set; }
    public int MatchId { get; set; }
    public int CellIndex { get; set; }
}