import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: "mas-project-702bd.firebaseapp.com",
  projectId: "mas-project-702bd",
  storageBucket: "mas-project-702bd.firebasestorage.app",
  messagingSenderId: "257967195878",
  appId: "1:257967195878:web:7b9717277f431448f51d27",
  measurementId: "G-5QNDBPTBYC"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const FIRESTORE_DB = getFirestore(app);
export const auth = getAuth(app);
export default app;
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase