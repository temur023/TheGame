using Microsoft.EntityFrameworkCore;
using TheGame;
using TheGame.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<DataContext>(options =>
    options.UseNpgsql(connectionString));
builder.Services.AddScoped<IMatchService, MatchService>();
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSignalR();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();
app.MapHub<GameHub>("/gamehub");
app.MapControllers();

app.Run();