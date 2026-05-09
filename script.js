const rows = 10;
const days = 31;
const daysRow =
document.getElementById("daysRow");
const habitBody =
document.getElementById("habitBody");
let currentKey =
"habitTracker_default";
let data = {};
function generateStorageKey()
{
    const username =
    document.getElementById("username")
    ?.value?.trim() || "guest";
    const month =
    document.getElementById("monthPicker")
    ?.value || "default";
    return `habitTracker_${username}_${month}`;
}
function saveData()
{
    currentKey = generateStorageKey();
    localStorage.setItem(currentKey,JSON.stringify(data));
}
function loadData()
{
    currentKey =generateStorageKey();
    const saved =localStorage.getItem(currentKey);
    data = saved ? JSON.parse(saved) : {};
    refreshUI();
}
/* DAYS */
for(let i=1; i<=days; i++)
    {
    const th = document.createElement("th");
    th.innerText = i;
    daysRow.appendChild(th);
}
/* HABIT ROWS */
for(let row=0; row<rows; row++){
    const tr = document.createElement("tr");
    /* SERIAL NUMBER */
    const serialTd = document.createElement("td");
    serialTd.innerText = row + 1;
    serialTd.classList.add( "serial-number");
    tr.appendChild(serialTd);

    /* HABIT INPUT */
    const tdName = document.createElement("td");
    const input =  document.createElement("input");
    input.type = "text";
    input.placeholder = "Enter details...";
    input.classList.add("habit-input");
    input.addEventListener("input", ()=>
        { data[`habit_${row}`] = input.value;
        saveData();
    });
    tdName.appendChild(input);
    tr.appendChild(tdName);

    /* CHECKBOXES */
    for(let day=1; day<=days; day++){
        const td =  document.createElement("td");
        const box = document.createElement("div");
        box.classList.add("check-box");
        const key =`habit_${row}_${day}`;
        box.addEventListener("click", ()=>{ box.classList.toggle("completed" );
            data[key] = box.classList.contains("completed");
            saveData();
            updateStats();
        });
        td.appendChild(box);
        tr.appendChild(td);
    }
    habitBody.appendChild(tr);
}

/* USER + MONTH */
const username = document.getElementById( "username");
const monthPicker = document.getElementById("monthPicker");
username.addEventListener("input",()=>{
    localStorage.setItem("lastUsername",username.value);
});

monthPicker.addEventListener("change",()=>{
    // SAVE MONTH
    localStorage.setItem("lastMonth",monthPicker.value );
    // LOAD MONTH DATA
    loadData();
});

/* STATS */
function updateStats()
{
    const completed = document.querySelectorAll(".completed").length;
    const total = rows * days;
    const percent = Math.round((completed / total) * 100);
    document.getElementById("completedCount").innerText = completed;
    document.getElementById("progressPercent").innerText =percent + "%";
}

/* REFRESH UI */
function refreshUI()
{
    username.value = data.username || "";
    monthPicker.value = data.month || "";
    const habitInputs = document.querySelectorAll(".habit-input");
    for(let row=0; row<rows; row++)
        {
        habitInputs[row].value = data[`habit_${row}`] || "";
        for(let day=1; day<=days; day++)
            {
            const key = `habit_${row}_${day}`;
            const tableRow = habitBody.children[row];
            const cell = tableRow.children[day + 1];
            const box = cell.querySelector(".check-box");
            if(data[key])
                {
                box.classList.add("completed");
            }else{
                 box.classList.remove(
                    "completed"
                );
            }
        }
    }

    /* GOALS */
    for(let i=1; i<=5; i++)
        {
        const goalInput = document.getElementById( `goal${i}` );
        const goalCheck = document.getElementById(  `goalCheck${i}` );
        goalInput.value = data[`goal_${i}`] || "";
        goalCheck.checked = data[`goalCheck_${i}`]|| false;
    }

    /* NOTES */
    for(let i=1; i<=5; i++)
        {
        const note = document.getElementById(`note${i}` );
        note.value = data[`note_${i}`] || "";
    }
    refreshSleepGraph();
    updateStats();
}

/* GOALS + NOTES */
for(let i=1; i<=5; i++)
    {
    const goalInput = document.getElementById(`goal${i}`);
    const goalCheck = document.getElementById(`goalCheck${i}` );
    const note = document.getElementById(`note${i}`);
    goalInput.addEventListener("input",()=>{data[`goal_${i}`] = goalInput.value;
        saveData();
    });

    goalCheck.addEventListener("change",()=>
        {
        data[`goalCheck_${i}`] = goalCheck.checked;
        saveData();
    });

    note.addEventListener( "input", ()=>{ data[`note_${i}`] = note.value;
        saveData();
    });
}

