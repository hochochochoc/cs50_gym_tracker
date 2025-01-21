import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-black">
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="absolute inset-0 h-full w-full"
          particleColor="#FFFFFF"
        />
        <h1 className="glow-effect relative z-20 mb-8 text-center text-4xl font-bold text-white md:text-7xl lg:text-6xl">
          Welcome to CS50 Fitness Tracker
        </h1>
        <button
          onClick={() => navigate("/menu")}
          className="relative z-20 rounded-full bg-blue-950 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all hover:bg-blue-200 hover:shadow-xl"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
