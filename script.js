
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(() => console.log('SW registered'));
  });
}

document.addEventListener("DOMContentLoaded", function () {

  /* =======================
     SIDE MENU TOGGLE
  ======================= */
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");

  if (menuToggle && sideMenu) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent closing immediately
      sideMenu.classList.toggle("open");
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (
        sideMenu.classList.contains("open") &&
        !sideMenu.contains(e.target) &&
        e.target !== menuToggle
      ) {
        sideMenu.classList.remove("open");
      }
    });
  }

  /* =======================
     SAVE ALL (Pending Commit System)
  ======================= */
  const saveAllBtn = document.getElementById("saveAllBtn");
  const dirtyBadge = document.getElementById("dirtyBadge");
  const saveToast = document.getElementById("saveToast");

  function markDirty() { if (dirtyBadge) dirtyBadge.classList.remove("hidden"); }
  function clearDirty() { if (dirtyBadge) dirtyBadge.classList.add("hidden"); }
  function showToast() {
    if (saveToast) {
      saveToast.classList.remove("hidden");
      setTimeout(() => saveToast.classList.add("hidden"), 1500);
    }
  }

  const __realSetItem = Storage.prototype.setItem;
  const __realGetItem = Storage.prototype.getItem;
  const __realRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function (key, value) {
    if (typeof key === 'string' && key.endsWith("_pending_commit")) {
      const realKey = key.replace("_pending_commit", "");
      __realSetItem.call(this, realKey, value);
      return;
    }
    __realSetItem.call(this, key + "_pending", value);
    markDirty();
  };

  window.saveAll = function () {
    try {
      const pendingKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.endsWith("_pending")) pendingKeys.push(k);
      }
      pendingKeys.forEach(pk => {
        const realKey = pk.replace("_pending", "");
        const val = __realGetItem.call(localStorage, pk);
        __realSetItem.call(localStorage, realKey, val);
        __realRemoveItem.call(localStorage, pk);
      });
      clearDirty();
      showToast();
    } catch (e) {
      console.error("SaveAll error:", e);
      alert("Could not save data. See console for details.");
    }
  };

  if (saveAllBtn) saveAllBtn.addEventListener("click", saveAll);

  /* =======================
     DELETE ALL
  ======================= */
  const deleteAllBtn = document.getElementById("deleteAllBtn");
  window.deleteAllData = function () {
    if (confirm("⚠️ Are you sure? This will permanently delete ALL your saved data!")) {
      localStorage.clear();
      notesData = [];
      todoData = {};
      flashcards = [];
      plannerData = {};
      habits = [];
      renderNotes();
      renderLists();
      renderFlashcards();
      renderPlanner();
      renderHabits();
      clearDirty();
      alert("All data deleted successfully.");
      showSection("homeSection");
    }
  };
  if (deleteAllBtn) deleteAllBtn.addEventListener("click", deleteAllData);

  /* =======================
     DARK MODE TOGGLE
  ======================= */
  const darkModeToggle = document.getElementById("darkModeToggle");
  document.body.classList.remove("dark");
  if (darkModeToggle) darkModeToggle.innerText = "Dark Mode 🌙";
  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });
  }

  /* =======================
     STUDY TIP OF THE DAY
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
    try {
      const savedTipData = JSON.parse(window.__realGetItem?.call(localStorage, "dailyTip") || localStorage.getItem("dailyTip"));
      if (savedTipData && savedTipData.date === today) {
        return savedTipData.tip;
      }
    } catch {}
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    localStorage.setItem("dailyTip", JSON.stringify({ date: today, tip: randomTip }));
    return randomTip;
  }
  if (document.getElementById("studyTip"))
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
  if (document.getElementById("motivationalQuote"))
    document.getElementById("motivationalQuote").innerText =
      quotes[Math.floor(Math.random() * quotes.length)];

  /* =======================
     NOTES ORGANIZER
  ======================= */
  let notesData = [];
  try {
    const raw = __realGetItem.call(localStorage, "notesData") || localStorage.getItem("notesData");
    notesData = raw ? JSON.parse(raw) : [];
  } catch { notesData = []; }

  function saveNotesToStorage() {
    localStorage.setItem("notesData", JSON.stringify(notesData));
  }
  window.saveNote = function () {
    const titleEl = document.getElementById("noteTitle");
    const contentEl = document.getElementById("noteContent");
    if (!titleEl || !contentEl) return;
    const title = titleEl.value.trim();
    const content = contentEl.value.trim();
    if (!title || !content) return;
    notesData.push({ title, content });
    saveNotesToStorage();
    renderNotes();
    titleEl.value = "";
    contentEl.value = "";
  };
  window.deleteNote = function (index) {
    notesData.splice(index, 1);
    saveNotesToStorage();
    renderNotes();
  };
  function renderNotes(filter = "") {
    const container = document.getElementById("notesContainer");
    if (!container) return;
    container.innerHTML = "";
    notesData
      .filter(note => note.title.toLowerCase().includes(filter) || note.content.toLowerCase().includes(filter))
      .forEach((note, index) => {
        const noteDiv = document.createElement("div");
        noteDiv.className = "note-card";
        noteDiv.innerHTML = `
          <h3>${escapeHtml(note.title)} <button class="note-delete" data-index="${index}">🗑</button></h3>
          <p>${escapeHtml(note.content).replace(/\n/g, "<br>")}</p>
        `;
        container.appendChild(noteDiv);
      });
    container.querySelectorAll(".note-delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = parseInt(e.currentTarget.getAttribute("data-index"));
        if (!isNaN(i)) {
          window.deleteNote(i);
        }
      });
    });
  }
  window.searchNotes = function () {
    const q = (document.getElementById("noteSearch")?.value || "").trim().toLowerCase();
    renderNotes(q);
  };
  renderNotes();

  /* =======================
     TO-DO LISTS
  ======================= */
  let todoData = {};
  try {
    const raw = __realGetItem.call(localStorage, "todoData") || localStorage.getItem("todoData");
    todoData = raw ? JSON.parse(raw) : {};
  } catch { todoData = {}; }

  function saveTodoData() { localStorage.setItem("todoData", JSON.stringify(todoData)); }
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
    if (!container) return;
    container.innerHTML = "";
    for (let list in todoData) {
      if (!list.toLowerCase().includes(filter)) continue;
      const div = document.createElement("div");
      div.className = "todo-list";
      div.innerHTML = `
        <h3>${escapeHtml(list)} <button class="list-del" data-list="${escapeAttr(list)}">🗑</button></h3>
        <ul>${todoData[list].map((note, i) => `
          <li>
            <input type="checkbox" data-list="${escapeAttr(list)}" data-index="${i}" ${note.done ? "checked" : ""}>
            <span style="text-decoration:${note.done ? "line-through" : "none"}">${escapeHtml(note.text)}</span>
            <button class="todo-del" data-list="${escapeAttr(list)}" data-index="${i}">❌</button>
          </li>
        `).join("")}</ul>
        <input type="text" id="note-${escapeAttr(list)}" placeholder="Add note...">
        <button class="note-add" data-list="${escapeAttr(list)}">Add</button>
      `;
      container.appendChild(div);
    }
    container.querySelectorAll(".note-add").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const list = e.currentTarget.getAttribute("data-list");
        addNoteToList(list, `note-${list}`);
      });
    });
    container.querySelectorAll(".todo-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const list = e.currentTarget.getAttribute("data-list");
        const idx = parseInt(e.currentTarget.getAttribute("data-index"));
        deleteTodoNote(list, idx);
      });
    });
    container.querySelectorAll(".list-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const list = e.currentTarget.getAttribute("data-list");
        deleteList(list);
      });
    });
    container.querySelectorAll("input[type=checkbox][data-list]").forEach(cb => {
      cb.addEventListener("change", (e) => {
        const list = e.currentTarget.getAttribute("data-list");
        const idx = parseInt(e.currentTarget.getAttribute("data-index"));
        toggleNoteStatus(list, idx);
      });
    });
  }
  window.searchTodos = function () {
    const q = (document.getElementById("todoSearch")?.value || "").trim().toLowerCase();
    renderLists(q);
  };
  renderLists();

  /* =======================
     FLASHCARDS
  ======================= */
  let flashcards = [];
  try {
    const raw = __realGetItem.call(localStorage, "flashcards") || localStorage.getItem("flashcards");
    flashcards = raw ? JSON.parse(raw) : [];
  } catch { flashcards = []; }

  function saveFlashcards() { localStorage.setItem("flashcards", JSON.stringify(flashcards)); }
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
    if (!container) return;
    container.innerHTML = "";
    flashcards.forEach((fc, i) => {
      const card = document.createElement("div");
      card.className = "flashcard";
      card.innerHTML = `<strong>Q:</strong> ${escapeHtml(fc.q)}<br><strong>A:</strong> ${escapeHtml(fc.a)} <br><button class="fc-del" data-i="${i}">🗑</button>`;
      container.appendChild(card);
    });
    container.querySelectorAll(".fc-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-i"));
        deleteFlashcard(idx);
      });
    });
  }
  renderFlashcards();

  /* =======================
     DAILY PLANNER
  ======================= */
  let plannerData = {};
  try {
    const raw = __realGetItem.call(localStorage, "plannerData") || localStorage.getItem("plannerData");
    plannerData = raw ? JSON.parse(raw) : {};
  } catch { plannerData = {}; }
  function savePlannerData() { localStorage.setItem("plannerData", JSON.stringify(plannerData)); }
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
    if (!container) return;
    container.innerHTML = "";
    Object.keys(plannerData).forEach(date => {
      const entry = document.createElement("div");
      entry.className = "planner-entry";
      entry.innerHTML = `<strong>${escapeHtml(date)}</strong>:<br>${escapeHtml(plannerData[date]).replace(/\n/g, "<br>")} <br><button class="planner-del" data-date="${escapeAttr(date)}">🗑</button>`;
      container.appendChild(entry);
    });
    container.querySelectorAll(".planner-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        deletePlanner(e.currentTarget.getAttribute("data-date"));
      });
    });
  }
  renderPlanner();

  /* =======================
     HABIT TRACKER
  ======================= */
  let habits = [];
  try {
    const raw = __realGetItem.call(localStorage, "habits") || localStorage.getItem("habits");
    habits = raw ? JSON.parse(raw) : [];
  } catch { habits = []; }
  function saveHabits() { localStorage.setItem("habits", JSON.stringify(habits)); }
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
    if (!container) return;
    container.innerHTML = "";
    habits.forEach((h, i) => {
      const div = document.createElement("div");
      div.className = "habit" + (h.done ? " done" : "");
      div.innerHTML = `${escapeHtml(h.name)} <button class="habit-del" data-i="${i}">🗑</button>`;
      div.onclick = () => toggleHabit(i);
      container.appendChild(div);
    });
    container.querySelectorAll(".habit-del").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-i"));
        deleteHabit(idx);
      });
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
    const el = document.getElementById(sectionId);
    if (el) el.style.display = "block";
    if (sideMenu) sideMenu.classList.remove("open");
  };

 /* =======================
   CLOCK
======================= */
function updateClock() {
  const el = document.getElementById("liveClock");
  if (el) {
    el.textContent = new Date().toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }
}