/* SLEEP */
const sleepLevels = [9,8,7,6,5];
const sleepDays = document.getElementById( "sleepDays");
const sleepBody = document.getElementById( "sleepBody");
const sleepSVG = document.getElementById( "sleepSVG");


/* SLEEP DAYS */
for(let day=1; day<=31; day++){

    const th =  document.createElement("th");
    th.innerText = day;
    sleepDays.appendChild(th);
}

/* SLEEP ROWS */
sleepLevels.forEach(level=>{
    const tr = document.createElement("tr");
    const label = document.createElement("td");
    label.innerText = level + " hrs";
    label.classList.add("sleep-label");
    tr.appendChild(label);
    for(let day=1; day<=31; day++){

        const td = document.createElement("td");
        td.classList.add( "sleep-cell");
        const dot = document.createElement("div");
        dot.classList.add("sleep-dot" );

        dot.addEventListener("click", ()=>
            {
            data[`sleep_${day}`] = level;
            saveData();
            refreshSleepGraph();
        });
        td.appendChild(dot);
        tr.appendChild(td);
    }
    sleepBody.appendChild(tr);
});

function refreshSleepGraph(){

    document
    .querySelectorAll(".sleep-dot")
    .forEach(dot=>{

        dot.classList.remove("active");
    });

    let points = [];

    const graphContainer =
    document.querySelector(
        ".graph-container"
    );

    const containerRect =
    graphContainer.getBoundingClientRect();

    sleepLevels.forEach((level,rowIndex)=>{

        for(let day=1; day<=31; day++){

            if(data[`sleep_${day}`] == level){

                const row =
                sleepBody
                .querySelectorAll("tr")[rowIndex];

                const cell =
                row
                .querySelectorAll(".sleep-cell")[day - 1];

                const dot =
                cell.querySelector(".sleep-dot");

                dot.classList.add("active");

                // MOBILE SAFE POSITION

                const dotRect =
                dot.getBoundingClientRect();

                const x =
                dotRect.left -
                containerRect.left +
                graphContainer.scrollLeft +
                (dotRect.width / 2);

                const y =
                dotRect.top -
                containerRect.top +
                graphContainer.scrollTop +
                (dotRect.height / 2);

                points.push({
                    x,
                    y,
                    day
                });
            }
        }
    });

    points.sort((a,b)=>a.day-b.day);

    drawSleepLine(points);
}
/* DRAW GRAPH */
function drawSleepLine(points){

    sleepSVG.innerHTML = "";

    const graphContainer =
    document.querySelector(
        ".graph-container"
    );

    const table =
    document.getElementById(
        "sleepTable"
    );

    // MOBILE WIDTH FIX

    sleepSVG.setAttribute(
        "width",
        table.scrollWidth
    );

    sleepSVG.setAttribute(
        "height",
        table.scrollHeight
    );

    sleepSVG.style.width =
    table.scrollWidth + "px";

    sleepSVG.style.height =
    table.scrollHeight + "px";

    if(points.length < 2){
        return;
    }

    let d = "";

    points.forEach((point,index)=>{

        if(index === 0){

            d += `M ${point.x} ${point.y}`;

        }else{

            d += ` L ${point.x} ${point.y}`;
        }
    });

    const path =
    document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
    );

    path.setAttribute("d", d);

    path.setAttribute(
        "fill",
        "none"
    );

    path.setAttribute(
        "stroke",
        "#8338ec"
    );

    path.setAttribute(
        "stroke-width",
        "4"
    );

    path.setAttribute(
        "stroke-linecap",
        "round"
    );

    path.setAttribute(
        "stroke-linejoin",
        "round"
    );

    sleepSVG.appendChild(path);
}

/* INITIAL LOAD */
window.addEventListener("load",()=>{
    // LOAD SAVED USERNAME
    const savedUsername = localStorage.getItem( "lastUsername");
    if(savedUsername){ username.value = savedUsername;
    }

    // LOAD SAVED MONTH
    const savedMonth = localStorage.getItem("lastMonth");
    if(savedMonth)
        {
        monthPicker.value =
        savedMonth;
    }else
    {
        // DEFAULT CURRENT MONTH
        const today = new Date();
        monthPicker.value = today .toISOString().slice(0,7);
    }
    // LOAD DATA
    loadData();
});
// REDRAW ON MOBILE RESIZE

window.addEventListener(
    "resize",
    ()=>{

    refreshSleepGraph();
});
