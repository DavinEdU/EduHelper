document.addEventListener("DOMContentLoaded", function () {

    /* =======================
       DARK MODE TOGGLE
    ======================= */
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark");
    }
    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("darkMode", document.body.classList.contains("dark") ? "enabled" : "disabled");
    });

    /* =======================
       AUTO-GENERATED STUDY TIPS
    ======================= */
    const tips = [
        "Break study sessions into 25-minute blocks with 5-minute breaks (Pomodoro Technique).",
        "Rewrite notes in your own words to improve retention.",
        "Teach what you learn to someone else — it's the best way to understand it.",
        "Study in short, focused bursts instead of long cramming sessions.",
        "Use color-coded notes to organize concepts visually.",
        "Sleep is part of studying — rest well to retain better!",
        "Review yesterday’s material before jumping into something new.",
        "Summarize a chapter in 5 key bullet points to check understanding.",
        "Switch subjects every hour to keep your brain active.",
        "Practice past exam papers to prepare effectively."
    ];
    function getDailyTip() {
        const today = new Date().toDateString();
        let savedTipData = JSON.parse(localStorage.getItem("dailyTip"));
        if (savedTipData && savedTipData.date === today) {
            return savedTipData.tip;
        }
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        localStorage.setItem("dailyTip", JSON.stringify({ date: today, tip: randomTip }));
        return randomTip;
    }
    document.getElementById("studyTip").innerText = getDailyTip();

    /* =======================
       MOTIVATIONAL QUOTE
    ======================= */
    const quotes = [
        "The secret to getting ahead is getting started.",
        "Push yourself, because no one else is going to do it for you.",
        "Success doesn’t just find you; you have to go out and get it.",
        "Small progress each day adds up to big results.",
        "Dream bigger. Do bigger."
    ];
    document.getElementById("motivationalQuote").innerText =
        quotes[Math.floor(Math.random() * quotes.length)];

    /* =======================
       NOTES ORGANIZER
    ======================= */
    let notesData = JSON.parse(localStorage.getItem("notesData")) || [];
    function saveNotesToStorage() {
        localStorage.setItem("notesData", JSON.stringify(notesData));
    }
    window.saveNote = function () {
        const title = document.getElementById("noteTitle").value.trim();
        const content = document.getElementById("noteContent").value.trim();
        if (!title || !content) return;
        notesData.push({ title, content });
        saveNotesToStorage();
        renderNotes();
        document.getElementById("noteTitle").value = "";
        document.getElementById("noteContent").value = "";
    };
    window.deleteNote = function (index) {
        notesData.splice(index, 1);
        saveNotesToStorage();
        renderNotes();
    };
    function renderNotes(filter = "") {
        const container = document.getElementById("notesContainer");
        container.innerHTML = "";
        notesData
            .filter(note => note.title.toLowerCase().includes(filter) || note.content.toLowerCase().includes(filter))
            .forEach((note, index) => {
                const noteDiv = document.createElement("div");
                noteDiv.className = "note-card";
                noteDiv.innerHTML = `
                    <h3>${note.title} <button onclick="deleteNote(${index})">🗑</button></h3>
                    <p>${note.content.replace(/\n/g, "<br>")}</p>
                `;
                container.appendChild(noteDiv);
            });
    }
    window.searchNotes = function () {
        const query = document.getElementById("noteSearch").value.trim().toLowerCase();
        renderNotes(query);
    };
    renderNotes();

    /* =======================
       TO-DO LISTS
    ======================= */
    let todoData = JSON.parse(localStorage.getItem("todoData")) || {};
    function saveTodoData() {
        localStorage.setItem("todoData", JSON.stringify(todoData));
    }
    window.createNewList = function () {
        const listName = document.getElementById("newListName").value.trim();
        if (!listName || todoData[listName]) return;
        todoData[listName] = [];
        saveTodoData();
        document.getElementById("newListName").value = "";
        renderLists();
    };
    window.addNoteToList = function (listName, noteInputId) {
        const note = document.getElementById(noteInputId).value.trim();
        if (!note) return;
        todoData[listName].push({ text: note, done: false });
        saveTodoData();
        renderLists();
    };
    window.toggleNoteStatus = function (listName, noteIndex) {
        todoData[listName][noteIndex].done = !todoData[listName][noteIndex].done;
        saveTodoData();
        renderLists();
    };
    window.deleteTodoNote = function (listName, index) {
        todoData[listName].splice(index, 1);
        saveTodoData();
        renderLists();
    };
    window.deleteList = function (listName) {
        delete todoData[listName];
        saveTodoData();
        renderLists();
    };
    function renderLists(filter = "") {
        const container = document.getElementById("listsContainer");
        container.innerHTML = "";
        for (let list in todoData) {
            if (!list.toLowerCase().includes(filter)) continue;
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
    window.searchTodos = function () {
        const query = document.getElementById("todoSearch").value.trim().toLowerCase();
        renderLists(query);
    };
    renderLists();

    /* =======================
       FLASHCARDS
    ======================= */
    let flashcards = JSON.parse(localStorage.getItem("flashcards")) || [];
    function saveFlashcards() {
        localStorage.setItem("flashcards", JSON.stringify(flashcards));
    }
    window.addFlashcard = function () {
        const q = document.getElementById("flashcardQuestion").value.trim();
        const a = document.getElementById("flashcardAnswer").value.trim();
        if (!q || !a) return;
        flashcards.push({ q, a });
        saveFlashcards();
        renderFlashcards();
        document.getElementById("flashcardQuestion").value = "";
        document.getElementById("flashcardAnswer").value = "";
    };
    window.deleteFlashcard = function (index) {
        flashcards.splice(index, 1);
        saveFlashcards();
        renderFlashcards();
    };
    function renderFlashcards() {
        const container = document.getElementById("flashcardsContainer");
        container.innerHTML = "";
        flashcards.forEach((fc, i) => {
            const card = document.createElement("div");
            card.className = "flashcard";
            card.innerHTML = `<strong>Q:</strong> ${fc.q}<br><strong>A:</strong> ${fc.a} <br><button onclick="deleteFlashcard(${i})">🗑</button>`;
            container.appendChild(card);
        });
    }
    renderFlashcards();

    /* =======================
       DAILY PLANNER
    ======================= */
    let plannerData = JSON.parse(localStorage.getItem("plannerData")) || {};
    function savePlannerData() {
        localStorage.setItem("plannerData", JSON.stringify(plannerData));
    }
    window.savePlanner = function () {
        const date = document.getElementById("plannerDate").value;
        const tasks = document.getElementById("plannerTasks").value.trim();
        if (!date || !tasks) return;
        plannerData[date] = tasks;
        savePlannerData();
        renderPlanner();
    };
    window.deletePlanner = function (date) {
        delete plannerData[date];
        savePlannerData();
        renderPlanner();
    };
    function renderPlanner() {
        const container = document.getElementById("plannerContainer");
        container.innerHTML = "";
        Object.keys(plannerData).forEach(date => {
            const entry = document.createElement("div");
            entry.className = "planner-entry";
            entry.innerHTML = `<strong>${date}</strong>:<br>${plannerData[date].replace(/\n/g, "<br>")} <br><button onclick="deletePlanner('${date}')">🗑</button>`;
            container.appendChild(entry);
        });
    }
    renderPlanner();

    /* =======================
       HABIT TRACKER
    ======================= */
    let habits = JSON.parse(localStorage.getItem("habits")) || [];
    function saveHabits() {
        localStorage.setItem("habits", JSON.stringify(habits));
    }
    window.addHabit = function () {
        const name = document.getElementById("habitName").value.trim();
        if (!name) return;
        habits.push({ name, done: false });
        saveHabits();
        renderHabits();
    };
    window.deleteHabit = function (index) {
        habits.splice(index, 1);
        saveHabits();
        renderHabits();
    };
    function toggleHabit(index) {
        habits[index].done = !habits[index].done;
        saveHabits();
        renderHabits();
    }
    function renderHabits() {
        const container = document.getElementById("habitContainer");
        container.innerHTML = "";
        habits.forEach((h, i) => {
            const div = document.createElement("div");
            div.className = "habit" + (h.done ? " done" : "");
            div.innerHTML = `${h.name} <button onclick="deleteHabit(${i})">🗑</button>`;
            div.onclick = () => toggleHabit(i);
            container.appendChild(div);
        });
    }
    renderHabits();

    /* =======================
       SECTION SWITCHER
    ======================= */
    window.showSection = function (sectionId) {
        document.querySelectorAll(".content-section").forEach(section => {
            section.style.display = "none";
        });
        document.getElementById(sectionId).style.display = "block";
        localStorage.setItem("lastSection", sectionId);
    };
    if (localStorage.getItem("lastSection")) {
        showSection(localStorage.getItem("lastSection"));
    } else {
        showSection("homeSection");
    }

    /* =======================
       MATH QUIZ
    ======================= */
    let num1, num2, correctAnswer;
    function generateMathQuestion() {
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        correctAnswer = num1 + num2;
        document.getElementById("mathQuestion").innerText = `${num1} + ${num2} = ?`;
    }
    window.checkMathAnswer = function () {
        let userAnswer = parseInt(document.getElementById("mathAnswer").value);
        document.getElementById("mathFeedback").innerText = userAnswer === correctAnswer ? "Correct! 🎉" : "Try Again! ❌";
        generateMathQuestion();
    };
    generateMathQuestion();

    /* =======================
       KEYBOARD SHORTCUTS TRAINER
    ======================= */
    const shortcuts = {
        "Copy": "Ctrl+C", "Paste": "Ctrl+V", "Undo": "Ctrl+Z", "Redo": "Ctrl+Y",
        "Save": "Ctrl+S", "Select All": "Ctrl+A", "Find": "Ctrl+F", "Print": "Ctrl+P",
        "Run": "Win+R", "Shutdown": "Alt+F4"
    };
    let currentTask;
    function generateShortcutQuestion() {
        let keys = Object.keys(shortcuts);
        currentTask = keys[Math.floor(Math.random() * keys.length)];
        document.getElementById("shortcutTask").innerText = currentTask;
    }
    window.checkShortcut = function () {
        let userInput = document.getElementById("shortcutInput").value.trim().replace(/\s+/g, "").toLowerCase();
        let correctAnswer = shortcuts[currentTask].replace(/\s+/g, "").toLowerCase();
        document.getElementById("shortcutFeedback").innerText = userInput === correctAnswer ? "Correct! ✅" : "Incorrect! ❌ Try Again!";
        generateShortcutQuestion();
    };
    generateShortcutQuestion();

    /* =======================
       UNIT CONVERTER
    ======================= */
    window.convertUnit = function () {
        let value = parseFloat(document.getElementById("unitInput").value);
        let unitType = document.getElementById("unitType").value;
        let result = "";
        if (unitType === "length") result = `${value} meters = ${value * 3.281} feet`;
        else if (unitType === "weight") result = `${value} kg = ${value * 2.205} lbs`;
        else if (unitType === "temperature") result = `${value}°C = ${(value * 9/5) + 32}°F`;
        else if (unitType === "time") result = `${value} hours = ${value * 60} minutes`;
        document.getElementById("conversionResult").innerText = result;
    };

    /* =======================
       BMI CALCULATOR
    ======================= */
    window.calculateBMI = function () {
        let height = parseFloat(document.getElementById("bmiHeight").value) / 100;
        let weight = parseFloat(document.getElementById("bmiWeight").value);
        let bmi = weight / (height * height);
        let category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
        document.getElementById("bmiResult").innerText = `BMI: ${bmi.toFixed(2)} (${category})`;
    };

    /* =======================
       STOPWATCH & TIMER
    ======================= */
    let stopwatchInterval, stopwatchTime = 0, running = false;
    window.startStopwatch = function () {
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
    };
    window.pauseStopwatch = function () {
        clearInterval(stopwatchInterval);
        running = false;
    };
    window.resetStopwatch = function () {
        clearInterval(stopwatchInterval);
        running = false;
        stopwatchTime = 0;
        document.getElementById("stopwatchDisplay").innerText = "00:00:00";
    };
    let timerInterval, timerTime = 0;
    window.startTimer = function () {
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
    };
    window.resetTimer = function () {
        clearInterval(timerInterval);
        document.getElementById("timerInput").value = "";
        document.getElementById("timerDisplay").innerText = "00:00";
    };
    function updateTimerDisplay() {
        let minutes = Math.floor(timerTime / 60);
        let seconds = timerTime % 60;
        document.getElementById("timerDisplay").innerText =
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /* =======================
       CALCULATOR
    ======================= */
    let calcExpression = "";
    window.appendToCalc = function (value) {
        calcExpression += value;
        document.getElementById("calcDisplay").value = calcExpression;
    };
    window.clearCalc = function () {
        calcExpression = "";
        document.getElementById("calcDisplay").value = "";
    };
    window.calculateResult = function () {
        try {
            let result = eval(calcExpression);
            document.getElementById("calcDisplay").value = parseFloat(result.toFixed(2));
            calcExpression = result.toString();
        } catch {
            document.getElementById("calcDisplay").value = "Error!";
        }
    };

    /* =======================
       CURRENCY CONVERTER WITH SHORT+LONG NAMES
    ======================= */
    (function () {
        const API = 'https://open.er-api.com/v6/latest/';
        const TTL_MS = 12 * 60 * 60 * 1000;
        const currencyNames = {
            USD: "United States Dollar", EUR: "Euro", GBP: "British Pound Sterling", INR: "Indian Rupee",
            JPY: "Japanese Yen", AUD: "Australian Dollar", CAD: "Canadian Dollar", CHF: "Swiss Franc",
            CNY: "Chinese Yuan", AED: "United Arab Emirates Dirham", SAR: "Saudi Riyal",
            SGD: "Singapore Dollar", ZAR: "South African Rand"
        };
        const FALLBACK_CODES = Object.keys(currencyNames);
        function lsKey(base){ return `fx_${base}_v1`; }
        async function fetchRates(base) {
            const res = await fetch(`${API}${encodeURIComponent(base)}`);
            if (!res.ok) throw new Error(`Rate fetch failed: ${res.status}`);
            const data = await res.json();
            if (data.result !== 'success' || !data.rates) throw new Error('Bad API response');
            return { base, rates: data.rates, timestamp: (data.time_last_update_unix ? data.time_last_update_unix*1000 : Date.now()) };
        }
        async function getRates(base) {
            const key = lsKey(base);
            const cachedRaw = localStorage.getItem(key);
            if (cachedRaw) {
                try {
                    const cached = JSON.parse(cachedRaw);
                    if (Date.now() - cached.timestamp < TTL_MS) return cached;
                } catch {}
            }
            const fresh = await fetchRates(base);
            localStorage.setItem(key, JSON.stringify(fresh));
            return fresh;
        }
        function populateSelect(select, codes) {
            select.innerHTML = '';
            codes.forEach(c => {
                const fullName = currencyNames[c] || c;
                select.add(new Option(`${c} – ${fullName}`, c));
            });
        }
        async function populateCurrencies() {
            const fromSel = document.getElementById('currencyFrom');
            const toSel   = document.getElementById('currencyTo');
            if (!fromSel || !toSel) return;
            try {
                const { rates, base } = await getRates('USD');
                const codes = Array.from(new Set([base, ...Object.keys(rates)])).sort();
                populateSelect(fromSel, codes);
                populateSelect(toSel, codes);
                fromSel.value = 'USD';
                toSel.value = 'INR';
            } catch {
                populateSelect(fromSel, FALLBACK_CODES);
                populateSelect(toSel, FALLBACK_CODES);
            }
        }
        populateCurrencies();
        document.getElementById('convertCurrency').addEventListener('click', async function(){
            const from = document.getElementById('currencyFrom').value;
            const to   = document.getElementById('currencyTo').value;
            const amt  = parseFloat(document.getElementById('currencyAmount').value);
            if (!amt) return;
            try {
                const { rates } = await getRates(from);
                const converted = (amt * rates[to]).toFixed(2);
                document.getElementById('currencyResult').innerText = `${amt} ${from} = ${converted} ${to}`;
            } catch {
                document.getElementById('currencyResult').innerText = "Error fetching rates.";
            }
        });
    })();

});