// Call once immediately, then keep updating
setInterval(updateClock, 1000);
updateClock();


  /* =======================
     MATH QUIZ
  ======================= */
  function generateMathQuestion() {
    const num1 = Math.floor(Math.random() * 20);
    const num2 = Math.floor(Math.random() * 20);
    const ops = ["+", "-", "*"];
    const op = ops[Math.floor(Math.random() * ops.length)];
    return { question: `${num1} ${op} ${num2}`, answer: eval(`${num1} ${op} ${num2}`) };
  }
  let currentMath = generateMathQuestion();
  const mathQEl = document.getElementById("mathQuestion");
  if (mathQEl) mathQEl.innerText = currentMath.question;
  window.checkMathAnswer = function () {
    const ans = parseInt(document.getElementById("mathAnswer").value);
    const fb = document.getElementById("mathFeedback");
    if (ans === currentMath.answer) {
      fb.innerText = "✅ Correct!";
    } else {
      fb.innerText = "❌ Wrong. Answer is " + currentMath.answer;
    }
    currentMath = generateMathQuestion();
    if (mathQEl) mathQEl.innerText = currentMath.question;
    document.getElementById("mathAnswer").value = "";
  };

  /* =======================
     KEYBOARD TRAINER
  ======================= */
  const shortcuts = {
    "Copy": "Ctrl+C",
    "Paste": "Ctrl+V",
    "Undo": "Ctrl+Z",
    "Select All": "Ctrl+A",
    "Find": "Ctrl+F",
  };
  let currentTask = "Copy";
  const scTaskEl = document.getElementById("shortcutTask");
  if (scTaskEl) {
    const tasks = Object.keys(shortcuts);
    currentTask = tasks[Math.floor(Math.random() * tasks.length)];
    scTaskEl.innerText = currentTask;
  }
  window.checkShortcut = function () {
    const ans = document.getElementById("shortcutInput").value.trim();
    const fb = document.getElementById("shortcutFeedback");
    if (ans.toLowerCase() === shortcuts[currentTask].toLowerCase()) {
      fb.innerText = "✅ Correct!";
    } else {
      fb.innerText = `❌ Wrong. Correct: ${shortcuts[currentTask]}`;
    }
    const tasks = Object.keys(shortcuts);
    currentTask = tasks[Math.floor(Math.random() * tasks.length)];
    if (scTaskEl) scTaskEl.innerText = currentTask;
    document.getElementById("shortcutInput").value = "";
  };

  /* =======================
     UNIT CONVERTER
  ======================= */
  window.convertUnit = function () {
    const type = document.getElementById("unitType").value;
    const val = parseFloat(document.getElementById("unitInput").value);
    const result = document.getElementById("conversionResult");
    if (isNaN(val)) { result.innerText = "Enter a number"; return; }
    let out = "";
    if (type === "length") out = `${val} m = ${val * 100} cm = ${val * 3.28} ft`;
    else if (type === "weight") out = `${val} kg = ${val * 1000} g = ${val * 2.2} lb`;
    else if (type === "temperature") out = `${val} °C = ${(val * 9/5 + 32).toFixed(1)} °F = ${(val+273.15).toFixed(1)} K`;
    else if (type === "time") out = `${val} hr = ${val * 60} min = ${val * 3600} sec`;
    result.innerText = out;
  };

  /* =======================
     BMI CALCULATOR
  ======================= */
  window.calculateBMI = function () {
    const h = parseFloat(document.getElementById("bmiHeight").value) / 100;
    const w = parseFloat(document.getElementById("bmiWeight").value);
    if (!h || !w) return;
    const bmi = (w / (h * h)).toFixed(1);
    let status = "Normal";
    if (bmi < 18.5) status = "Underweight";
    else if (bmi >= 25) status = "Overweight";
    document.getElementById("bmiResult").innerText = `BMI: ${bmi} (${status})`;
  };

  /* =======================
     STOPWATCH & TIMER
  ======================= */
  let stopwatchInterval, swSeconds = 0;
  function formatTime(s) {
    const h = String(Math.floor(s/3600)).padStart(2,"0");
    const m = String(Math.floor((s%3600)/60)).padStart(2,"0");
    const sec = String(s%60).padStart(2,"0");
    return `${h}:${m}:${sec}`;
  }
  window.startStopwatch = function () {
    if (stopwatchInterval) return;
    stopwatchInterval = setInterval(() => {
      swSeconds++;
      document.getElementById("stopwatchDisplay").innerText = formatTime(swSeconds);
    }, 1000);
  };
  window.pauseStopwatch = function () {
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  };
  window.resetStopwatch = function () {
    swSeconds = 0;
    document.getElementById("stopwatchDisplay").innerText = "00:00:00";
    clearInterval(stopwatchInterval);
    stopwatchInterval = null;
  };

  let timerInterval, timerSeconds = 0;
  window.startTimer = function () {
    timerSeconds = parseInt(document.getElementById("timerInput").value);
    if (isNaN(timerSeconds) || timerSeconds <= 0) return;
    document.getElementById("timerDisplay").innerText = formatTime(timerSeconds);
    timerInterval = setInterval(() => {
      if (timerSeconds <= 0) { clearInterval(timerInterval); return; }
      timerSeconds--;
      document.getElementById("timerDisplay").innerText = formatTime(timerSeconds);
    }, 1000);
  };
  window.resetTimer = function () {
    clearInterval(timerInterval);
    document.getElementById("timerDisplay").innerText = "00:00";
    document.getElementById("timerInput").value = "";
  };

  /* =======================
     CALCULATOR
  ======================= */
  window.clearCalc = function () {
    document.getElementById("calcDisplay").value = "";
  };
  window.appendToCalc = function (val) {
    document.getElementById("calcDisplay").value += val;
  };
  window.calculateResult = function () {
    try {
      const expr = document.getElementById("calcDisplay").value;
      document.getElementById("calcDisplay").value = eval(expr);
    } catch {
      document.getElementById("calcDisplay").value = "Error";
    }
  };

  /* =======================
     CURRENCY CONVERTER (Simple static)
  ======================= */
  // ------------------ Currency Converter ------------------
