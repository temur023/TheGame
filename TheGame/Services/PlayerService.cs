using TheGame.Entities;
using TheGame.Responses;

namespace TheGame.Services;

public class PlayerService(DataContext context):IPlayerService
{
    public async Task<Response<int>> Create(Player player)
    {
        var model = new Player()
        {
            Name = player.Name,
        };
        context.Players.Add(model);
        await context.SaveChangesAsync();
        return new Response<int>(200,"Player created",model.Id);
    }
}