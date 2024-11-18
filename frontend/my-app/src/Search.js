// src/Search.js
import React, { useState } from "react";
import axios from "axios";
import "./PlayerTable.css"; // Use existing styles

function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTeam, setSearchTeam] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [teams, setTeams] = useState([]);

  // Define the default list of NBA teams
  const nbaTeams = [
    "Atlanta Hawks",
    "Boston Celtics",
    "Brooklyn Nets",
    "Charlotte Hornets",
    "Chicago Bulls",
    "Cleveland Cavaliers",
    "Dallas Mavericks",
    "Denver Nuggets",
    "Detroit Pistons",
    "Golden State Warriors",
    "Houston Rockets",
    "Indiana Pacers",
    "Los Angeles Clippers",
    "Los Angeles Lakers",
    "Memphis Grizzlies",
    "Miami Heat",
    "Milwaukee Bucks",
    "Minnesota Timberwolves",
    "New Orleans Pelicans",
    "New York Knicks",
    "Oklahoma City Thunder",
    "Orlando Magic",
    "Philadelphia 76ers",
    "Phoenix Suns",
    "Portland Trail Blazers",
    "Sacramento Kings",
    "San Antonio Spurs",
    "Toronto Raptors",
    "Utah Jazz",
    "Washington Wizards",
  ];

  // Function to handle search
  const handleSearch = () => {
    console.log(`Searching for name: ${searchTerm}, team: ${searchTeam}`);

    // Construct the query parameters
    const query = new URLSearchParams();
    if (searchTerm) query.append("name", searchTerm);
    if (searchTeam) query.append("team", searchTeam);

    const url = `http://localhost:5000/players/search2?${query.toString()}`;
    console.log("Search URL:", url);

    axios
      .get(url)
      .then((response) => setSearchResults(response.data.data))
      .catch((error) => console.error("Error searching for players:", error));
  };

  return (
    <div className="player-table-container">
      <h2 className="player-table-title">Search for NBA Player Stats</h2>

      <div className="form-container">
        <label>
          Name:
          <input
            type="text"
            name="search"
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); handleSearch(); }}
            placeholder="Enter player name"
            style={{ width: "200px", marginRight: "10px" }} // Adjust width and spacing
          />
        </label>

        {/* Dropdown for selecting team */}
        <label>
          Team:
          <select
            name="team"
            value={searchTeam}
            onChange={(e) => setSearchTeam(e.target.value)}
            style={{ width: "200px", marginRight: "10px" }}
          >
            <option value="">-- Select a Team --</option>
            {nbaTeams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>

        <button onClick={() => handleSearch()}>Search</button>
      </div>

      {/* Table displaying search results */}
      {searchResults.length > 0 ? (
        <table className="player-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Team</th>
              <th>Points Per Game</th>
              <th>Assists Per Game</th>
              <th>Rebounds Per Game</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((player) => (
              <tr key={player.id}>
                <td>{player.id}</td>
                <td>{player.name}</td>
                <td>{player.team}</td>
                <td>{player.points_per_game}</td>
                <td>{player.assists_per_game}</td>
                <td>{player.rebounds_per_game}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-players">No players found. Please search again.</p>
      )}
    </div>
  );
}

export default Search;
