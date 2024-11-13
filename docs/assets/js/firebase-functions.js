import { db } from "./firebase-config.js";
import { collection, getDocs, query, where, addDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("availability-modal");
    const openModalBtn = document.querySelector(".button.primary");
    const closeModalBtn = document.getElementById("close-modal");

    openModalBtn.addEventListener("click", () => modal.classList.add("active"));
    closeModalBtn.addEventListener("click", () => modal.classList.remove("active"));

    window.addEventListener("click", (event) => {
        if (event.target === modal) modal.classList.remove("active");
    });

    const weekdaysBtn = document.getElementById("weekdays-btn");
    const weekendBtn = document.getElementById("weekend-btn");
    const amBar = document.getElementById("am-bar");
    const pmBar = document.getElementById("pm-bar");

    weekdaysBtn.addEventListener("click", () => toggleDayType("weekday"));
    weekendBtn.addEventListener("click", () => toggleDayType("weekend"));

    let selectedType = "weekday";

    function toggleDayType(type) {
        selectedType = type;
        weekdaysBtn.classList.toggle("active", type === "weekday");
        weekendBtn.classList.toggle("active", type === "weekend");

        document.getElementById("heatmap-title").textContent =
            type === "weekday" ? "Weekdays Availability Heatmap" : "Weekend Availability Heatmap";

        loadHeatmap();
    }

    document.getElementById("availability-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const nameInput = document.getElementById("name").value.trim().toLowerCase();
        const enteredCode = document.getElementById("code").value.trim();

        if (enteredCode !== "2025") {
            alert("Invalid code. Please enter the correct unique code.");
            return;
        }

        const timeSlots = Array.from(document.querySelectorAll(".time-slot")).map(slot => ({
            start: slot.querySelector(".start-time").value,
            end: slot.querySelector(".end-time").value
        }));

        const usersCollection = collection(db, "availability");
        const q = query(usersCollection, where("name", "==", nameInput));
        const querySnapshot = await getDocs(q);

        const updateField = selectedType === "weekday" ? "weekdayTimeSlots" : "weekendTimeSlots";

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, "availability", userDoc.id), { [updateField]: timeSlots });
            alert(`Availability updated for existing user (${selectedType}).`);
        } else {
            await addDoc(usersCollection, {
                name: nameInput,
                weekdayTimeSlots: selectedType === "weekday" ? timeSlots : [],
                weekendTimeSlots: selectedType === "weekend" ? timeSlots : []
            });
            alert(`New user created with ${selectedType} availability.`);
        }
        loadHeatmap();
    });

    async function loadHeatmap() {
        const amHours = Array(12).fill(0);
        const pmHours = Array(12).fill(0);

        const snapshot = await getDocs(collection(db, "availability"));
        snapshot.forEach(doc => {
            const timeSlots = doc.data()[selectedType === "weekday" ? "weekdayTimeSlots" : "weekendTimeSlots"] || [];
            timeSlots.forEach(slot => {
                const startHour = parseInt(slot.start.split(":")[0]);
                const endHour = parseInt(slot.end.split(":")[0]);

                if (startHour <= endHour) {
                    for (let i = startHour; i < endHour; i++) {
                        if (i < 12) amHours[i]++;
                        else pmHours[i - 12]++;
                    }
                } else {
                    for (let i = startHour; i < 24; i++) {
                        if (i < 12) pmHours[i - 12]++;
                        else pmHours[i - 12]++;
                    }
                    for (let i = 0; i < endHour; i++) {
                        if (i < 12) amHours[i]++;
                        else amHours[i - 12]++;
                    }
                }
            });
        });

        amBar.innerHTML = "";
        amHours.forEach((count) => {
            const cell = document.createElement("div");
            cell.className = count > 5 ? "high" : count > 2 ? "medium" : "low";
            cell.textContent = count > 0 ? count : "";
            amBar.appendChild(cell);
        });

        pmBar.innerHTML = "";
        pmHours.forEach((count) => {
            const cell = document.createElement("div");
            cell.className = count > 5 ? "high" : count > 2 ? "medium" : "low";
            cell.textContent = count > 0 ? count : "";
            pmBar.appendChild(cell);
        });
    }

    const timeZones = {
        "New_York": "America/New_York",
        "London": "Europe/London",
        "Sydney": "Australia/Sydney",
        "Tokyo": "Asia/Tokyo",
        "Istanbul": "Europe/Istanbul",
        "Berlin": "Europe/Berlin",
        "Los_Angeles": "America/Los_Angeles",
        "Shanghai": "Asia/Shanghai",
        "Seoul": "Asia/Seoul",
        "Cairo": "Africa/Cairo",
        "Helsinki": "Europe/Helsinki",
        "Moscow": "Europe/Moscow",
        "Taipei": "Asia/Taipei",
        "Sao_Paulo": "America/Sao_Paulo",
        "Buenos_Aires": "America/Argentina/Buenos_Aires",
        "Paris": "Europe/Paris",
        "Madrid": "Europe/Madrid"
    };

    document.getElementById("convert-time").addEventListener("click", () => {
        const serverTimeInput = document.getElementById("server-time").value;
        const city = document.getElementById("city").value;

        if (!serverTimeInput) {
            alert("Please enter the server time (UTC).");
            return;
        }

        const [hours, minutes] = serverTimeInput.split(":").map(Number);
        const utcDate = new Date();
        utcDate.setUTCHours(hours, minutes, 0, 0);

        const timeZone = timeZones[city];
        const options = {
            timeZone: timeZone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        const convertedTime = new Intl.DateTimeFormat('en-GB', options).format(utcDate);

        const cityName = document.getElementById("city").selectedOptions[0].textContent;
        const display = document.getElementById("converted-time-display");
        display.textContent = `${cityName}: ${convertedTime}`;
    });

    toggleDayType("weekday");
});
