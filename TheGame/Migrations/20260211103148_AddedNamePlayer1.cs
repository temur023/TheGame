using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheGame.Migrations
{
    /// <inheritdoc />
    public partial class AddedNamePlayer1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Player1Name",
                table: "Matches",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Player1Name",
                table: "Matches");
        }
    }
}
