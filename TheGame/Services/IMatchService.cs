using TheGame.Dtos;
using TheGame.Entities;
using TheGame.Filters;
using TheGame.Responses;

namespace TheGame.Services;

public interface IMatchService
{
    Task<PagedResponse<GetMatchesDto>> GetAll(MatchesFilter filter);
    Task<Response<Match>> GetById(int id);
    Task<Response<int>> Create(CreateMatchDto match);
    Task<Response<int>> CreateAiMatch(int player1Id);
    Task<Response<int>> JoinMatch(JoinMatchDto dto);
    Task<Response<string>> MakeMove(MakeMoveDto dto, Player player);
    Task<Response<List<GetLeaderboardDto>>> Leaderboard();
    Task<Response<string>> Delete(int matchId);
}
