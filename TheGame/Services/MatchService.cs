using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TheGame.Dtos;
using TheGame.Entities;
using TheGame.Filters;
using TheGame.Responses;

namespace TheGame.Services;

public class MatchService(DataContext context, IServiceScopeFactory scopeFactory): IMatchService
{
    public async Task<PagedResponse<GetMatchesDto>> GetAll(MatchesFilter filter)
    {
        var query = context.Matches.Include(m => m.Player1)
            .Where(m=>m.MatchStatus!=MatchStatus.Finished).AsNoTracking();
        var total = await query.CountAsync();
        var matches = await query.Skip((filter.PageNumber - 1) * filter.PageSize).Take(filter.PageSize)
            .ToListAsync();
    
        var dtos = matches.Select(m => new GetMatchesDto()
        {
            Id = m.Id,
            BoardState = m.BoardState,
            Player1 = m.Player1,
            Player1Id = m.Player1Id,
            Player2Id = m.Player2Id,
            WinnerName = m.WinnerName ?? "",
            CurrentPlayerName = m.CurrentPlayerName,
            MatchPassword = m.MatchPassword,
            MatchStatus = m.MatchStatus
        }).OrderByDescending(m=>m.Id).ToList();
        return new PagedResponse<GetMatchesDto>(dtos, filter.PageNumber, filter.PageSize, total, "success");
    }
    public async Task<Response<Match>> GetById(int id)
    {
        var find = await context.Matches
            .Include(m => m.Player1)
            .Include(m => m.Player2) 
            .FirstOrDefaultAsync(m => m.Id == id);
        
        if (find == null) return new Response<Match>(404, "Match not found!");
        return new Response<Match>(200, "Match found!", find);
    }
    public async Task<Response<int>> JoinMatch(JoinMatchDto dto)
    {
        var match = await context.Matches
            .Include(m => m.Player1)
            .FirstOrDefaultAsync(m => m.Id == dto.MatchId); 

        if (match == null) return new Response<int>(404, "Match Not Found!");
    
        match.Player2Id = dto.Player2Id;
        match.MatchStatus = MatchStatus.InProgress;
        
        match.CurrentPlayerId = match.Player1Id;
        match.CurrentPlayerName = match.Player1?.Name ?? "Player 1"; 

        await context.SaveChangesAsync();
        return new Response<int>(200, "Joined", match.Id);
    }
    public async Task<Response<int>> Create(CreateMatchDto match)
    {
        var player = await context.Players.FindAsync(match.Player1Id);
        if (player == null) return new Response<int>(404, "Player not found!");

        var model = new Match()
        {
            Player1Id = player.Id,
            Player2Id = null,
            BoardState = "EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY", 
            CurrentPlayerName = player.Name,
            CurrentPlayerId = player.Id, 
            MatchStatus = MatchStatus.WaitingForAPlayer,
            MatchPassword = match.MatchPassword
        };
        context.Matches.Add(model);
        await context.SaveChangesAsync();
        return new Response<int>(200, "Match Created", model.Id);
    }
    public async Task<Response<int>> CreateAiMatch(int player1Id)
    {
        var player = await context.Players.FindAsync(player1Id);
        if (player == null) return new Response<int>(404, "Player not found!");

        var model = new Match()
        {
            Player1Id = player.Id,
            Player2Id = null,
            BoardState = "EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY", 
            CurrentPlayerName = player.Name,
            CurrentPlayerId = player.Id, 
            MatchStatus = MatchStatus.InProgress, 
            MatchPassword = null
        };
    
        context.Matches.Add(model);
        await context.SaveChangesAsync();
        return new Response<int>(200, "AI Match Created", model.Id);
    }
    public async Task<Response<string>> MakeMove(MakeMoveDto dto, Player? player = null)
{
    var match = await context.Matches
        .Include(m => m.Player1)
        .Include(m => m.Player2)
        .FirstOrDefaultAsync(m => m.Id == dto.MatchId);

    if (match == null) return new Response<string>(404, "Match not found!");
    if (match.Player2Id == null) return new Response<string>(400, "Waiting for an opponent.");
    if (match.MatchStatus == MatchStatus.Finished) return new Response<string>(400, "Game already finished.");
    
    var result = await ApplyMove(match, dto.CellIndex, dto.PlayerId);
    if (result.StatusCode != 200) return result;
    
    if (match.Player2Id == null && match.MatchStatus == MatchStatus.InProgress)
    {
        int aiMove = GetRandomAvailableMove(match.BoardState);
        if (aiMove != -1)
        {
            await ApplyMove(match, aiMove, 0);
        }
    }

    await context.SaveChangesAsync();
    
    return match.MatchStatus == MatchStatus.Finished 
        ? new Response<string>(200, "FINISHED") 
        : new Response<string>(200, "SUCCESS");
}
    
private async Task<Response<string>> ApplyMove(Match match, int cellIndex, int playerId)
{
    var board = match.BoardState.Split(',');
    
    if (board[cellIndex] != "EMPTY") 
        return new Response<string>(400, "Cell already taken!");

    bool isPlayer1 = (playerId == match.Player1Id);
    board[cellIndex] = isPlayer1 ? "X" : "O";
    match.BoardState = string.Join(",", board);

    var outcome = CheckWinner(board);
    if (outcome != null)
    {
        match.MatchStatus = MatchStatus.Finished;
        var p1 = await context.Players.FindAsync(match.Player1Id);
        var p2 = await context.Players.FindAsync(match.Player2Id);

        if (outcome == "X") {
            match.WinnerName = p1?.Name ?? "Player 1";
            if (p1 != null) p1.Wins++;
            if (p2 != null) p2.Losses++; 
        }
        else if (outcome == "O") {
            match.WinnerName = p2?.Name ?? "Stupid AI";
            if (p2 != null) p2.Wins++;
            if (p1 != null) p1.Losses++;
        }
        else {
            match.WinnerName = "Draw";
            if (p1 != null) p1.Draws++;
            if (p2 != null) p2.Draws++;
        }

        DeleteMatchAfterDelay(match.Id);
        return new Response<string>(200, "FINISHED");
    }
    
    match.CurrentPlayerId = isPlayer1 ? match.Player2Id ?? 0 : match.Player1Id;
    match.CurrentPlayerName = isPlayer1 
        ? (match.Player2?.Name ?? "Stupid AI") 
        : (match.Player1?.Name ?? "Player 1");

    return new Response<string>(200, "SUCCESS");
}

private int GetRandomAvailableMove(string boardState)
{
    var board = boardState.Split(',');
    var availableIndices = board
        .Select((val, idx) => new { val, idx })
        .Where(x => x.val == "EMPTY")
        .Select(x => x.idx)
        .ToList();

    if (availableIndices.Count == 0) return -1;

    Random rand = new Random();
    return availableIndices[rand.Next(availableIndices.Count)];
}

private void DeleteMatchAfterDelay(int matchId)
{
    _ = Task.Run(async () => {
        await Task.Delay(60000); 
        using (var scope = scopeFactory.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<DataContext>();
            var matchToDelete = await db.Matches.FindAsync(matchId);
            if (matchToDelete != null) {
                db.Matches.Remove(matchToDelete);
                await db.SaveChangesAsync();
            }
        }
    });
}
    public async Task<Response<List<GetLeaderboardDto>>> Leaderboard()
    {
        var players = await context.Players.OrderByDescending(p => p.Wins).Take(10)
            .Select(p => new GetLeaderboardDto
            {
                Name = p.Name,
                Wins = p.Wins,
                Draws = p.Draws,
                Losses = p.Losses
            }).ToListAsync();
        return new Response<List<GetLeaderboardDto>>(200, "Leaderboard", players);
    }

    public async Task<Response<string>> Delete(int matchId)
    {
        var find = await context.Matches.FirstOrDefaultAsync(m => m.Id == matchId);
        if (find == null) return new Response<string>(404, "Match not found!");
        context.Matches.Remove(find);
        await context.SaveChangesAsync();
        return new Response<string>(200, "Match deleted!");
    }

    private string? CheckWinner(string[] board)
    {
        int[][] winPatterns = new[]
        {
            new[] {0,1,2}, new[] {3,4,5}, new[] {6,7,8},
            new[] {0,3,6}, new[] {1,4,7}, new[] {2,5,8}, 
            new[] {0,4,8}, new[] {2,4,6}           
        };

        foreach (var p in winPatterns)
        {
            if (board[p[0]] != "EMPTY" && board[p[0]] == board[p[1]] && board[p[1]] == board[p[2]])
                return board[p[0]];
        }

        return board.Contains("EMPTY") ? null : "Draw";
    }
}