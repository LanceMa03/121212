// backend/models.js
const { Sequelize, DataTypes } = require("sequelize");

// Create a new Sequelize instance and connect to the SQLite database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

// Define the Player model
const Player = sequelize.define(
  "Player",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    team: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points_per_game: {
      type: DataTypes.INTEGER,
    },
    assists_per_game: {
      type: DataTypes.INTEGER,
    },
    rebounds_per_game: {
      type: DataTypes.INTEGER,
    },
  },
  {
    timestamps: false, // Disable createdAt and updatedAt fields
  }
);

// Sync the models with the database
sequelize.sync().then(() => {
  console.log("Database & tables created!");
});

module.exports = { Player, sequelize };
