import React from "react";
import ProgressAnalysis from "./components/ProgressAnalysis";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import UniqueVisitorCard from "./templateChart/UniqueVisitorCard";
import BottomNav from "@/components/BottomNav";

export default function HistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-300 p-2">
      <div className="mx-auto max-w-6xl rounded-3xl bg-white/80 p-3">
        <h2 className="mt-1 text-center text-2xl font-bold text-blue-400">
          History
        </h2>
        <UniqueVisitorCard />
      </div>
      <ProgressAnalysis />
      <button className="text-transparent" onClick={() => navigate("/map")}>
        secret map page
      </button>
      <BottomNav />
    </div>
  );
}
