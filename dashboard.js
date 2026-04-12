// ==========================
// CHECK LOGIN
// ==========================
const user = localStorage.getItem("loggedInUser");
if (!user) location.href = "index.html";

const userKey = `expenseUser_${user}`;

// LOAD USER DATA
let data = JSON.parse(localStorage.getItem(userKey)) || {
    username: user,
    password: "",
    monthly: null,
    savings: null,
    fixedTotal: 0,
    dailyLimit: 0,
    today: 0,
    habits: [],
    transactions: []
};
// ==========================
// EXTRA REWARD DATA INIT
// ==========================
if (!data.savingBadges) data.savingBadges = [];
if (!data.monthlySafe) data.monthlySafe = false;
if (!data.totalSpent) data.totalSpent = 0;

if (!data.consistency) {
    data.consistency = {
        currentStreak: 0,
        level: 1,
        lastUpdate: null
    };
}

// ==========================
// ELEMENTS
// ==========================
const setupSection = document.getElementById("setupSection");
const dashboardSection = document.getElementById("dashboardSection");

const monthlyBudget = document.getElementById("monthlyBudget");
const savingsGoal = document.getElementById("savingsGoal");

const addExpenseBtn = document.getElementById("addExpense");
const expenseAmount = document.getElementById("expenseAmount");

const budgetDisplay = document.getElementById("budgetDisplay");
const fixedDisplay = document.getElementById("fixedDisplay");
const dailyLimitDisplay = document.getElementById("dailyLimitDisplay");
const remainingDisplay = document.getElementById("remainingDisplay");

const quickButtons = document.getElementById("quickButtons");
const historyList = document.getElementById("historyList");
const historyDates = document.getElementById("historyDates");

const statusMessage = document.getElementById("statusMessage");
const aiSuggestions = document.getElementById("aiSuggestions");

let selectedHistoryDate = "ALL";

// ==========================
// ADD FIXED
// ==========================
document.getElementById("addFixed").onclick = () => {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `
        <input class="fixedName" placeholder="Expense name">
        <input class="fixedAmount" type="number" placeholder="Amount ₹">
    `;
    document.getElementById("fixedContainer").appendChild(div);
};

// ==========================
// ADD HABIT
// ==========================
document.getElementById("addHabit").onclick = () => {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `
        <input class="habitName" placeholder="Habit name">
        <input class="habitAmount" type="number" placeholder="Amount ₹">
    `;
    document.getElementById("habitContainer").appendChild(div);
};

// ==========================
// SAVE SETUP
// ==========================
document.getElementById("saveSetup").onclick = () => {
    data.monthly = +monthlyBudget.value;
    data.savings = +savingsGoal.value;

    const fixed = document.querySelectorAll(".fixedAmount");
    data.fixedTotal = 0;
    fixed.forEach(f => data.fixedTotal += +f.value || 0);

    data.habits = [];
    const habitNames = document.querySelectorAll(".habitName");
    const habitAmounts = document.querySelectorAll(".habitAmount");

    habitNames.forEach((n, i) => {
        const amt = habitAmounts[i].value;
        if (n.value && amt) {
            data.habits.push({ name: n.value, amount: +amt });
        }
    });

    data.dailyLimit = (data.monthly - (data.fixedTotal + data.savings)) / 30;

    if (!data.today) data.today = 0;

    save();
    show();
};

// ==========================
// SAVE
// ==========================
function save() {
    localStorage.setItem(userKey, JSON.stringify(data));
}

// ==========================
// SHOW
// ==========================
function show() {
    setupSection.style.display = "none";
    dashboardSection.style.display = "block";

    createButtons();
    updateUI();
}

// ==========================
// QUICK BUTTONS
// ==========================
function createButtons() {
    quickButtons.innerHTML = "";

    data.habits.forEach(h => {
        const btn = document.createElement("div");
        btn.className = "quick-btn";
        btn.innerText = `${h.name} ₹${h.amount}`;
        btn.onclick = () => addExpense(h.amount, h.name);
        quickButtons.appendChild(btn);
    });
}

// ==========================
// ADD EXPENSE
// ==========================
function addExpense(amount, cat = "Other") {
    if (!amount || amount <= 0) return;

    const today = new Date().toISOString().split("T")[0];

    data.today += amount;
    data.totalSpent += amount;

    data.transactions.push({
        amount,
        cat,
        date: today
    });

    save();
    updateUI();
}

// ==========================
addExpenseBtn.onclick = () => {
    addExpense(+expenseAmount.value, "Other");
    expenseAmount.value = "";
};

// ==========================
// DATE CHIPS
// ==========================
function renderHistoryDateChips() {
    historyDates.innerHTML = "";

    const uniqueDates = [...new Set(data.transactions.map(t => t.date))]
        .sort()
        .reverse();

    const allChip = document.createElement("div");
    allChip.className = "date-chip";
    if (selectedHistoryDate === "ALL") allChip.classList.add("active");
    allChip.innerText = "All";
    allChip.onclick = () => {
        selectedHistoryDate = "ALL";
        renderHistoryDateChips();
        updateHistory();
    };
    historyDates.appendChild(allChip);

    uniqueDates.forEach(date => {
        const chip = document.createElement("div");
        chip.className = "date-chip";
        if (selectedHistoryDate === date) chip.classList.add("active");

        chip.innerText = date;

        chip.onclick = () => {
            selectedHistoryDate = date;
            renderHistoryDateChips();
            updateHistory();
        };

        historyDates.appendChild(chip);
    });
}

