using Microsoft.EntityFrameworkCore;
using TheGame.Entities;

namespace TheGame;

public class DataContext:DbContext
{
    public DataContext(DbContextOptions<DataContext> options) : base(options){}
    public DbSet<Player> Players {get; set;}
    public DbSet<Match> Matches { get; set; }
}