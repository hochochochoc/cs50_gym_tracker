import React, { useState } from "react";
import { GripHorizontal, X } from "lucide-react";
import EditableField from "../EditableField";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS as DndCSS } from "@dnd-kit/utilities";
import WorkoutDisplay from "../WorkoutDisplay";
import { format } from "date-fns";
import { workoutService } from "@/services/workoutService";
import { planService } from "@/services/planService";

const SortableExercise = ({
  exercise,
  exerciseIndex,
  isEditMode,
  onDelete,
  onUpdateReps,
  onUpdateWeight,
  onUpdateName,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: exerciseIndex,
    transition: {
      duration: 300,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
    },
  });

  const style = {
    transform: DndCSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 0,
    position: "relative",
    backgroundColor: "white",
  };

  const weights = [...new Set(exercise.sets.map((set) => set.weight))];
  const weightDisplay = weights.map((weight, idx) => (
    <React.Fragment key={weight}>
      <EditableField
        initialValue={weight}
        onSave={(newWeight) => onUpdateWeight(exerciseIndex, weight, newWeight)}
      />
      {idx < weights.length - 1 ? "/" : ""}
    </React.Fragment>
  ));

  const formatRepsDisplay = (sets) => {
    return (
      <div className="flex flex-col space-y-1">
        {sets.map((set, idx) => (
          <div key={idx} className="flex items-center">
            <span className="w-16 text-sm text-gray-500">Set {idx + 1}:</span>
            <EditableField
              initialValue={`${set.reps} reps`}
              onSave={(newReps) => onUpdateReps(exerciseIndex, idx, newReps)}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 rounded-lg p-4 shadow-md transition-colors ${
        isDragging ? "bg-blue-50/20" : "bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        {isEditMode && (
          <div
            {...attributes}
            {...listeners}
            className="absolute right-6 top-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
          >
            <GripHorizontal className="h-6 w-6 text-gray-400" />
          </div>
        )}
        <h3 className="flex-1 text-lg font-bold">
          <EditableField
            initialValue={exercise.name}
            onSave={(newName) => onUpdateName(exerciseIndex, newName)}
            type="text"
          />
        </h3>
        {!isEditMode && (
          <button
            onClick={() => onDelete(exerciseIndex)}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={20} />
          </button>
        )}
      </div>
      <p className="mb-2 text-gray-600">Weight: {weightDisplay}kg</p>
      <div className="border-t border-gray-200">
        {exercise.sets.map((set, idx) => (
          <div key={idx} className="flex justify-between py-1">
            <span>Set {idx + 1}</span>
            <div className="flex items-center gap-1">
              <EditableField
                initialValue={set.reps}
                onSave={(newReps) => onUpdateReps(exerciseIndex, idx, newReps)}
              />
              <span>reps</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DayView = ({
  date,
  user,
  workout,
  setWorkout,
  formatDate,
  hasChanges,
  setHasChanges,
  setShowSuccess,
  sensors,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEmptyWorkout = async (workoutData) => {
    if (
      workoutData &&
      (!workoutData.exercises || workoutData.exercises.length === 0)
    ) {
      try {
        await workoutService.deleteWorkout(user.uid, date);
        setWorkout(null);
        return null;
      } catch (error) {
        console.error("Error deleting empty workout:", error);
      }
    }
    return workoutData;
  };

  const addNewExercise = async () => {
    if (!user || !date || !workout) return;

    const newExercise = {
      name: "New Exercise",
      sets: [
        { weight: "20", reps: 12 },
        { weight: "20", reps: 12 },
        { weight: "20", reps: 12 },
      ],
    };

    const updatedWorkout = {
      ...workout,
      exercises: [...workout.exercises, newExercise],
    };

    try {
      await workoutService.saveWorkout(user.uid, date, updatedWorkout);
      setWorkout(updatedWorkout);
      setHasChanges(true);
    } catch (error) {
      console.error("Error adding new exercise:", error);
      alert("Error adding new exercise");
    }
  };

  const updatePlanWithCurrentValues = async () => {
    if (!user || !date || !workout) return;

    try {
      const currentDayName = format(date, "EEEE").toLowerCase();
      const currentPlan = await planService.getPlan(user.uid, currentDayName);

      if (!currentPlan) return;

      const updatedPlan = {
        ...currentPlan,
        exercises: workout.exercises.map((workoutExercise) => {
          const planExercise = currentPlan.exercises.find(
            (e) => e.name === workoutExercise.name,
          );

          if (planExercise) {
            return {
              ...planExercise,
              sets: workoutExercise.sets.map((set) => ({
                weight: set.weight,
                reps: set.reps,
              })),
            };
          }
          return workoutExercise;
        }),
      };

      await planService.savePlan(user.uid, currentDayName, updatedPlan);
      setHasChanges(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = active.id;
    const newIndex = over.id;

    const updatedWorkout = {
      ...workout,
      exercises: arrayMove(workout.exercises, oldIndex, newIndex),
    };

    setWorkout(updatedWorkout);

    try {
      await workoutService.saveWorkout(user.uid, date, updatedWorkout);
      const processedWorkout = await handleEmptyWorkout(updatedWorkout);
      if (!processedWorkout) {
        setWorkout(null);
      }
    } catch (error) {
      console.error("Error updating workout order:", error);
      setWorkout(workout);
      alert("Error updating workout order");
    }
  };

  const updateReps = async (exerciseIndex, setIndex, newReps) => {
    if (!user || !date || !workout) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((exercise, exIdx) => {
        if (exIdx === exerciseIndex) {
          return {
            ...exercise,
            sets: exercise.sets.map((set, setIdx) => {
              if (setIdx === setIndex) {
                return { ...set, reps: newReps };
              }
              return set;
            }),
          };
        }
        return exercise;
      }),
    };

    try {
      await workoutService.saveWorkout(user.uid, date, updatedWorkout);
      const processedWorkout = await handleEmptyWorkout(updatedWorkout);
      setWorkout(processedWorkout);
      setHasChanges(true);
    } catch (error) {
      console.error("Error updating workout:", error);
    }
  };

  const updateWeight = async (exerciseIndex, oldWeight, newWeight) => {
    if (!user || !date || !workout) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((exercise, exIdx) => {
        if (exIdx === exerciseIndex) {
          return {
            ...exercise,
            sets: exercise.sets.map((set) => ({
              ...set,
              weight:
                set.weight === oldWeight ? newWeight.toString() : set.weight,
            })),
          };
        }
        return exercise;
      }),
    };

    try {
      await workoutService.saveWorkout(user.uid, date, updatedWorkout);
      const processedWorkout = await handleEmptyWorkout(updatedWorkout);
      setWorkout(processedWorkout);
      setHasChanges(true);
    } catch (error) {
      console.error("Error updating workout:", error);
    }
  };

  const deleteExercise = async (exerciseIndex) => {
    const exercises = workout.exercises.filter(
      (_, idx) => idx !== exerciseIndex,
    );

    try {
      if (exercises.length === 0) {
        await workoutService.deleteWorkout(user.uid, date);
        setWorkout(null);
      } else {
        const updatedWorkout = { ...workout, exercises };
        await workoutService.saveWorkout(user.uid, date, updatedWorkout);
        const processedWorkout = await handleEmptyWorkout(updatedWorkout);
        setWorkout(processedWorkout);
      }
    } catch (error) {
      console.error("Error updating/deleting workout:", error);
      alert("Error updating workout");
    }
  };

  const addSampleWorkout = async () => {
    if (!user || !date) return;

    try {
      const dayName = format(date, "EEEE");
      const dayPlan = await planService.getPlan(user.uid, dayName);

      if (!dayPlan) {
        alert("No plan found for " + dayName);
        return;
      }

      const workoutData = {
        type: dayPlan.type,
        exercises: dayPlan.exercises,
      };

      await workoutService.saveWorkout(user.uid, date, workoutData);
      const processedWorkout = await handleEmptyWorkout(workoutData);
      setWorkout(processedWorkout);
    } catch (error) {
      console.error("Error adding workout:", error);
      alert("Error adding workout");
    }
  };

  const updateName = async (exerciseIndex, newName) => {
    if (!user || !date || !workout) return;

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((exercise, exIdx) => {
        if (exIdx === exerciseIndex) {
          return {
            ...exercise,
            name: newName,
          };
        }
        return exercise;
      }),
    };

    try {
      await workoutService.saveWorkout(user.uid, date, updatedWorkout);
      const processedWorkout = await handleEmptyWorkout(updatedWorkout);
      setWorkout(processedWorkout);
      setHasChanges(true);
    } catch (error) {
      console.error("Error updating workout:", error);
    }
  };

  if (!workout) {
    return (
      <div className="container mx-auto max-w-md p-4 text-center">
        <p className="text-gray-700">No workout found for {formatDate(date)}</p>
        <button
          onClick={addSampleWorkout}
          className="mt-6 rounded-lg bg-gray-700 px-6 py-2 text-sm text-white shadow-md hover:bg-gray-600"
        >
          Add Workout
        </button>
      </div>
    );
  }

  return (
    <WorkoutDisplay
      date={date}
      workout={workout}
      formatDate={formatDate}
      isEditMode={isEditMode}
      setIsEditMode={setIsEditMode}
      sensors={sensors}
      hasChanges={hasChanges}
      handleDragEnd={handleDragEnd}
      SortableExercise={SortableExercise}
      deleteExercise={deleteExercise}
      updateReps={updateReps}
      updateWeight={updateWeight}
      updateName={updateName}
      updatePlanWithCurrentValues={updatePlanWithCurrentValues}
      addNewExercise={addNewExercise}
    />
  );
};

export default DayView;
