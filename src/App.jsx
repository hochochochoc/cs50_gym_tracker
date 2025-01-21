import React, { useState } from "react";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import MenuPage from "./pages/menuPage/MenuPage";
import CalendarPage from "./pages/CalendarPage/CalendarPage.jsx";
import ProfilePage from "./pages/profilePage/ProfilePage";
import PlansPage from "./pages/plansPage/PlansPage";
import HistoryPage from "./pages/historyPage/HistoryPage";
import LandingPage from "./pages/landingPage/LandingPage";
import { AuthProvider } from "./contexts/AuthContext";
import MapPage from "./pages/mapPage/MapPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
