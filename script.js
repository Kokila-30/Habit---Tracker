const rows = 10;
const days = 31;

const daysRow = document.getElementById("daysRow");
const habitBody = document.getElementById("habitBody");

let currentKey = "habitTracker_default";
let data = {};

/* 🔴 FIX: USER + MONTH STORAGE (STABLE) */
const username = document.getElementById("username");
const monthPicker = document.getElementById("monthPicker");

/* SAVE KEY */
function generateStorageKey() {
    const name = username.value.trim() || "guest";
    const month = monthPicker.value || "default";
    return `habitTracker_${name}_${month}`;
}

/* SAVE DATA */
function saveData() {
    currentKey = generateStorageKey();
    localStorage.setItem(currentKey, JSON.stringify(data));
}

/* LOAD DATA */
function loadData() {
    currentKey = generateStorageKey();
    const saved = localStorage.getItem(currentKey);
    data = saved ? JSON.parse(saved) : {};
    refreshUI();
}

/* DAYS HEADER */
for (let i = 1; i <= days; i++) {
    const th = document.createElement("th");
    th.innerText = i;
    daysRow.appendChild(th);
}

/* HABITS */
for (let row = 0; row < rows; row++) {

    const tr = document.createElement("tr");

    const serialTd = document.createElement("td");
    serialTd.innerText = row + 1;
    tr.appendChild(serialTd);

    const tdName = document.createElement("td");
    const input = document.createElement("input");

    input.type = "text";
    input.placeholder = "Enter details...";
    input.classList.add("habit-input");

    input.addEventListener("input", () => {
        data[`habit_${row}`] = input.value;
        saveData();
    });

    tdName.appendChild(input);
    tr.appendChild(tdName);

    for (let day = 1; day <= days; day++) {

        const td = document.createElement("td");
        const box = document.createElement("div");

        box.classList.add("check-box");

        const key = `habit_${row}_${day}`;

        box.addEventListener("click", () => {
            box.classList.toggle("completed");
            data[key] = box.classList.contains("completed");
            saveData();
            updateStats();
        });

        td.appendChild(box);
        tr.appendChild(td);
    }

    habitBody.appendChild(tr);
}

/* 🔴 FIXED USER + MONTH INPUT (IMPORTANT) */
username.addEventListener("input", () => {
    localStorage.setItem("lastUsername", username.value);
    currentKey = generateStorageKey();
    loadData();
});

monthPicker.addEventListener("change", () => {
    localStorage.setItem("lastMonth", monthPicker.value);
    currentKey = generateStorageKey();
    loadData();
});

/* STATS */
function updateStats() {
    const completed = document.querySelectorAll(".completed").length;
    const total = rows * days;
    const percent = Math.round((completed / total) * 100);

    document.getElementById("completedCount").innerText = completed;
    document.getElementById("progressPercent").innerText = percent + "%";
}

/* REFRESH UI */
function refreshUI() {

    /* 🔴 FIX: stable load */
    username.value = localStorage.getItem("lastUsername") || "";
    monthPicker.value = localStorage.getItem("lastMonth") || "";

    const habitInputs = document.querySelectorAll(".habit-input");

    for (let row = 0; row < rows; row++) {
        habitInputs[row].value = data[`habit_${row}`] || "";

        for (let day = 1; day <= days; day++) {

            const key = `habit_${row}_${day}`;

            const tableRow = habitBody.children[row];
            const cell = tableRow.children[day + 1];
            const box = cell.querySelector(".check-box");

            if (data[key]) {
                box.classList.add("completed");
            } else {
                box.classList.remove("completed");
            }
        }
    }

    /* GOALS */
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`goal${i}`).value = data[`goal_${i}`] || "";
        document.getElementById(`goalCheck${i}`).checked = data[`goalCheck_${i}`] || false;
    }

    /* NOTES */
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`note${i}`).value = data[`note_${i}`] || "";
    }

    refreshSleepGraph();
    updateStats();
}

/* GOALS + NOTES */
for (let i = 1; i <= 5; i++) {

    document.getElementById(`goal${i}`).addEventListener("input", (e) => {
        data[`goal_${i}`] = e.target.value;
        saveData();
    });

    document.getElementById(`goalCheck${i}`).addEventListener("change", (e) => {
        data[`goalCheck_${i}`] = e.target.checked;
        saveData();
    });

    document.getElementById(`note${i}`).addEventListener("input", (e) => {
        data[`note_${i}`] = e.target.value;
        saveData();
    });
}

/* INITIAL LOAD */
window.addEventListener("load", () => {
    const savedUsername = localStorage.getItem("lastUsername");
    const savedMonth = localStorage.getItem("lastMonth");

    if (savedUsername) username.value = savedUsername;

    if (savedMonth) {
        monthPicker.value = savedMonth;
    } else {
        const today = new Date();
        monthPicker.value = today.toISOString().slice(0, 7);
    }

    loadData();
});

/* RESIZE FIX */
window.addEventListener("resize", () => {
    refreshSleepGraph();
});
