const user = localStorage.getItem("loggedInUser");
if (!user) location.href = "index.html";

let data = JSON.parse(localStorage.getItem(user)) || {};
if (!data.transactions) data.transactions = [];

// ADD FIXED
document.getElementById("addFixed").onclick = () => {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `
        <input class="fixedName">
        <input class="fixedAmount" type="number">
    `;
    document.getElementById("fixedContainer").appendChild(div);
};

// ADD HABIT
document.getElementById("addHabit").onclick = () => {
    const div = document.createElement("div");
    div.className = "row";
    div.innerHTML = `
        <input class="habitName">
        <input class="habitAmount" type="number">
    `;
    document.getElementById("habitContainer").appendChild(div);
};

// SAVE SETUP
document.getElementById("saveSetup").onclick = () => {
    data.monthly = +monthlyBudget.value;
    data.savings = +savingsGoal.value;

    // FIXED
    const fixed = document.querySelectorAll(".fixedAmount");
    data.fixedTotal = 0;
    fixed.forEach(f => data.fixedTotal += +f.value || 0);

    // HABITS
    data.habits = [];
    document.querySelectorAll(".habitName").forEach((n,i)=>{
        const amt = document.querySelectorAll(".habitAmount")[i].value;
        if(n.value && amt){
            data.habits.push({name:n.value, amount:+amt});
        }
    });

    // CALCULATION
    data.dailyLimit = (data.monthly - (data.fixedTotal + data.savings)) / 30;
    data.today = 0;

    save();
    show();
};

function save(){
    localStorage.setItem(user, JSON.stringify(data));
}

function show(){
    setupSection.style.display="none";
    dashboardSection.style.display="block";

    createButtons();
    updateUI();
}

// QUICK BUTTONS
function createButtons(){
    quickButtons.innerHTML="";
    data.habits.forEach(h=>{
        const b=document.createElement("div");
        b.className="quick-btn";
        b.innerText=h.name+" ₹"+h.amount;
        b.onclick=()=>addExpense(h.amount,h.name);
        quickButtons.appendChild(b);
    });
}

// ADD EXPENSE
function addExpense(amount,cat="Other"){
    data.today+=amount;

    data.transactions.push({
        amount,cat,date:new Date().toLocaleDateString()
    });

    save();
    updateUI();
}

// OTHER BUTTON
addExpenseBtn.onclick=()=>{
    addExpense(+expenseAmount.value,"Other");
    expenseAmount.value="";
};

// UPDATE UI
function updateUI(){
    const remaining=data.dailyLimit-data.today;

    budgetDisplay.innerText="₹"+data.monthly;
    fixedDisplay.innerText="₹"+data.fixedTotal;
    dailyLimitDisplay.innerText="₹"+data.dailyLimit.toFixed(2);
    remainingDisplay.innerText="₹"+remaining.toFixed(2);

    updateStatus(remaining);
    updateHistory();
    updateChart();
}

// STATUS
function updateStatus(rem){
    const p=(rem/data.dailyLimit)*100;
    statusMessage.className="";

    if(p>=75){statusMessage.innerText="🟢 Good";statusMessage.classList.add("green");}
    else if(p>=45){statusMessage.innerText="🟡 Careful";statusMessage.classList.add("yellow");}
    else{statusMessage.innerText="🔴 Low balance";statusMessage.classList.add("red");}
}

// HISTORY
function updateHistory(){
    historyList.innerHTML="";
    data.transactions.slice().reverse().forEach(t=>{
        const li=document.createElement("li");
        li.innerText=`${t.date} ₹${t.amount} (${t.cat})`;
        historyList.appendChild(li);
    });
}

// CHART
let chart;
function updateChart(){
    const map={};
    data.transactions.forEach(t=>{
        map[t.cat]=(map[t.cat]||0)+t.amount;
    });

    if(chart) chart.destroy();

    chart=new Chart(expenseChart,{
        type:"pie",
        data:{
            labels:Object.keys(map),
            datasets:[{data:Object.values(map)}]
        }
    });
}

// LOGOUT
logoutBtn.onclick=()=>{
    localStorage.removeItem("loggedInUser");
    location.href="index.html";
};

// INIT
if(data.monthly) show();