const amountInput = document.getElementById("currencyAmount");
const fromSel = document.getElementById("currencyFrom");
const toSel = document.getElementById("currencyTo");
const resultEl = document.getElementById("currencyResult");
const updatedEl = document.getElementById("currencyUpdated");
const loadingEl = document.getElementById("currencyLoading");
const convertBtn = document.getElementById("convertCurrency");

// Supported currencies
const supportedCurrencies = ["USD", "INR", "EUR", "GBP", "JPY"];

// Populate dropdowns
if (fromSel && toSel) {
  supportedCurrencies.forEach(c => {
    let opt1 = new Option(c, c);
    let opt2 = new Option(c, c);
    fromSel.add(opt1);
    toSel.add(opt2);
  });
  fromSel.value = "USD";
  toSel.value = "INR";
}

let latestRates = {};

// Load backup from localStorage
function loadBackupRates() {
  const saved = localStorage.getItem("currencyRates");
  if (saved) {
    const data = JSON.parse(saved);
    latestRates = data.rates;
    if (updatedEl) updatedEl.textContent = `⚠️ Using saved rates (${data.time})`;
  }
}

// Save backup
function saveBackupRates(rates) {
  const data = {
    rates: rates,
    time: new Date().toLocaleString()
  };
  localStorage.setItem("currencyRates", JSON.stringify(data));
}

