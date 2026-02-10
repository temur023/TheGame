using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using TheGame.Dtos;
using TheGame.Entities;
using TheGame.Filters;
using TheGame.Responses;

namespace TheGame.Services;

public class MatchService(DataContext context): IMatchService
{
    public async Task<PagedResponse<GetMatchesDto>> GetAll(MatchesFilter filter)
    {
        var query = context.Matches.AsNoTracking();
        var total = await query.CountAsync();
        var matches = await query.Skip((filter.PageNumber - 1) * filter.PageSize).Take(filter.PageSize)
            .ToListAsync();
        var dtos = matches.Select(m => new GetMatchesDto()
        {
            Id = m.Id,
            BoardState = m.BoardState,
            Player1Id = m.Player1Id,
            Player2Id = m.Player2Id,
            CurrentPlayerName = m.CurrentPlayerName,
            MatchStatus = m.MatchStatus
        }).ToList();
        return new PagedResponse<GetMatchesDto>(dtos, filter.PageNumber, filter.PageSize, total, "success");
    }

    public async Task<Response<Match>> GetById(int id)
    {
        var find = await context.Matches.FirstOrDefaultAsync(m => m.Id == id);
        if (find == null) return new Response<Match>(404, "Match not found!");
        return new Response<Match>(200, "Match found!",find);
    }
    public async Task<Response<int>> JoinMatch(JoinMatchDto dto)
    {
        var match = await context.Matches.FindAsync(dto.MatchId);
        if (match == null) return new Response<int>(404, "Match Not Found!");
        if (match.MatchStatus == MatchStatus.InProgress)
            return new Response<int>(400, "Match Room is already full!");
        if (match.MatchPassword.HasValue && match.MatchPassword != dto.Password)
            return new Response<int>(400, "Incorrect Password!",0);
        match.Player2Id = dto.Player2Id;
        match.MatchStatus = MatchStatus.InProgress;
        await context.SaveChangesAsync();
        return new Response<int>(200, "Joined to the match",match.Id);
    }
    public async Task<Response<int>> Create(CreateMatchDto match)
    {
        var model = new Match()
        {
            Player1Id = match.Player1Id,
            Player2Id = null,
            BoardState = "EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY", 
            CurrentPlayerName = match.CurrentPlayerName,
            MatchStatus = MatchStatus.WaitingForAPlayer,
            MatchPassword = match.MatchPassword
        };
        context.Matches.Add(model);
        await context.SaveChangesAsync();
        return new Response<int>(200,"Match Created", model.Id);
    }

    public async Task<Response<string>> MakeMove(int playerId, int matchId, int cellIndex)
    {
        var match = await context.Matches
            .Include(m => m.Player1)
            .Include(m => m.Player2)
            .FirstOrDefaultAsync(m => m.Id == matchId);
        if (match == null) return new Response<string>(404, "Match not found!");
        var player = await context.Players.FindAsync(playerId);
        if (player == null) return new Response<string>(404, "Player not found!");
        if (match.CurrentPlayerName != player.Name)
            return new Response<string>(400, "It is not your turn!");
        var board = match.BoardState.Split(',');
        if (board[cellIndex] != "EMPTY") return new Response<string>(400, "Cell already taken");
        board[cellIndex] = (match.Player1Id == playerId) ? "X" : "O";
        match.BoardState = string.Join(",", board);
        var outcome = CheckWinner(board);
        if (outcome != null)
        {
            match.MatchStatus = MatchStatus.Finished;
            if (outcome != "Draw")
            {
                match.WinnerId = playerId == match.Player1Id ? match.Player1Id : match.Player2Id;
                await context.SaveChangesAsync();
                return new Response<string>(200, $"The winner is {match.WinnerId}");
            }
            else
            {
                match.WinnerId = null;
                await context.SaveChangesAsync();
                return new Response<string>(200, "The match Ended with a draw");
            }
        }
        
        match.CurrentPlayerName = (match.Player1Id == playerId) 
            ? (match.Player2?.Name ?? "Waiting...")
            : match.Player1.Name;

        await context.SaveChangesAsync();
        return new Response<string>(200, "Move recorded");
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