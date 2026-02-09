using Microsoft.AspNetCore.SignalR;

namespace TheGame.Services;

public class GameHub(IMatchService service):Hub
{
    public async Task JoinGame(int matchId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, matchId.ToString());
    }

    public async Task SendMove(int playerId, int matchId, int cellIndex)
    {
        var result = await service.MakeMove(playerId, matchId, cellIndex);

        if (result.StatusCode == 200)
        {
            var updatedMatch = await service.GetById(matchId);
            await Clients.Group(matchId.ToString()).SendAsync("ReceiveUpdate", updatedMatch.Data);
        }
        else
        {
            await Clients.Caller.SendAsync("Error", result.Message);
        }
    }
}