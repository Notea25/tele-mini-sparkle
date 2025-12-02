import footballField from "@/assets/football-field.png";
import playerJersey from "@/assets/player-jersey-white.png";

interface Player {
  position: string;
  row: number;
  col: number;
}

const FormationField = () => {
  // Formation: 2 ВР (goalkeepers), 5 ЗЩ (defenders), 5 ПЗ (midfielders), 3 НП (forwards)
  const formation: Player[] = [
    // Row 1 - Goalkeepers (top)
    { position: "ВР", row: 1, col: 2 },
    { position: "ВР", row: 1, col: 4 },
    // Row 2 - Defenders
    { position: "ЗЩ", row: 2, col: 1 },
    { position: "ЗЩ", row: 2, col: 2 },
    { position: "ЗЩ", row: 2, col: 3 },
    { position: "ЗЩ", row: 2, col: 4 },
    { position: "ЗЩ", row: 2, col: 5 },
    // Row 3 - Midfielders
    { position: "ПЗ", row: 3, col: 1 },
    { position: "ПЗ", row: 3, col: 2 },
    { position: "ПЗ", row: 3, col: 3 },
    { position: "ПЗ", row: 3, col: 4 },
    { position: "ПЗ", row: 3, col: 5 },
    // Row 4 - Forwards (bottom)
    { position: "НП", row: 4, col: 2 },
    { position: "НП", row: 4, col: 3 },
    { position: "НП", row: 4, col: 4 },
  ];

  const getPlayerStyle = (row: number, col: number) => {
    // Calculate positions based on row and column
    const topPositions: Record<number, string> = {
      1: "8%",
      2: "28%",
      3: "52%",
      4: "78%",
    };

    const leftPositions: Record<number, Record<number, string>> = {
      1: { 2: "38%", 4: "62%" },
      2: { 1: "15%", 2: "30%", 3: "50%", 4: "70%", 5: "85%" },
      3: { 1: "15%", 2: "30%", 3: "50%", 4: "70%", 5: "85%" },
      4: { 2: "30%", 3: "50%", 4: "70%" },
    };

    return {
      top: topPositions[row],
      left: leftPositions[row][col],
    };
  };

  return (
    <div className="relative w-full">
      <img
        src={footballField}
        alt="Football field"
        className="w-full rounded-2xl"
      />
      {formation.map((player, idx) => {
        const style = getPlayerStyle(player.row, player.col);
        return (
          <div
            key={idx}
            className="absolute flex flex-col items-center"
            style={{
              top: style.top,
              left: style.left,
              transform: "translateX(-50%)",
            }}
          >
            <img
              src={playerJersey}
              alt="Player"
              className="w-10 h-10 sm:w-12 sm:h-12"
            />
            <span className="text-white text-xs font-bold mt-0.5 drop-shadow-md">
              {player.position}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default FormationField;
