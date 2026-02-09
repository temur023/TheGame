using TheGame.Dtos;
using TheGame.Entities;
using TheGame.Filters;
using TheGame.Responses;

namespace TheGame.Services;

public interface IMatchService
{
    Task<PagedResponse<GetMatchesDto>> GetAll(MatchesFilter filter);
    Task<Response<Match>> GetById(int id);
    Task<Response<string>> Create(Match match);
    Task<Response<string>> JoinMatch(int matchId, int player2Id);
    Task<Response<string>> MakeMove(int playerId, int matchId, int cellIndex);
}
