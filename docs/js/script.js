import { db } from "./firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
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

    // Submit availability data to Firestore
    document.getElementById("availability-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = document.getElementById("name").value;
        const timeSlots = Array.from(document.querySelectorAll(".time-slot")).map(slot => ({
            start: slot.querySelector(".start-time").value,
            end: slot.querySelector(".end-time").value
        }));

        try {
            await addDoc(collection(db, "availability"), { name, timeSlots });
            alert("Availability submitted!");
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    });
});
