// ==========================
// CHECK LOGIN
// ==========================
const user = localStorage.getItem("loggedInUser");
if (!user) location.href = "index.html";

// NEW USER STORAGE KEY
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
const statusMessage = document.getElementById("statusMessage");

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

    // FIXED EXPENSES
    const fixed = document.querySelectorAll(".fixedAmount");
    data.fixedTotal = 0;
    fixed.forEach(f => {
        data.fixedTotal += +f.value || 0;
    });

    // HABITS
    data.habits = [];
    const habitNames = document.querySelectorAll(".habitName");
    const habitAmounts = document.querySelectorAll(".habitAmount");

    habitNames.forEach((n, i) => {
        const amt = habitAmounts[i].value;
        if (n.value && amt) {
            data.habits.push({
                name: n.value,
                amount: +amt
            });
        }
    });

    // DAILY LIMIT
    data.dailyLimit =
        (data.monthly - (data.fixedTotal + data.savings)) / 30;

    // only reset today for first setup
    if (!data.today) data.today = 0;

    save();
    show();
};

// ==========================
// SAVE DATA
// ==========================
function save() {
    localStorage.setItem(userKey, JSON.stringify(data));
}

// ==========================
// SHOW DASHBOARD
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

    data.today += amount;

    data.transactions.push({
        amount,
        cat,
        date: new Date().toLocaleDateString()
    });

    save();
    updateUI();
}

// ==========================
// OTHER EXPENSE
// ==========================
addExpenseBtn.onclick = () => {
    addExpense(+expenseAmount.value, "Other");
    expenseAmount.value = "";
};

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
    updateHistory();
    updateChart();
}

// ==========================
// STATUS
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

    data.transactions.slice().reverse().forEach(t => {
        const li = document.createElement("li");
        li.innerText = `${t.date} ₹${t.amount} (${t.cat})`;
        historyList.appendChild(li);
    });
}

// ==========================
// CHART
// ==========================
let chart;

function updateChart() {
    const map = {};

    data.transactions.forEach(t => {
        map[t.cat] = (map[t.cat] || 0) + t.amount;
    });

    if (chart) chart.destroy();

    chart = new Chart(expenseChart, {
        type: "pie",
        data: {
            labels: Object.keys(map),
            datasets: [{
                data: Object.values(map)
            }]
        }
    });
}

// ==========================
// INIT
// ==========================
if (data.monthly) {
    show();
} else {
    setupSection.style.display = "block";
    dashboardSection.style.display = "none";
}