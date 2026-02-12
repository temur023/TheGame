using Microsoft.AspNetCore.SignalR;
using TheGame.Dtos;
using TheGame.Entities;

namespace TheGame.Services;

public class GameHub(IMatchService service):Hub
{
    public async Task SendChatMessage(int matchId, string user, string message)
    {
        await Clients.Group(matchId.ToString()).SendAsync("ReceiveChatMessage", user, message);
    }
    public async Task JoinGame(int matchId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, matchId.ToString());
        
        var match = await service.GetById(matchId);
        if (match.Data != null)
        {
            await Clients.Caller.SendAsync("ReceiveUpdate", match.Data);
        }
    }
    public async Task NotifyPlayerJoined(int matchId)
    {
        var updatedMatch = await service.GetById(matchId);
        await Clients.Group(matchId.ToString()).SendAsync("ReceiveUpdate", updatedMatch.Data);
    }
    public async Task SendMove(MakeMoveDto dto)
    {
        var result = await service.MakeMove(dto,null);

        if (result.StatusCode == 200)
        {
            var updatedMatch = await service.GetById(dto.MatchId);

            await Clients.Group(dto.MatchId.ToString()).SendAsync("ReceiveUpdate", updatedMatch.Data);
            
            if (result.Data == "FINISHED")
            {
                await Clients.Group(dto.MatchId.ToString()).SendAsync("GameEnded", updatedMatch.Data, 0);
            }
        }
    }
}