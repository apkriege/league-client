export default function Player() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Player Page</h1>
      <div className="p-4 bg-white rounded shadow">
        <p>This is the player page. It will show player details and stats.</p>
        {/* Add more player details and stats here */}
      </div>
      {/*
      For testing purposes, we can add a section to display the player's scores or stats.
      This can be removed or replaced with actual data later.
    */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">Player Stats (Test Data)</h2>
        <p>Score: 72</p>
        <p>Handicap: 10</p>
        {/* Add more test stats here */}
      </div>
    </div>
  );
}