// Fetch rates from Frankfurter
async function fetchRates(base = "USD") {
  try {
    if (loadingEl) loadingEl.style.display = "block";

    // Frankfurter API (supports EUR, USD, GBP, JPY, INR, etc.)
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`);
    const data = await res.json();

    if (data.rates) {
      latestRates = { ...data.rates, [base]: 1 }; // add base = 1
      saveBackupRates(latestRates);
      if (updatedEl) updatedEl.textContent = `Rates updated: ${new Date().toLocaleTimeString()}`;
    } else {
      throw new Error("No rates in response");
    }
  } catch (err) {
    console.warn("⚠️ API fetch failed, using backup", err);
    loadBackupRates();
  } finally {
    if (loadingEl) loadingEl.style.display = "none";
  }
}

// Convert
function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  const from = fromSel.value;
  const to = toSel.value;

  if (isNaN(amount) || amount <= 0) {
    resultEl.textContent = "⚠️ Please enter a valid amount.";
    return;
  }

  if (!latestRates[to] || !latestRates[from]) {
    resultEl.textContent = "❌ No rates available. Please check your connection.";
    return;
  }

  const rate = latestRates[to] / latestRates[from];
  const result = amount * rate;

  resultEl.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
}

// Event
if (convertBtn) convertBtn.addEventListener("click", convertCurrency);

// Load backup immediately
loadBackupRates();

// First fetch
fetchRates("USD");

// Auto-refresh every 1 min
setInterval(() => {
  fetchRates("USD");
}, 60000);


  /* =======================
     HELPERS
  ======================= */
  function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, function (m) {
      return ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
      })[m];
    });
  }
  function escapeAttr(text) {
    return text.replace(/"/g, "&quot;");
  }

}); // DOMContentLoaded END


