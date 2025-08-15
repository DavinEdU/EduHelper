document.addEventListener("DOMContentLoaded", function () {

    // Notes Organizer Feature
    let notesData = JSON.parse(localStorage.getItem("notesData")) || [];

    function saveNotesToStorage() {
        localStorage.setItem("notesData", JSON.stringify(notesData));
    }

    function saveNote() {
        const title = document.getElementById("noteTitle").value.trim();
        const content = document.getElementById("noteContent").value.trim();
        if (!title || !content) return;

        notesData.push({ title, content });
        saveNotesToStorage();
        renderNotes();
        document.getElementById("noteTitle").value = "";
        document.getElementById("noteContent").value = "";
    }

    function deleteNote(index) {
        notesData.splice(index, 1);
        saveNotesToStorage();
        renderNotes();
    }

    function renderNotes() {
        const container = document.getElementById("notesContainer");
        container.innerHTML = "";

        notesData.forEach((note, index) => {
            const noteDiv = document.createElement("div");
            noteDiv.className = "note-card";
            noteDiv.innerHTML = `
                <h3>${note.title} <button onclick="deleteNote(${index})">🗑</button></h3>
                <p>${note.content.replace(/\n/g, "<br>")}</p>
            `;
            container.appendChild(noteDiv);
        });
    }

    window.saveNote = saveNote;
    window.deleteNote = deleteNote;
    renderNotes();

    // To-Do List & Notes
    let todoData = JSON.parse(localStorage.getItem("todoData")) || {};

    function saveTodoData() {
        localStorage.setItem("todoData", JSON.stringify(todoData));
    }

    function createNewList() {
        const listName = document.getElementById("newListName").value.trim();
        if (!listName || todoData[listName]) return;
        todoData[listName] = [];
        saveTodoData();
        document.getElementById("newListName").value = "";
        renderLists();
    }

    function addNoteToList(listName, noteInputId) {
        const note = document.getElementById(noteInputId).value.trim();
        if (!note) return;
        todoData[listName].push({ text: note, done: false });
        saveTodoData();
        renderLists();
    }

    function toggleNoteStatus(listName, noteIndex) {
        todoData[listName][noteIndex].done = !todoData[listName][noteIndex].done;
        saveTodoData();
        renderLists();
    }

    function deleteTodoNote(listName, index) {
        todoData[listName].splice(index, 1);
        saveTodoData();
        renderLists();
    }

    function deleteList(listName) {
        delete todoData[listName];
        saveTodoData();
        renderLists();
    }

    function renderLists() {
        const container = document.getElementById("listsContainer");
        container.innerHTML = "";
        for (let list in todoData) {
            const div = document.createElement("div");
            div.className = "todo-list";

            div.innerHTML = `
                <h3>${list} <button onclick="deleteList('${list}')">🗑</button></h3>
                <ul>${todoData[list].map((note, i) => `
                    <li>
                        <input type="checkbox" ${note.done ? "checked" : ""} onchange="toggleNoteStatus('${list}', ${i})">
                        <span style="text-decoration:${note.done ? "line-through" : "none"}">${note.text}</span>
                        <button onclick="deleteTodoNote('${list}', ${i})">❌</button>
                    </li>
                `).join("")}</ul>
                <input type="text" id="note-${list}" placeholder="Add note...">
                <button onclick="addNoteToList('${list}', 'note-${list}')">Add</button>
            `;
            container.appendChild(div);
        }
    }

    window.createNewList = createNewList;
    window.addNoteToList = addNoteToList;
    window.toggleNoteStatus = toggleNoteStatus;
    window.deleteTodoNote = deleteTodoNote;
    window.deleteList = deleteList;
    renderLists();

    // Currency Converter with Live Rates
    async function convertCurrency() {
        const amount = parseFloat(document.getElementById("currencyInput").value);
        const fromCurrency = document.getElementById("currencyFrom").value;
        const toCurrency = document.getElementById("currencyTo").value;

        if (isNaN(amount) || amount <= 0) {
            document.getElementById("currencyResult").innerText = "Enter a valid amount!";
            return;
        }

        try {
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
            const data = await res.json();

            if (!data.rates[toCurrency]) {
                document.getElementById("currencyResult").innerText = "Currency not supported!";
                return;
            }

            const convertedAmount = amount * data.rates[toCurrency];
            document.getElementById("currencyResult").innerText =
                `${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`;
        } catch (error) {
            document.getElementById("currencyResult").innerText = "Error fetching live rates!";
        }
    }

    async function populateCurrencies() {
        try {
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
            const data = await res.json();
            const currencyCodes = Object.keys(data.rates);

            const fromSelect = document.getElementById("currencyFrom");
            const toSelect = document.getElementById("currencyTo");

            fromSelect.innerHTML = "";
            toSelect.innerHTML = "";

            currencyCodes.forEach(code => {
                let option1 = new Option(code, code);
                let option2 = new Option(code, code);
                fromSelect.add(option1);
                toSelect.add(option2);
            });

            fromSelect.value = "USD";
            toSelect.value = "INR";
        } catch {
            console.error("Failed to load currency list.");
        }
    }

    populateCurrencies();
    window.convertCurrency = convertCurrency;

    // Section Switcher
    function showSection(sectionId) {
        document.querySelectorAll(".content-section").forEach(section => {
            section.style.display = "none";
        });
        document.getElementById(sectionId).style.display = "block";
    }
    window.showSection = showSection;
    showSection("homeSection");

    // Math Quiz
    let num1, num2, correctAnswer;
    function generateMathQuestion() {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = num1 + num2;
        document.getElementById("mathQuestion").innerText = `${num1} + ${num2} = ?`;
    }
    function checkMathAnswer() {
        let userAnswer = parseInt(document.getElementById("mathAnswer").value);
        document.getElementById("mathFeedback").innerText = userAnswer === correctAnswer ? "Correct! 🎉" : "Try Again! ❌";
        generateMathQuestion();
    }
    window.checkMathAnswer = checkMathAnswer;
    generateMathQuestion();

    // Keyboard Shortcuts Trainer
    const shortcuts = {
        "Copy": "Ctrl+C", "Paste": "Ctrl+V", "Undo": "Ctrl+Z", "Redo": "Ctrl+Y",
        "Save": "Ctrl+S", "Select All": "Ctrl+A", "Find": "Ctrl+F", "Print": "Ctrl+P",
        "Run": "Win+R", "Shutdown": "Alt+f4"
    };
    let currentTask;
    function generateShortcutQuestion() {
        let keys = Object.keys(shortcuts);
        currentTask = keys[Math.floor(Math.random() * keys.length)];
        document.getElementById("shortcutTask").innerText = currentTask;
    }
    function checkShortcut() {
        let userInput = document.getElementById("shortcutInput").value.trim().replace(/\s+/g, "").toLowerCase();
        let correctAnswer = shortcuts[currentTask].replace(/\s+/g, "").toLowerCase();
        document.getElementById("shortcutFeedback").innerText = userInput === correctAnswer ? "Correct! ✅" : "Incorrect! ❌ Try Again!";
        generateShortcutQuestion();
    }
    window.checkShortcut = checkShortcut;
    generateShortcutQuestion();

    // Unit Converter
    function convertUnit() {
        let value = parseFloat(document.getElementById("unitInput").value);
        let unitType = document.getElementById("unitType").value;
        let result = "";
        if (unitType === "length") result = `${value} meters = ${value * 3.281} feet`;
        else if (unitType === "weight") result = `${value} kg = ${value * 2.205} lbs`;
        else if (unitType === "temperature") result = `${value}°C = ${(value * 9 / 5) + 32}°F`;
        else if (unitType === "time") result = `${value} hours = ${value * 60} minutes`;
        document.getElementById("conversionResult").innerText = result;
    }
    window.convertUnit = convertUnit;

    // BMI Calculator
    function calculateBMI() {
        let height = parseFloat(document.getElementById("bmiHeight").value) / 100;
        let weight = parseFloat(document.getElementById("bmiWeight").value);
        let bmi = weight / (height * height);
        let category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
        document.getElementById("bmiResult").innerText = `BMI: ${bmi.toFixed(2)} (${category})`;
    }
    window.calculateBMI = calculateBMI;

    // Stopwatch Functions
    let stopwatchInterval;
    let stopwatchTime = 0;
    let running = false;

    function startStopwatch() {
        if (!running) {
            running = true;
            stopwatchInterval = setInterval(() => {
                stopwatchTime++;
                let hours = Math.floor(stopwatchTime / 3600);
                let minutes = Math.floor((stopwatchTime % 3600) / 60);
                let seconds = stopwatchTime % 60;
                document.getElementById("stopwatchDisplay").innerText =
                    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }, 1000);
        }
    }

    function pauseStopwatch() {
        clearInterval(stopwatchInterval);
        running = false;
    }

    function resetStopwatch() {
        clearInterval(stopwatchInterval);
        running = false;
        stopwatchTime = 0;
        document.getElementById("stopwatchDisplay").innerText = "00:00:00";
    }

    // Timer Functions
    let timerInterval;
    let timerTime = 0;

    function startTimer() {
        let inputSeconds = parseInt(document.getElementById("timerInput").value);
        if (isNaN(inputSeconds) || inputSeconds <= 0) {
            alert("Enter a valid number of seconds!");
            return;
        }

        timerTime = inputSeconds;
        updateTimerDisplay();
        timerInterval = setInterval(() => {
            if (timerTime > 0) {
                timerTime--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                alert("Time's up!");
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerInterval);
        document.getElementById("timerInput").value = "";
        document.getElementById("timerDisplay").innerText = "00:00";
    }

    function updateTimerDisplay() {
        let minutes = Math.floor(timerTime / 60);
        let seconds = timerTime % 60;
        document.getElementById("timerDisplay").innerText =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    window.startStopwatch = startStopwatch;
    window.pauseStopwatch = pauseStopwatch;
    window.resetStopwatch = resetStopwatch;
    window.startTimer = startTimer;
    window.resetTimer = resetTimer;

    // Calculator
    let calcExpression = "";
    function appendToCalc(value) {
        calcExpression += value;
        document.getElementById("calcDisplay").value = calcExpression;
    }
    function clearCalc() {
        calcExpression = "";
        document.getElementById("calcDisplay").value = "";
    }
    function calculateResult() {
        try {
            let result = eval(calcExpression);
            document.getElementById("calcDisplay").value = parseFloat(result.toFixed(2));
            calcExpression = result.toString();
        } catch {
            document.getElementById("calcDisplay").value = "Error!";
        }
    }
    window.appendToCalc = appendToCalc;
    window.clearCalc = clearCalc;
    window.calculateResult = calculateResult;
});

// Live Clock
function updateClock() {
    const now = new Date();
    document.getElementById("liveClock").innerText = "📅 " + now.toLocaleString();
}
setInterval(updateClock, 1000);
updateClock();

// Study Tip of the Day
const tips = [
    "Break study sessions into 25-minute blocks with 5-minute breaks (Pomodoro).",
    "Rewrite notes in your own words to improve retention.",
    "Teach what you learn to someone else — it's the best way to understand it.",
    "Study in short, focused bursts instead of long cramming sessions.",
    "Use color-coded notes to organize concepts visually.",
    "Sleep is part of studying — rest well to retain better!",
    "Review yesterday’s material before jumping into something new."
];
document.getElementById("studyTip").innerText =
    tips[Math.floor(Math.random() * tips.length)];