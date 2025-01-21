// src/services/workoutService.js
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import format from "date-fns/format";

const formatDateForStorage = (date) => {
  return format(date, "yyyy-MM-dd");
};

export const workoutService = {
  async saveWorkout(userId, date, workoutData) {
    const formattedDate = formatDateForStorage(date);
    const workoutRef = doc(db, "users", userId, "workouts", formattedDate);

    // Include the date and formatted date in the workout data
    const workoutWithDate = {
      ...workoutData,
      date: formattedDate,
      timestamp: date.getTime(), // Add timestamp for sorting if needed
    };

    await setDoc(workoutRef, workoutWithDate);
  },

  async getWorkout(userId, date) {
    const formattedDate = formatDateForStorage(date);
    const workoutRef = doc(db, "users", userId, "workouts", formattedDate);
    const workoutSnap = await getDoc(workoutRef);

    if (workoutSnap.exists()) {
      return workoutSnap.data();
    }
    return null;
  },

  async deleteWorkout(userId, date) {
    const formattedDate = formatDateForStorage(date);
    const workoutRef = doc(db, "users", userId, "workouts", formattedDate);
    await deleteDoc(workoutRef);
  },

  async getAllWorkouts(userId) {
    const workoutsRef = collection(db, "users", userId, "workouts");
    const querySnapshot = await getDocs(workoutsRef);

    const workouts = [];
    querySnapshot.forEach((doc) => {
      // Include the document ID (which is the date) in the data
      workouts.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    return workouts.sort((a, b) => b.timestamp - a.timestamp); // Sort by date, newest first
  },
};
