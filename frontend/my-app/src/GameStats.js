import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GameStats.css";

const GameStatsPage = () => {
  const [gameStats, setGameStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [formData, setFormData] = useState({
    game_id: "",
    player_id: "",
    team_id: "",
    points: "",
    rebounds: "",
    assists: "",
    minutes_played: "",
  });
  const [filter, setFilter] = useState({ player_id: "", game_id: "" });

  useEffect(() => {
    fetchGameStats();
    fetchPlayers();
  }, []);

  // Fetch all game stats
  const fetchGameStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/gamestats"); // Updated URL to fetch all
      setGameStats(response.data.data);
    } catch (error) {
      console.error("Error fetching game stats:", error);
    }
  };

  // Fetch all players to populate dropdown
  const fetchPlayers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/players");
      setPlayers(response.data.data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-set team based on player selection
    if (name === "player_id") {
      const selectedPlayer = players.find((player) => player.id === parseInt(value));
      setFormData({
        ...formData,
        [name]: value,
        team_id: selectedPlayer ? selectedPlayer.team : "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };


  // Add new game stat
  const handleAddGameStat = async (e) => {
    e.preventDefault();
    const { player_id, team_id, points, rebounds, assists, minutes_played } = formData;
    const dataWithoutGameId = { player_id, team_id, points, rebounds, assists, minutes_played }; // Exclude game_id

    try {
      await axios.post("http://localhost:5000/gamestats/add", dataWithoutGameId);
      fetchGameStats();
      setFormData({
        player_id: "",
        team_id: "",
        points: "",
        rebounds: "",
        assists: "",
        minutes_played: "",
      });
    } catch (error) {
      console.error("Error adding game stat:", error);
    }
  };

  // Delete a game stat by game_id
  const handleDeleteGameStat = async (game_id) => {
    try {
      await axios.delete(`http://localhost:5000/gamestats/${game_id}`);
      fetchGameStats(); // Refresh the list after deletion
    } catch (error) {
      console.error("Error deleting game stat:", error);
    }
  };

  const deleteAll = async () => {
    try {
      await axios.post('http://localhost:5000/gamestats/deleteAll');
      fetchGameStats();
    }
    catch (error) {
      console.error("Error deleting all game stats:", error);
    }
  }

  // Filter game stats
  const handleFilter = async () => {
    try {
      const { player_id, game_id } = filter;
      const url = player_id
        ? `http://localhost:5000/gamestats/player/${player_id}`
        : game_id
        ? `http://localhost:5000/gamestats/game/${game_id}`
        : "http://localhost:5000/gamestats";
      const response = await axios.get(url);
      setGameStats(response.data.data);
    } catch (error) {
      console.error("Error filtering game stats:", error);
    }
  };

  return (
    <div className="container">
      <h2>Game Stats</h2>

      {/* Form to add game stats */}
      <form onSubmit={handleAddGameStat}>

        <h3>Add Game Stat</h3>

        <label>Player:</label>
        <select name="player_id" value={formData.player_id} onChange={handleChange} required>
          <option value="">Select Player</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>

        <label>Team ID:</label>
        <input type="text" name="team_id" value={formData.team_id} readOnly />

        <label>Points:</label>
        <input type="number" name="points" value={formData.points} onChange={handleChange} required />

        <label>Rebounds:</label>
        <input type="number" name="rebounds" value={formData.rebounds} onChange={handleChange} required />

        <label>Assists:</label>
        <input type="number" name="assists" value={formData.assists} onChange={handleChange} required />

        <label>Minutes Played:</label>
        <input type="number" name="minutes_played" value={formData.minutes_played} onChange={handleChange} required />

        <button type="submit">Add Game Stat</button>
      </form>

      {/* Filter section */}
      <div className="filter-section">
        <h3>Filter Game Stats</h3>
        <label>Filter by Player ID:</label>
        <input type="text" name="player_id" value={filter.player_id} onChange={(e) => setFilter({ ...filter, player_id: e.target.value })} />

        <label>Filter by Game ID:</label>
        <input type="text" name="game_id" value={filter.game_id} onChange={(e) => setFilter({ ...filter, game_id: e.target.value })} />

        <button onClick={handleFilter}>Apply Filter</button>
      </div>

      {/* Display game stats */}
      <h3>Game Stats List</h3>
      <table>
        <thead>
          <tr>
            <th>Game ID</th>
            <th>Player ID</th>
            <th>Team ID</th>
            <th>Points</th>
            <th>Rebounds</th>
            <th>Assists</th>
            <th>Minutes Played</th>
          </tr>
        </thead>
        <tbody>
          {gameStats.map((stat, index) => (
            <tr key={index}>
              <td>{stat.game_id}</td>
              <td>{stat.player_id}</td>
              <td>{stat.team_id}</td>
              <td>{stat.points}</td>
              <td>{stat.rebounds}</td>
              <td>{stat.assists}</td>
              <td>{stat.minutes_played}</td>
              <td>
                <button onClick={() => handleDeleteGameStat(stat.game_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameStatsPage;
