import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import ChangePopup from "./components/ChangePopup";
import DayView from "./components/dayView/DayView";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { format, isFuture } from "date-fns";
import { workoutService } from "../../services/workoutService";
import { useAuth } from "../../contexts/AuthContext";

export default function CalendarPage() {
  const [daySelected, setDaySelected] = useState(false);
  const [workout, setWorkout] = useState(null);
  const navigate = useNavigate();
  const [date, setDate] = useState(null);
  const { user } = useAuth();
  const [displayedMonth, setDisplayedMonth] = useState(new Date());
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 10,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  const formatDate = (date) => {
    const day = format(date, "d");
    const month = format(date, "MMM");
    const weekday = format(date, "EEE");
    const year = format(date, "yyyy");
    const currentYear = format(new Date(), "yyyy");

    if (year !== currentYear) {
      return `${month} ${day} ${weekday} ${year}`;
    }
    return `${month} ${day} ${weekday}`;
  };

  const handleBack = () => {
    if (daySelected === false) {
      navigate("/menu");
    } else {
      setDaySelected(false);
      setDate(null);
      setWorkout(null);
    }
  };

  useEffect(() => {
    const fetchWorkout = async () => {
      if (user && date) {
        const workoutData = await workoutService.getWorkout(user.uid, date);
        const processedWorkout = await handleEmptyWorkout(workoutData);
        setWorkout(processedWorkout);
      }
    };

    fetchWorkout();
  }, [date, user]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <ChangePopup show={showSuccess} onClose={() => setShowSuccess(false)} />

      {/* Header */}
      <div className="relative flex items-center bg-gray-700 px-4 py-5 text-white shadow">
        <ArrowLeft className="cursor-pointer" onClick={handleBack} />
        <h1 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold">
          Calendar
        </h1>
      </div>

      {/* Main Content with padding for dock */}
      <div className="flex-1">
        {daySelected === false ? (
          <div className="container mx-auto max-w-sm p-4 md:flex">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setDate(newDate);
                  setDaySelected(true);
                }
              }}
              disabled={(date) => isFuture(date)}
              className="rounded-xl border bg-white shadow-lg"
              weekStartsOn={1}
              month={displayedMonth}
              onMonthChange={setDisplayedMonth}
            />
          </div>
        ) : (
          <DayView
            date={date}
            user={user}
            workout={workout}
            setWorkout={setWorkout}
            formatDate={formatDate}
            hasChanges={hasChanges}
            setHasChanges={setHasChanges}
            setShowSuccess={setShowSuccess}
            sensors={sensors}
          />
        )}
      </div>
    </div>
  );
}
