using TheGame.Entities;
using TheGame.Responses;

namespace TheGame.Services;

public interface IPlayerService
{
    Task<Response<string>> Create(Player player);
}