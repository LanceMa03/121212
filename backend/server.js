const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const app = express();
const PORT = 5000;
const { Player } = require("./models.js");

// Enable CORS to allow requests from frontend
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Connect to SQLite database
const db = new sqlite3.Database("./database.sqlite", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

// Create Players table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS Players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    team TEXT NOT NULL,
    points_per_game INTEGER,
    assists_per_game INTEGER,
    rebounds_per_game INTEGER
  )`);

// Create Teams table to store NBA teams
db.run(`CREATE TABLE IF NOT EXISTS Teams (
    name TEXT PRIMARY KEY,
    city TEXT NOT NULL,
    championships_won INTEGER DEFAULT 0
  )`);

// Create GameStats table to store stats for each game
db.run(`CREATE TABLE IF NOT EXISTS GameStats (
  game_id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER,
  team_id TEXT,
  points INTEGER,
  rebounds INTEGER,
  assists INTEGER,
  minutes_played INTEGER,
  FOREIGN KEY (player_id) REFERENCES Players(id),
  FOREIGN KEY (team_id) REFERENCES Teams(name)
)`);

// Get all players
app.get("/players", (req, res) => {
  const sql = "SELECT * FROM Players";
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Add a new player to the Players table (ORM)
app.post("/players/add", async (req, res) => {
  const { name, team, points_per_game, assists_per_game, rebounds_per_game } = req.body;

  const transaction = await Player.sequelize.transaction();

  try {
    // Use Sequelize's create method to insert a new player into the database within a transaction
    const newPlayer = await Player.create(
      {
        name,
        team,
        points_per_game,
        assists_per_game,
        rebounds_per_game,
      },
      { transaction } 
    );

    // Commit the transaction
    await transaction.commit();

    console.log("Player inserted successfully with ID:", newPlayer.id);
    res.json({ id: newPlayer.id });
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();

    console.error("Error inserting player:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Update a player by ID using Sequelize (ORM)
app.put("/players/:id", async (req, res) => {
  const { id } = req.params;
  const { name, team, points_per_game, assists_per_game, rebounds_per_game } = req.body;

  const transaction = await Player.sequelize.transaction();

  try {
    // Find the player by ID within the transaction
    const player = await Player.findByPk(id, { transaction });

    // Update player fields within the transaction
    await player.update(
      {
        name,
        team,
        points_per_game,
        assists_per_game,
        rebounds_per_game,
      },
      { transaction }
    );

    // Commit the transaction
    await transaction.commit();

    res.json({ message: "Player updated successfully", updatedPlayer: player });
  } catch (error) {
    // Rollback the transaction in case of an error
    await transaction.rollback();

    res.status(400).json({ error: error.message });
  }
});

// Deletes a player (Pepared Statement)
app.delete("/players/:id", async (req, res) => {
  const { id } = req.params;

  const transaction = await db.exec("BEGIN TRANSACTION;");

  try {
    // Prepare the SQL statement to delete the player
    const sql = "DELETE FROM Players WHERE id = ?";
    const stmt = db.prepare(sql);

    // Execute the delete operation within the transaction
    stmt.run(id, function (err) {
      if (err) {
        throw new Error(err.message); // If an error occurs, it will be caught below
      }

      // Commit the transaction
      db.exec("COMMIT;", (commitErr) => {
        if (commitErr) {
          throw new Error(commitErr.message);
        }

        res.json({ message: "Player deleted successfully", deletedID: this.changes });
      });
    });

    stmt.finalize();
  } catch (error) {
    // Rollback the transaction in case of an error
    db.exec("ROLLBACK;", (rollbackErr) => {
      if (rollbackErr) {
        console.error("Error during rollback:", rollbackErr.message);
      }
    });

    res.status(400).json({ error: error.message });
  }
});

// Search for players by name and team using a prepared statement
app.get("/players/search2", (req, res) => {
  const { name, team } = req.query;
  console.log(`Searching for players with name: ${name} and team: ${team}`);

  // Base SQL query and params array
  let sql = "SELECT * FROM Players WHERE 1 = 1";
  const params = [];

  // Add name filter if present
  if (name) {
    sql += " AND name LIKE ?";
    params.push(`%${name}%`);
  }

  // Add team filter if present
  if (team) {
    sql += " AND team = ?";
    params.push(team);
  }

  console.log("Executing SQL query:", sql, params);

  // Use a prepared statement for the query
  const stmt = db.prepare(sql);

  stmt.all(params, (err, rows) => {
    if (err) {
      console.error("Error searching for players:", err.message);
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });

  // Finalize the prepared statement
  stmt.finalize();
});

// Get all teams
app.get("/teams", (req, res) => {
  const sql = `
  SELECT 
    GameStats.game_id,
    GameStats.team_id,
    GameStats.points,
    GameStats.rebounds,
    GameStats.assists,
    GameStats.minutes_played,
    Players.name AS player_name
  FROM GameStats
  INNER JOIN Players ON GameStats.player_id = Players.id
`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post("/gamestats/add", (req, res) => {
  const { player_id, team_id, points, rebounds, assists, minutes_played } = req.body;

  db.exec("BEGIN TRANSACTION;");

  const sql = `INSERT INTO GameStats (player_id, team_id, points, rebounds, assists, minutes_played)
               VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [player_id, team_id, points, rebounds, assists, minutes_played];

  db.run(sql, params, function () {
    db.exec("COMMIT;");
    res.json({ message: "Game stats added successfully", id: this.lastID });
  });
});

app.post("/gamestats/deleteAll", (req, res) => {
  const sql = `DELETE FROM GameStats`;

  db.run(sql, function (err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: "All game stats deleted successfully" });
  });
});

// Get game stats by player
app.get("/gamestats/player/:player_id", (req, res) => {
  const { player_id } = req.params;
  const sql = "SELECT * FROM GameStats WHERE player_id = ?";

  db.all(sql, [player_id], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Get game stats by game
app.get("/gamestats/game/:game_id", (req, res) => {
  const { game_id } = req.params;
  const sql = "SELECT * FROM GameStats WHERE game_id = ?";

  db.all(sql, [game_id], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Get all game stats
app.get("/gamestats", (req, res) => {
  const sql = `
  SELECT 
    GameStats.game_id,
    GameStats.team_id,
    GameStats.points,
    GameStats.rebounds,
    GameStats.assists,
    GameStats.minutes_played,
    Players.name AS player_name
  FROM GameStats
  INNER JOIN Players ON GameStats.player_id = Players.id
`;

db.all(sql, [], (err, rows) => {
  if (err) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.json({ data: rows });
});
});

// delete a game stat
app.delete("/gamestats/:game_id", (req, res) => {
  const { game_id } = req.params;

  db.exec("BEGIN TRANSACTION;");

  const sql = "DELETE FROM GameStats WHERE game_id = ?";
  db.run(sql, [game_id], function () {
    db.exec("COMMIT;");
    res.json({ message: "Game stat deleted successfully", deletedID: this.changes });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
