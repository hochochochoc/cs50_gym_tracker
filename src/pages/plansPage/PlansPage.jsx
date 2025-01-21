import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { planService } from "@/services/planService";
import { defaultWorkoutPlans } from "./components/defaultData";
import BottomNav from "@/components/BottomNav";
import EditableField from "./components/EditableField";

const PlansPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openDay, setOpenDay] = useState(null);
  const [workoutPlans, setWorkoutPlans] = useState({});

  useEffect(() => {
    if (!user) return;
    planService.getAllPlans(user.uid).then((savedPlans) => {
      if (Object.keys(savedPlans).length === 0) {
        Object.entries(defaultWorkoutPlans).forEach(([day, plan]) => {
          planService.savePlan(user.uid, day, plan);
        });
        setWorkoutPlans(defaultWorkoutPlans);
      } else {
        setWorkoutPlans(savedPlans);
      }
    });
  }, [user]);

  const updatePlan = async (
    day,
    exerciseIndex,
    field,
    value,
    subIndex = null,
  ) => {
    if (!user) return;
    const dayLower = day.toLowerCase();
    const exercises = workoutPlans[dayLower].exercises;

    exercises[exerciseIndex][field] =
      field === "sets"
        ? exercises[exerciseIndex].sets.map((set, idx) =>
            idx === subIndex ? { ...set, reps: value } : set,
          )
        : value;

    const updatedPlan = { ...workoutPlans[dayLower], exercises };
    await planService.savePlan(user.uid, dayLower, updatedPlan);
    setWorkoutPlans({ ...workoutPlans, [dayLower]: updatedPlan });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-300 p-2">
      <div className="min-h-[97.5vh] rounded-3xl bg-white/80 px-3 py-4">
        <h2 className="mb-4 text-center text-2xl font-bold text-blue-400">
          Plans
        </h2>
        {[
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].map((day) => {
          const workout = workoutPlans[day?.toLowerCase()] || {
            type: "Rest",
            exercises: [],
          };
          const isOpen = openDay === day;

          return (
            <div
              key={day}
              className="mb-3 overflow-hidden rounded-xl border-[1px] border-white bg-white/40 shadow-lg"
            >
              <div
                onClick={() => setOpenDay(isOpen ? null : day)}
                className="flex cursor-pointer items-center justify-between px-5 py-3 transition-colors hover:bg-blue-50/50"
              >
                <h2 className="text-[16px] font-semibold text-blue-900">
                  {day} - {workout.type}
                </h2>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-blue-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-500" />
                )}
              </div>

              {isOpen && (
                <div className="border-t border-blue-100/50 px-5 py-3">
                  {workout.type === "Rest" ? (
                    <p className="text-center italic text-blue-600">Rest Day</p>
                  ) : (
                    workout.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="rounded-2xl bg-transparent p-2 px-4 last:mb-0"
                      >
                        <h2 className="font-bold text-blue-900">
                          <EditableField
                            initialValue={exercise.name}
                            onSave={(value) =>
                              updatePlan(day, index, "name", value)
                            }
                            type="text"
                          />
                        </h2>
                        <p className="text-blue-700">
                          Weight: {exercise.sets[0].weight}kg
                        </p>
                        <p className="mt-0.5 text-blue-700">
                          Reps:{" "}
                          {exercise.sets.map((set, idx) => (
                            <EditableField
                              key={idx}
                              initialValue={set.reps}
                              onSave={(value) =>
                                updatePlan(day, index, "sets", value, idx)
                              }
                            />
                          ))}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
};

export default PlansPage;
