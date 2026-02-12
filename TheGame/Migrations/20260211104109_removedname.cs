using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TheGame.Migrations
{
    /// <inheritdoc />
    public partial class removedname : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Player1Name",
                table: "Matches");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Player1Name",
                table: "Matches",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
