// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase configuration (replace with your actual config details)
const firebaseConfig = {
    apiKey: "AIzaSyA6q8CPgElJgXS-ZyYe-I9EZ6hUmNAiDQ8",
    authDomain: "timesheet-41ba1.firebaseapp.com",
    databaseURL: "https://timesheet-41ba1-default-rtdb.firebaseio.com",
    projectId: "timesheet-41ba1",
    storageBucket: "timesheet-41ba1.appspot.com",
    messagingSenderId: "323254867187",
    appId: "1:323254867187:web:7eb1a2e25e0c5e40275386",
    measurementId: "G-RQJ96JJGN4"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
