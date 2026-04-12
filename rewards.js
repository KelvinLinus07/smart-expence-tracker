// ==========================
// USER CHECK
// ==========================
const user = localStorage.getItem("loggedInUser");
if (!user) location.href = "index.html";

const userKey = `expenseUser_${user}`;
const data = JSON.parse(localStorage.getItem(userKey)) || {};

// ==========================
// ELEMENTS
// ==========================
const streakDisplay = document.getElementById("streakDisplay");
const unlocked = document.getElementById("unlocked");
const locked = document.getElementById("locked");
const savingRewards = document.getElementById("savingRewards");
const monthlyReward = document.getElementById("monthlyReward");
const levelDisplay = document.getElementById("levelDisplay");

// ==========================
// BADGE LEVELS (WITH DESC)
// ==========================
const badgeLevels = [
    { days: 1, name: "Smart 🧠", desc: "Login 1 day" },
    { days: 3, name: "Super Smart ⚡", desc: "Login 3 days" },
    { days: 7, name: "Ultra Smart 🚀", desc: "Login 7 days" },
    { days: 15, name: "Consistency 🔁", desc: "Login 15 days" },
    { days: 32, name: "Peak 🔥", desc: "Login 32 days" },
    { days: 66, name: "Gold 🥇", desc: "Login 66 days" },
    { days: 99, name: "Platinum 💎", desc: "Login 99 days" },
    { days: 132, name: "Diamond 💠", desc: "Login 132 days" },
    { days: 166, name: "Titanium ⚙️", desc: "Login 166 days" },
    { days: 200, name: "Ultranium 🌌", desc: "Login 200 days" },
    { days: 250, name: "Crown 👑", desc: "Login 250 days" },
    { days: 299, name: "Lord 🏰", desc: "Login 299 days" },
    { days: 365, name: "Mastery 🧘", desc: "Login 365 days" }
];

// ==========================
// STREAK DISPLAY
// ==========================
streakDisplay.innerText = `${data.streak || 0} days`;

// ==========================
// MAIN BADGES + CLAIM SYSTEM
// ==========================
badgeLevels.forEach(b => {
    const li = document.createElement("li");

    const isUnlocked = (data.streak || 0) >= b.days;
    const isClaimed = data.claimedBadges && data.claimedBadges.includes(b.name);

    if (isUnlocked) {
        li.innerHTML = `
            ${b.name} <small>(${b.desc})</small>
            ${
                isClaimed
                ? `<span class="claimed">✅ Claimed</span>`
                : `<button class="claim-btn">Claim</button>`
            }
        `;

        const btn = li.querySelector(".claim-btn");

        if (btn) {
            btn.onclick = () => {
                if (!data.claimedBadges) data.claimedBadges = [];

                data.claimedBadges.push(b.name);
                localStorage.setItem(userKey, JSON.stringify(data));

                btn.classList.add("claim-burst");

                setTimeout(() => {
                    btn.outerHTML = `<span class="claimed-badge">✨ CLAIMED</span>`;
                }, 400);
            };
        }

        unlocked.appendChild(li);

    } else {
        const remaining = b.days - (data.streak || 0);

        li.innerHTML = `
            🔒 ${b.name} <small>(${b.desc})</small> 
            - Need ${remaining} more days
        `;

        locked.appendChild(li);
    }
});

// ==========================
// 💰 SAVING BADGES (WITH DESC)
// ==========================
function checkSavingBadges() {
    const saved = (data.dailyLimit || 0) - (data.today || 0);

    const percent = (data.dailyLimit > 0)
        ? (saved / data.dailyLimit) * 100
        : 0;

    const levels = [
        { p: 20, name: "Daily Saver 💰", desc: "Save 20% of daily limit" },
        { p: 40, name: "Ultimate Saver ⚡", desc: "Save 40% of daily limit" },
        { p: 60, name: "Thunder Saver 🌩", desc: "Save 60% of daily limit" },
        { p: 80, name: "Heroic Saver 🦸", desc: "Save 80% of daily limit" },
        { p: 100, name: "Grand Saver 👑", desc: "Save 100% of daily limit" }
    ];

    return levels.filter(l => percent >= l.p);
}

// ==========================
// 🛡 MONTHLY BADGE
// ==========================
function getMonthlyBadge() {
    if (data.monthly && data.totalSpent <= data.monthly) {
        return "🛡 Protector Badge";
    }
    return null;
}

// ==========================
// 📈 CONSISTENCY SYSTEM
// ==========================
function updateConsistency() {
    if (!data.consistency) {
        data.consistency = {
            currentStreak: 0,
            level: 1,
            lastUpdate: null
        };
    }

    const today = new Date().toISOString().split("T")[0];

    if (!data.consistency.lastUpdate) {
        data.consistency.lastUpdate = today;
        data.consistency.currentStreak = 1;
    } else {
        const last = new Date(data.consistency.lastUpdate);
        const curr = new Date(today);

        const diff = (curr - last) / (1000 * 60 * 60 * 24);

        if (diff === 1 && (data.today || 0) > 0) {
            data.consistency.currentStreak++;

            if (data.consistency.currentStreak >= data.consistency.level) {
                data.consistency.level++;
                data.consistency.currentStreak = 0;
            }

        } else if (diff > 1) {
            data.consistency.currentStreak = 0;
        }

        data.consistency.lastUpdate = today;
    }

    localStorage.setItem(userKey, JSON.stringify(data));
}

// ==========================
// 🎯 RENDER REWARDS UI
// ==========================
function renderRewards() {

    // 💰 SAVINGS
    const savings = checkSavingBadges();
    savingRewards.innerHTML = "";

    if (savings.length === 0) {
        savingRewards.innerText = "No saving badges yet";
    } else {
        savings.forEach(b => {
            const div = document.createElement("div");
            div.innerHTML = `🏆 ${b.name} <small>(${b.desc})</small>`;
            savingRewards.appendChild(div);
        });
    }

    // 🛡 MONTHLY
    const monthly = getMonthlyBadge();
    monthlyReward.innerHTML = monthly
        ? `${monthly} <small>(Stay within monthly budget)</small>`
        : "No monthly badge yet";

    // 📈 LEVEL
    if (data.consistency) {
        levelDisplay.innerHTML =
            `Level ${data.consistency.level} 
            <small>(Maintain daily activity streak)</small>
            <br>Progress: ${data.consistency.currentStreak}`;
    } else {
        levelDisplay.innerText = "Level 1 (Progress: 0)";
    }
}

// ==========================
// INIT
// ==========================
updateConsistency();
renderRewards();