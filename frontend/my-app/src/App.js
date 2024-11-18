// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";

import PlayerTable from "./PlayerTable";
import Search from "./Search";
import GameStatsPage from "./GameStats";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Home</Link> | <Link to="/search">Search</Link> | <Link to="/gamestats">Game Stats</Link>
        </nav>
        <Routes>
          <Route path="/" element={<PlayerTable />} />
          <Route path="/search" element={<Search />} />
          <Route path="/gamestats" element={<GameStatsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
