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
        var matches = context.Matches.AsNoTracking();
        var total = await matches.CountAsync();
        var clubs = await matches.Skip((filter.PageNumber - 1) * filter.PageSize).Take(filter.PageSize)
            .ToListAsync();
        var dtos = await matches.Select(m => new GetMatchesDto()
        {
            Id = m.Id,
            BoardState = m.BoardState,
            Player1Id = m.Player1Id,
            Player2Id = m.Player2Id,
            CurrentPlayerName = m.CurrentPlayerName,
        }).ToListAsync();
        return new PagedResponse<GetMatchesDto>(dtos, filter.PageNumber, filter.PageSize, total, "success");
    }

    public async Task<Response<string>> Create(Match match)
    {
        var model = new Match()
        {
            Player1Id = match.Player1Id,
            Player2Id = match.Player2Id,
            BoardState = match.BoardState,
            CurrentPlayerName = match.CurrentPlayerName,
        };
        context.Matches.Add(model);
        await context.SaveChangesAsync();
        return new Response<string>(200,"Match created");
    }
}