import { db } from "./firebase-config.js";

document.getElementById("availability-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const timeSlots = Array.from(document.querySelectorAll(".time-slot")).map(slot => ({
        start: slot.querySelector(".start-time").value,
        end: slot.querySelector(".end-time").value
    }));

    try {
        await db.collection("availability").add({ name, timeSlots });
        alert("Availability submitted!");
    } catch (error) {
        console.error("Error adding document: ", error);
    }
});
