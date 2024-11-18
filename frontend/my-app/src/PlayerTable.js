// src/PlayerTable.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./PlayerTable.css"; // Import custom CSS

function PlayerTable() {
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({ name: "", team: "", points_per_game: 0, assists_per_game: 0, rebounds_per_game: 0 });
  const [editingPlayer, setEditingPlayer] = useState(null);

  // List of 15 NBA teams for dropdown
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

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = () => {
    axios
      .get("http://localhost:5000/players")
      .then((response) => setPlayers(response.data.data))
      .catch((error) => console.error("Error fetching data:", error));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPlayer({ ...newPlayer, [name]: value });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    if (editingPlayer) {
      setEditingPlayer({ ...editingPlayer, [name]: value });
    } else {
      setNewPlayer({ ...newPlayer, [name]: value });
    }
  };

  // Add a new player using the POST method
  const addPlayer = () => {
    // Perform basic validation
    if (
      !newPlayer.name ||
      !newPlayer.team ||
      newPlayer.points_per_game === "" ||
      newPlayer.assists_per_game === "" ||
      newPlayer.rebounds_per_game === ""
    ) {
      alert("Please fill out all fields before adding a player.");
      return;
    }

    const playerToAdd = {
      ...newPlayer,
      points_per_game: parseInt(newPlayer.points_per_game), // Convert to number
      assists_per_game: parseInt(newPlayer.assists_per_game), // Convert to number
      rebounds_per_game: parseInt(newPlayer.rebounds_per_game), // Convert to number
    };

    console.log("Adding Player:", playerToAdd);

    fetch("http://localhost:5000/players/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(playerToAdd),
    })
      .then((response) => response.json())
      .then(() => {
        setNewPlayer({ name: "", team: "", points_per_game: 0, assists_per_game: 0, rebounds_per_game: 0 });
        fetchPlayers();
      })
      .catch((error) => console.error("Error adding player:", error.message));
  };

  const deletePlayer = (id) => {
    axios
      .delete(`http://localhost:5000/players/${id}`)
      .then(() => fetchPlayers())
      .catch((error) => console.error("Error deleting player:", error.message));
  };

  const startEditPlayer = (player) => {
    setEditingPlayer(player);
  };

  const updatePlayer = () => {
    axios
      .put(`http://localhost:5000/players/${editingPlayer.id}`, editingPlayer)
      .then(() => {
        setEditingPlayer(null);
        fetchPlayers();
      })
      .catch((error) => console.error("Error updating player:", error));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingPlayer({ ...editingPlayer, [name]: value });
  };

  return (
    <div className="player-table-container">
      <h2 className="player-table-title">NBA Player Stats</h2>

      {/* Form to add or edit player */}
      <div className="form-container">
        <h3>{editingPlayer ? "Edit Player" : "Add New Player"}</h3>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={editingPlayer ? editingPlayer.name : newPlayer.name}
            onChange={editingPlayer ? handleEditChange : handleInputChange}
          />
        </label>
        <label>
          Team:
          <select name="team" value={editingPlayer ? editingPlayer.team : newPlayer.team} onChange={handleSelectChange}>
            <option value="">-- Select a Team --</option>
            {nbaTeams.map((team, index) => (
              <option key={index} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>
        <label>
          Points Per Game:
          <input
            type="number"
            name="points_per_game"
            value={editingPlayer ? editingPlayer.points_per_game : newPlayer.points_per_game}
            onChange={editingPlayer ? handleEditChange : handleInputChange}
          />
        </label>
        <label>
          Assists Per Game:
          <input
            type="number"
            name="assists_per_game"
            value={editingPlayer ? editingPlayer.assists_per_game : newPlayer.assists_per_game}
            onChange={editingPlayer ? handleEditChange : handleInputChange}
          />
        </label>
        <label>
          Rebounds Per Game:
          <input
            type="number"
            name="rebounds_per_game"
            value={editingPlayer ? editingPlayer.rebounds_per_game : newPlayer.rebounds_per_game}
            onChange={editingPlayer ? handleEditChange : handleInputChange}
          />
        </label>
        <button onClick={editingPlayer ? updatePlayer : addPlayer}>{editingPlayer ? "Update Player" : "Add Player"}</button>
      </div>

      {/* Table displaying player data */}
      <table className="player-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Team</th>
            <th>Points Per Game</th>
            <th>Assists Per Game</th>
            <th>Rebounds Per Game</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr>
              <td colSpan="7" className="no-players">
                No players found
              </td>
            </tr>
          ) : (
            players.map((player) => (
              <tr key={player.id}>
                <td>{player.id}</td>
                <td>{player.name}</td>
                <td>{player.team}</td>
                <td>{player.points_per_game}</td>
                <td>{player.assists_per_game}</td>
                <td>{player.rebounds_per_game}</td>
                <td>
                  <button className="action-button edit" onClick={() => startEditPlayer(player)}>
                    Edit
                  </button>
                  <button className="action-button" onClick={() => deletePlayer(player.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PlayerTable;
