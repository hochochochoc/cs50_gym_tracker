import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  getFirestore,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const planService = {
  async savePlan(userId, day, planData) {
    const planRef = doc(db, "users", userId, "plans", day.toLowerCase());

    // Include the day in the plan data
    const planWithMetadata = {
      ...planData,
      day: day.toLowerCase(),
      lastUpdated: new Date().getTime(),
    };

    await setDoc(planRef, planWithMetadata);
  },

  async getPlan(userId, day) {
    const planRef = doc(db, "users", userId, "plans", day.toLowerCase());
    const planSnap = await getDoc(planRef);

    if (planSnap.exists()) {
      return planSnap.data();
    }
    return null;
  },

  async deletePlan(userId, day) {
    const planRef = doc(db, "users", userId, "plans", day.toLowerCase());
    await deleteDoc(planRef);
  },

  async getAllPlans(userId) {
    const plansRef = collection(db, "users", userId, "plans");
    const querySnapshot = await getDocs(plansRef);

    const plans = {};
    querySnapshot.forEach((doc) => {
      // Store plans in an object with day as key for easier access
      plans[doc.id] = {
        ...doc.data(),
        id: doc.id,
      };
    });

    return plans;
  },
};
