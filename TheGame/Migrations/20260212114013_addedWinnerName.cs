using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheGame.Migrations
{
    /// <inheritdoc />
    public partial class addedWinnerName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WinnerName",
                table: "Matches",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WinnerName",
                table: "Matches");
        }
    }
}
