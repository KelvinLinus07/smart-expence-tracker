// ==========================
// AUTH CHECK
// ==========================
const currentUser = localStorage.getItem("loggedInUser");
if (!currentUser) window.location.href = "index.html";

// ==========================
// ELEMENTS
// ==========================
const setupSection = document.getElementById("setupSection");
const dashboardSection = document.getElementById("dashboardSection");

const monthlyBudgetInput = document.getElementById("monthlyBudget");
const savingsGoalInput = document.getElementById("savingsGoal");
const saveSetupBtn = document.getElementById("saveSetup");

const budgetDisplay = document.getElementById("budgetDisplay");
const savingsDisplay = document.getElementById("savingsDisplay");
const dailyLimitDisplay = document.getElementById("dailyLimitDisplay");
const remainingDisplay = document.getElementById("remainingDisplay");

const expenseAmountInput = document.getElementById("expenseAmount");
const addExpenseBtn = document.getElementById("addExpense");

const statusMessage = document.getElementById("statusMessage");
const logoutBtn = document.getElementById("logoutBtn");

const historyList = document.getElementById("historyList");

// ==========================
// DATA
// ==========================
let userData = JSON.parse(localStorage.getItem(currentUser)) || {};

if (!userData.transactions) userData.transactions = [];
if (!userData.habits) userData.habits = [];

// ==========================
// INIT
// ==========================
if (userData.monthlyBudget && userData.savingsGoal) {
    showDashboard();
} else {
    setupSection.style.display = "block";
}

// ==========================
// SAVE DATA
// ==========================
function saveData() {
    localStorage.setItem(currentUser, JSON.stringify(userData));
}

// ==========================
// ADD HABIT INPUT FIELD
// ==========================
document.getElementById("addHabit").addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("habit-row");

    div.innerHTML = `
        <input type="text" class="habitName" placeholder="Item">
        <input type="number" class="habitAmount" placeholder="Amount ₹">
    `;

    document.getElementById("habitContainer").appendChild(div);
});

// ==========================
// SAVE SETUP
// ==========================
saveSetupBtn.addEventListener("click", () => {
    const monthlyBudget = parseFloat(monthlyBudgetInput.value);
    const savingsGoal = parseFloat(savingsGoalInput.value);

    if (!monthlyBudget || !savingsGoal) {
        alert("Enter valid values!");
        return;
    }

    // Save basic data
    userData.monthlyBudget = monthlyBudget;
    userData.savingsGoal = savingsGoal;
    userData.dailyLimit = (monthlyBudget - savingsGoal) / 30;
    userData.todaySpent = 0;
    userData.lastUpdated = new Date().toDateString();

    // ==========================
    // SAVE HABITS
    // ==========================
    const names = document.querySelectorAll(".habitName");
    const amounts = document.querySelectorAll(".habitAmount");

    userData.habits = [];

    names.forEach((n, i) => {
        if (n.value && amounts[i].value) {
            userData.habits.push({
                name: n.value,
                amount: parseFloat(amounts[i].value)
            });
        }
    });

    saveData();
    showDashboard();
});

// ==========================
// SHOW DASHBOARD
// ==========================
function showDashboard() {
    setupSection.style.display = "none";
    dashboardSection.style.display = "block";

    createQuickButtons();
    updateUI();
}

// ==========================
// CREATE QUICK BUTTONS
// ==========================
function createQuickButtons() {
    const container = document.getElementById("quickButtons");
    container.innerHTML = "";

    userData.habits.forEach(habit => {
        const btn = document.createElement("div");
        btn.className = "quick-btn";
        btn.innerText = `${habit.name} ₹${habit.amount}`;

        btn.onclick = () => {
            addExpense(habit.amount, habit.name);
        };

        container.appendChild(btn);
    });
}

// ==========================
// RESET DAILY
// ==========================
function resetDailyIfNeeded() {
    const today = new Date().toDateString();

    if (userData.lastUpdated !== today) {
        userData.todaySpent = 0;
        userData.lastUpdated = today;
        saveData();
    }
}

// ==========================
// UPDATE UI
// ==========================
function updateUI() {
    resetDailyIfNeeded();

    const remaining = userData.dailyLimit - userData.todaySpent;

    budgetDisplay.innerText = "₹" + userData.monthlyBudget;
    savingsDisplay.innerText = "₹" + userData.savingsGoal;
    dailyLimitDisplay.innerText = "₹" + userData.dailyLimit.toFixed(2);
    remainingDisplay.innerText = "₹" + remaining.toFixed(2);

    updateStatus(remaining);
    updateHistory();
    updateChart();
}

// ==========================
// ADD EXPENSE FUNCTION
// ==========================
function addExpense(amount, category = "Other") {
    if (!amount || amount <= 0) {
        alert("Enter valid amount!");
        return;
    }

    userData.todaySpent += amount;

    userData.transactions.push({
        amount,
        category,
        date: new Date().toLocaleDateString()
    });

    // Overspending logic
    if (userData.todaySpent > userData.dailyLimit) {
        const extra = userData.todaySpent - userData.dailyLimit;
        userData.dailyLimit -= extra;
    }

    saveData();
    updateUI();
}

// ==========================
// OTHER EXPENSE BUTTON
// ==========================
addExpenseBtn.addEventListener("click", () => {
    const amount = parseFloat(expenseAmountInput.value);
    addExpense(amount, "Other");
    expenseAmountInput.value = "";
});

// ==========================
// STATUS SYSTEM
// ==========================
function updateStatus(remaining) {
    const percent = (remaining / userData.dailyLimit) * 100;

    statusMessage.className = "";

    if (percent >= 75) {
        statusMessage.innerText = "🟢 You are doing great!";
        statusMessage.classList.add("green");
    } else if (percent >= 45) {
        statusMessage.innerText = "🟡 Be mindful of spending";
        statusMessage.classList.add("yellow");
    } else {
        statusMessage.innerText = "🔴 Low balance! Control spending";
        statusMessage.classList.add("red");
    }
}

// ==========================
// HISTORY
// ==========================
function updateHistory() {
    historyList.innerHTML = "";

    userData.transactions.slice().reverse().forEach(tx => {
        const li = document.createElement("li");
        li.textContent = `${tx.date} - ₹${tx.amount} (${tx.category})`;
        historyList.appendChild(li);
    });
}

// ==========================
// CHART
// ==========================
let chart;

function updateChart() {
    const categoryTotals = {};

    userData.transactions.forEach(tx => {
        categoryTotals[tx.category] =
            (categoryTotals[tx.category] || 0) + tx.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const ctx = document.getElementById("expenseChart");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    "#ff6384",
                    "#36a2eb",
                    "#ffce56",
                    "#4bc0c0",
                    "#9966ff"
                ]
            }]
        }
    });
}

// ==========================
// LOGOUT
// ==========================
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});