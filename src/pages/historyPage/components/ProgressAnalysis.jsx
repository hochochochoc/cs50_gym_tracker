import React, { useState, useEffect } from "react";
import { workoutService } from "@/services/workoutService";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ProgressAnalysis = () => {
  const [progress, setProgress] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const analyzeProgress = async () => {
      if (!user) return;
      const workouts = await workoutService.getAllWorkouts(user.uid);

      const exerciseMap = new Map();

      workouts.forEach((workout) => {
        if (!workout.exercises) return;

        workout.exercises.forEach((exercise) => {
          if (!exerciseMap.has(exercise.name)) {
            exerciseMap.set(exercise.name, []);
          }
          exerciseMap.get(exercise.name).push({
            date: workout.timestamp,
            weight: exercise.sets[0]?.weight || 0,
            reps: Math.max(
              ...exercise.sets.map((set) => parseInt(set?.reps) || 0),
            ),
          });
        });
      });

      const progressData = [];

      exerciseMap.forEach((data, exercise) => {
        const sorted = data.sort((a, b) => a.date - b.date);
        if (sorted.length < 2) return;

        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        const weightChange = last.weight - first.weight;
        const repsChange = last.reps - first.reps;

        progressData.push({
          exercise,
          weightChange,
          repsChange,
          status:
            weightChange > 0
              ? "gain"
              : weightChange < 0
                ? "loss"
                : repsChange > 0
                  ? "gain"
                  : repsChange < 0
                    ? "loss"
                    : "neutral",
        });
      });

      setProgress(progressData.sort((a, b) => b.weightChange - a.weightChange));
    };

    analyzeProgress();
  }, [user]);

  const totalGains = progress.filter((p) => p.status === "gain").length;
  const totalLosses = progress.filter((p) => p.status === "loss").length;

  return (
    <div className="mt-2 rounded-3xl bg-white/85 shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Progress Summary
          </h2>
          <p className="text-sm text-gray-600">
            {totalGains} gains · {totalLosses} losses
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-6 border-t p-4">
          <section>
            <h3 className="mb-3 text-base font-semibold text-gray-800">
              Gains
            </h3>
            <div className="space-y-2">
              {progress
                .filter((p) => p.status === "gain")
                .map(({ exercise, weightChange, repsChange }) => (
                  <div
                    key={exercise}
                    className="flex items-center space-x-2 text-green-500"
                  >
                    <ArrowUp className="h-4 w-4" />
                    <span className="font-medium">{exercise}:</span>
                    <span>{weightChange > 0 ? `+${weightChange}kg` : ""}</span>
                    <span
                      className={
                        repsChange > 0
                          ? "text-green-500"
                          : repsChange < 0
                            ? "text-gray-500"
                            : ""
                      }
                    >
                      {repsChange !== 0 &&
                        `(${repsChange > 0 ? "+" : ""}${repsChange} reps)`}
                    </span>
                  </div>
                ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-semibold text-gray-800">
              Losses
            </h3>
            <div className="space-y-2">
              {progress
                .filter((p) => p.status === "loss")
                .map(({ exercise, weightChange, repsChange }) => (
                  <div
                    key={exercise}
                    className="flex items-center space-x-2 text-red-500"
                  >
                    <ArrowDown className="h-4 w-4" />
                    <span className="font-medium">{exercise}:</span>
                    <span>{weightChange !== 0 && `${weightChange}kg`}</span>
                    <span>
                      {repsChange !== 0 &&
                        `(${repsChange > 0 ? "+" : ""}${repsChange} reps)`}
                    </span>
                  </div>
                ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-base font-semibold text-gray-800">
              No Change
            </h3>
            <div className="space-y-2">
              {progress
                .filter((p) => p.status === "neutral")
                .map(({ exercise }) => (
                  <div
                    key={exercise}
                    className="flex items-center space-x-2 text-gray-500"
                  >
                    <Minus className="h-4 w-4" />
                    <span className="font-medium">{exercise}</span>
                  </div>
                ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ProgressAnalysis;
