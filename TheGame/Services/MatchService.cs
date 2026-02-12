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
    
    public async Task<Response<string>> MakeMove(MakeMoveDto dto, Player? player = null)
    {
        var match = await context.Matches
            .Include(m => m.Player1)
            .Include(m => m.Player2)
            .FirstOrDefaultAsync(m => m.Id == dto.MatchId);

        if (match == null) return new Response<string>(404, "Match not found!");
        if (match.Player2Id == null) return new Response<string>(400, "Waiting for an opponent.");

        var board = match.BoardState.Split(',');
        bool isPlayer1 = (dto.PlayerId == match.Player1Id);
        board[dto.CellIndex] = isPlayer1 ? "X" : "O";
        match.BoardState = string.Join(",", board);

        var outcome = CheckWinner(board);
        if (outcome != null) 
        {
            var p1 = await context.Players.FindAsync(match.Player1Id);
            var p2 = await context.Players.FindAsync(match.Player2Id);
            match.MatchStatus = MatchStatus.Finished;
            if (outcome == "X") {
                match.WinnerName = match.Player1.Name;
                p1.Wins++;
                p2.Losses++;
            }
            else if (outcome == "O") {
                match.WinnerName = match.Player2.Name;
                p2.Wins++;
                p1.Losses++;
            }
            else if (outcome == "Draw") {
                match.WinnerName = "Draw";
                p1.Draws++;
                p2.Draws++;
            }
            await context.SaveChangesAsync();
            
            _ = Task.Run(async () => {
                await Task.Delay(60000); 
                using (var scope = scopeFactory.CreateScope())
                {
                    var db = scope.ServiceProvider.GetRequiredService<DataContext>();
                    var matchToDelete = await db.Matches.FindAsync(dto.MatchId);
                    if (matchToDelete != null) {
                        db.Matches.Remove(matchToDelete);
                        await db.SaveChangesAsync();
                    }
                }
            });

            return new Response<string>(200, "FINISHED"); 
        }

        match.CurrentPlayerId = isPlayer1 ? match.Player2Id.Value : match.Player1Id;
        match.CurrentPlayerName = isPlayer1 
            ? (match.Player2?.Name ?? "Player 2") 
            : (match.Player1?.Name ?? "Player 1");

        await context.SaveChangesAsync();
        return new Response<string>(200, "SUCCESS");
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