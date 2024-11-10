import { db } from "./firebase-config.js";
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Define the unique code here
const uniqueCode = "2025"; // Set your desired unique code here

document.addEventListener("DOMContentLoaded", () => {
    const amBar = document.getElementById("am-bar");
    const pmBar = document.getElementById("pm-bar");

    // Add more slots up to 3
    document.getElementById("add-slot").addEventListener("click", () => {
        const timeSlots = document.getElementById("time-slots");
        if (timeSlots.childElementCount < 3) {
            const newSlot = document.createElement("div");
            newSlot.className = "time-slot";
            newSlot.innerHTML = `
                <label>Time Slot ${timeSlots.childElementCount + 1}:</label>
                <input type="time" class="start-time" required>
                <input type="time" class="end-time" required>
            `;
            timeSlots.appendChild(newSlot);
        }
    });

    // Submit form data
    document.getElementById("availability-form").addEventListener("submit", async (event) => {
        event.preventDefault();

        // Get the name, code, and normalize the name
        const nameInput = document.getElementById("name").value.trim().toLowerCase();
        const enteredCode = document.getElementById("code").value.trim();

        // Check if the entered code matches the unique code
        if (enteredCode !== uniqueCode) {
            alert("Invalid code. Please enter the correct unique code.");
            return; // Exit the function if the code doesn't match
        }

        const timeSlots = Array.from(document.querySelectorAll(".time-slot")).map(slot => ({
            start: slot.querySelector(".start-time").value,
            end: slot.querySelector(".end-time").value
        }));

        try {
            const usersCollection = collection(db, "availability");

            // Check if a user with the normalized name exists
            const q = query(usersCollection, where("name", "==", nameInput));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.size >= 90) {
                alert("User limit reached. Please try again later.");
                return;
            }

            if (!querySnapshot.empty) {
                // Update existing user
                const userDoc = querySnapshot.docs[0];
                await updateDoc(doc(db, "availability", userDoc.id), { timeSlots });
                alert("Availability updated for existing user.");
            } else {
                // Add new user with normalized name
                await addDoc(usersCollection, { name: nameInput, timeSlots });
                alert("New user created and availability submitted.");
            }

            loadHeatmap(); // Refresh heatmap after submission
        } catch (error) {
            console.error("Error processing availability:", error);
        }
    });

    // Function to load and display heatmap
    async function loadHeatmap() {
        const amHours = Array(12).fill(0); // 00:00 to 11:00
        const pmHours = Array(12).fill(0); // 12:00 to 23:00

        const snapshot = await getDocs(collection(db, "availability"));
        snapshot.forEach(doc => {
            const timeSlots = doc.data().timeSlots;
            timeSlots.forEach(slot => {
                const startHour = parseInt(slot.start.split(":")[0]);
                const endHour = parseInt(slot.end.split(":")[0]);
                for (let i = startHour; i < endHour; i++) {
                    if (i < 12) amHours[i]++;
                    else pmHours[i - 12]++;
                }
            });
        });

        // Clear and populate AM bar
        amBar.innerHTML = "";
        amHours.forEach((count, hour) => {
            const cell = document.createElement("div");
            cell.className = count > 5 ? "high" : count > 2 ? "medium" : "low";
            cell.textContent = count > 0 ? count : ""; // Display count if more than 0
            amBar.appendChild(cell);
        });

        // Clear and populate PM bar
        pmBar.innerHTML = "";
        pmHours.forEach((count, hour) => {
            const cell = document.createElement("div");
            cell.className = count > 5 ? "high" : count > 2 ? "medium" : "low";
            cell.textContent = count > 0 ? count : ""; // Display count if more than 0
            pmBar.appendChild(cell);
        });
    }

    // Load heatmap on page load
    loadHeatmap();
});
