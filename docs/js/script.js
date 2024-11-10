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

