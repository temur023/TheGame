using TheGame.Dtos;
using TheGame.Entities;
using TheGame.Filters;
using TheGame.Responses;

namespace TheGame.Services;

public interface IMatchService
{
    Task<PagedResponse<GetMatchesDto>> GetAll(MatchesFilter filter);
    Task<Response<string>> Create(Match match);
}
