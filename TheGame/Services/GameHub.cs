using Microsoft.AspNetCore.SignalR;

namespace TheGame.Services;

public class GameHub(IMatchService service):Hub
{
    public async Task JoinGame(int matchId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, matchId.ToString());
    }

    public async Task SendMove(int playerId, int matchId, int index)
    {
        var result = await service.MakeMove(playerId, matchId, index);

        if (result.StatusCode == 200)
        {
            var updatedMatchResponse = await service.GetById(matchId);

            await Clients.Group(matchId.ToString()).SendAsync("ReceiveUpdate", updatedMatchResponse.Data);
        }
    }
}