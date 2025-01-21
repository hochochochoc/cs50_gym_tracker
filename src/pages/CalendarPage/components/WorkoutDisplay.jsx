import React, { useState, useRef, useEffect, useCallback } from "react";
import { Settings2, Save, GripHorizontal, X } from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import EditableField from "./EditableField";

const ANIMATION_DURATION = 500;
const SCROLL_ADJUSTMENT = 100;

const AnimatedExercise = ({
  exercise,
  exerciseIndex,
  isEditMode,
  isExpanded,
  onDelete,
  onUpdateReps,
  onUpdateWeight,
  onUpdateName,
  onAnimationStart,
  onAnimationEnd,
}) => {
  const contentRef = useRef(null);
  const cardRef = useRef(null);
  const animationRef = useRef(null);

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
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 999 : 0,
    position: "relative",
  };

  useEffect(() => {
    if (contentRef.current) {
      const contentElement = contentRef.current;
      animationRef.current?.cancel();

      const initialHeight = "0px";
      const finalHeight = `${contentElement.scrollHeight}px`;

      const animation = contentElement.animate(
        [
          {
            maxHeight: isExpanded ? initialHeight : finalHeight,
            opacity: isExpanded ? "0" : "1",
          },
          {
            maxHeight: isExpanded ? finalHeight : initialHeight,
            opacity: isExpanded ? "1" : "0",
          },
        ],
        {
          duration: ANIMATION_DURATION,
          easing: "ease-in-out",
          fill: "forwards",
        },
      );

      animationRef.current = animation;
      onAnimationStart();

      animation.onfinish = () => {
        onAnimationEnd();
      };

      return () => {
        animation.cancel();
      };
    }
  }, [isExpanded, onAnimationStart, onAnimationEnd]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-2 rounded-lg p-4 shadow-md transition-colors ${
        isDragging ? "bg-blue-50/20" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">
          <EditableField
            initialValue={exercise.name}
            onSave={(newName) => onUpdateName(exerciseIndex, newName)}
            type="text"
          />
        </h3>
        <div className="flex items-center gap-2">
          {!isEditMode && (
            <button
              onClick={() => onDelete(exerciseIndex)}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>
          )}
          {isEditMode && (
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab touch-none active:cursor-grabbing"
            >
              <GripHorizontal className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{
          maxHeight: isExpanded ? "none" : "0",
          opacity: isExpanded ? "1" : "0",
          transition: `opacity ${ANIMATION_DURATION}ms ease-in-out`,
        }}
      >
        <p className="mb-2 text-gray-600">
          Weight:{" "}
          <EditableField
            initialValue={exercise.sets[0].weight}
            onSave={(newWeight) =>
              onUpdateWeight(exerciseIndex, exercise.sets[0].weight, newWeight)
            }
          />{" "}
          kg
        </p>
        <div className="border-t border-gray-200">
          {exercise.sets.map((set, idx) => (
            <div key={idx} className="flex justify-between py-1">
              <span>Set {idx + 1}</span>
              <div className="flex items-center gap-1">
                <EditableField
                  initialValue={set.reps}
                  onSave={(newReps) =>
                    onUpdateReps(exerciseIndex, idx, newReps)
                  }
                />
                <span>reps</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnimatedWorkoutDisplay = ({
  date,
  workout,
  formatDate,
  isEditMode,
  setIsEditMode,
  sensors,
  hasChanges,
  handleDragEnd,
  deleteExercise,
  updateReps,
  updateWeight,
  updateName,
  updatePlanWithCurrentValues,
  addNewExercise,
}) => {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const animationInProgressRef = useRef(false);

  const handleAnimationStart = useCallback(() => {
    if (!animationInProgressRef.current) {
      animationInProgressRef.current = true;
      setAnimating(true);
    }
  }, []);

  const handleAnimationEnd = useCallback(() => {
    animationInProgressRef.current = false;
    setAnimating(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (animating || !workout) return;

      const container = containerRef.current;
      if (!container) return;

      const scrollPercentage =
        window.scrollY / (container.scrollHeight - window.innerHeight);
      const sectionSize = 1 / workout.exercises.length;
      const currentSection = Math.floor(scrollPercentage / sectionSize);
      const newIndex = Math.min(currentSection, workout.exercises.length - 1);

      if (newIndex !== expandedIndex) {
        // If last card is reached, scroll to bottom
        if (newIndex === workout.exercises.length - 1) {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
          });
        }

        // Try to scroll to make the new card fully visible
        if (cardsRef.current[newIndex]) {
          const cardElement = cardsRef.current[newIndex];
          const cardRect = cardElement.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          if (cardRect.top < 0) {
            window.scrollBy({
              top: cardRect.top - SCROLL_ADJUSTMENT,
              behavior: "smooth",
            });
          } else if (cardRect.bottom > windowHeight) {
            window.scrollBy({
              top: cardRect.bottom - windowHeight + SCROLL_ADJUSTMENT,
              behavior: "smooth",
            });
          }
        }

        setExpandedIndex(newIndex);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [workout, expandedIndex, animating]);

  if (!workout) return null;

  return (
    <div
      ref={containerRef}
      className="container mx-auto max-w-md px-4 py-3"
      style={{ minHeight: `${workout.exercises.length * 100}vh` }}
    >
      <div className="sticky top-4">
        <h1 className="mb-2 text-center text-xl font-bold text-gray-800">
          {formatDate(date)} - {workout.type}
        </h1>
        <div className="mb-4 flex justify-center gap-2">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            <Settings2 size={16} />
            {isEditMode ? "Done" : "Edit Order"}
          </button>
          <button
            onClick={addNewExercise}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            + Add Exercise
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={workout.exercises.map((_, index) => index)}
            strategy={verticalListSortingStrategy}
          >
            {workout.exercises.map((exercise, index) => (
              <AnimatedExercise
                key={`${exercise.name}-${index}`}
                exercise={exercise}
                exerciseIndex={index}
                isEditMode={isEditMode}
                isExpanded={expandedIndex === index}
                onDelete={deleteExercise}
                onUpdateReps={updateReps}
                onUpdateWeight={updateWeight}
                onUpdateName={updateName}
                onAnimationStart={handleAnimationStart}
                onAnimationEnd={handleAnimationEnd}
                ref={(el) => (cardsRef.current[index] = el)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {hasChanges && (
          <div className="my-4 text-center">
            <button
              onClick={updatePlanWithCurrentValues}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-sm text-blue-700 hover:bg-blue-300"
            >
              <Save size={16} />
              Update Plan Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedWorkoutDisplay;