// ==========================
// UPDATE UI
// ==========================
function updateUI() {
    const remaining = data.dailyLimit - data.today;

    budgetDisplay.innerText = "₹" + data.monthly;
    fixedDisplay.innerText = "₹" + data.fixedTotal;
    dailyLimitDisplay.innerText = "₹" + data.dailyLimit.toFixed(2);
    remainingDisplay.innerText = "₹" + remaining.toFixed(2);

    updateStatus(remaining);
    renderHistoryDateChips();
    updateHistory();
    generateAISuggestions();
    checkBadges();
}

// ==========================
function updateStatus(rem) {
    const p = (rem / data.dailyLimit) * 100;
    statusMessage.className = "";

    if (p >= 75) {
        statusMessage.innerText = "🟢 Good";
        statusMessage.classList.add("green");
    } else if (p >= 45) {
        statusMessage.innerText = "🟡 Careful";
        statusMessage.classList.add("yellow");
    } else {
        statusMessage.innerText = "🔴 Low balance";
        statusMessage.classList.add("red");
    }
}

// ==========================
// HISTORY
// ==========================
function updateHistory() {
    historyList.innerHTML = "";

    let filtered = data.transactions.slice().reverse();

    if (selectedHistoryDate !== "ALL") {
        filtered = filtered.filter(t => t.date === selectedHistoryDate);
    }

    if (filtered.length === 0) {
        historyList.innerHTML = "<li>No transactions found</li>";
        return;
    }

    filtered.forEach(t => {
        const li = document.createElement("li");
        li.innerText = `${t.date} ₹${t.amount} (${t.cat})`;
        historyList.appendChild(li);
    });
}

// ==========================
// AI CHAT
// ==========================
function addMessage(text) {
    const div = document.createElement("div");
    div.className = "ai-message";
    div.innerText = text;
    aiSuggestions.appendChild(div);
}

function addSection(title) {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${title}</strong>`;
    div.style.marginTop = "10px";
    aiSuggestions.appendChild(div);
}

// ==========================
// AI ENGINE (SMART COACH)
// ==========================
function generateAISuggestions() {
    aiSuggestions.innerHTML = "";

    if (!data.transactions.length) {
        addMessage("Start adding expenses to get smart insights.");
        return;
    }

    const totalToday = data.today;
    const remaining = data.dailyLimit - totalToday;

    const map = {};
    data.transactions.forEach(t => {
        const cat = t.cat.toLowerCase();
        map[cat] = (map[cat] || 0) + t.amount;
    });

    let mainCause = "";
    let maxVal = 0;

    for (let cat in map) {
        if (map[cat] > maxVal) {
            maxVal = map[cat];
            mainCause = cat;
        }
    }

    // OVERSPENDING
    if (remaining < 0) {
        addMessage("😬 You crossed your daily budget.");
        if (mainCause) {
            addMessage(`Main reason: ${mainCause} (₹${maxVal})`);
            addMessage(`👉 Try avoiding ${mainCause} for the rest of today.`);
        }
        addSection("📅 Plan:");
        addMessage("• No more spending today");
        addMessage("• Restart fresh tomorrow");
        return;
    }

    // NEAR LIMIT
    if (totalToday > data.dailyLimit * 0.8) {
        addMessage("⚠️ You're getting close to your limit.");
        if (mainCause) {
            addMessage(`Most spending is on ${mainCause}`);
            addMessage(`👉 Reduce ${mainCause} now to stay safe.`);
        }
    }

    // GOOD
    if (totalToday <= data.dailyLimit * 0.7) {
        addMessage("👏 Nice! You're managing your spending well today.");
    }

    const safe = Math.round(remaining * 0.5);

    addSection("📅 Plan for today:");
    if (mainCause) addMessage(`• Try to avoid ${mainCause}`);
    addMessage(`• Spend only ₹${safe} more`);
    addMessage("• Focus on essentials only");
}
// ==========================
// BADGE SYSTEM
// ==========================
const badgeLevels = [
    { days: 1, name: "Smart 🧠" },
    { days: 3, name: "Super Smart ⚡" },
    { days: 7, name: "Ultra Smart 🚀" },
    { days: 15, name: "Consistency 🔁" },
    { days: 32, name: "Peak 🔥" },
    { days: 66, name: "Gold 🥇" },
    { days: 99, name: "Platinum 💎" },
    { days: 132, name: "Diamond 💠" },
    { days: 166, name: "Titanium ⚙️" },
    { days: 200, name: "Ultranium 🌌" },
    { days: 250, name: "Crown 👑" },
    { days: 299, name: "Lord 🏰" },
    { days: 365, name: "Mastery 🧘" }
];

function checkBadges() {
    if (!data.badges) data.badges = [];

    badgeLevels.forEach(b => {
        if (data.streak >= b.days && !data.badges.includes(b.name)) {
            data.badges.push(b.name);
        }
    });

    save();
}
const today = new Date().toISOString().split("T")[0];

if (data.lastSavedDate !== today) {
    data.today = 0; // reset daily spending
    data.lastSavedDate = today;
    localStorage.setItem(userKey, JSON.stringify(data));
}
// ==========================
if (data.monthly) {
    show();
} else {
    setupSection.style.display = "block";
    dashboardSection.style.display = "none";
}