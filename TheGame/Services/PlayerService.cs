using TheGame.Entities;
using TheGame.Responses;

namespace TheGame.Services;

public class PlayerService(DataContext context):IPlayerService
{
    public async Task<Response<string>> Create(Player player)
    {
        var model = new Player()
        {
            Name = player.Name,
            IsSearching = player.IsSearching,
        };
        context.Players.Add(model);
        await context.SaveChangesAsync();
        return new Response<string>(200,"Player created");
    }
}