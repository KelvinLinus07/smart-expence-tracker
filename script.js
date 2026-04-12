// ==========================
// AUTO REDIRECT
// ==========================
const currentUser = localStorage.getItem("loggedInUser");

if (currentUser && !sessionStorage.getItem("justLoggedOut")) {
    window.location.href = "dashboard.html";
}

// clear logout flag after use
sessionStorage.removeItem("justLoggedOut");

// ==========================
// ELEMENTS
// ==========================
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

// ==========================
// TOGGLE
// ==========================
showSignup.onclick = () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
};

showLogin.onclick = () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
};

// ==========================
// SIGNUP
// ==========================
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = signupUsername.value.trim();
    const password = signupPassword.value.trim();

    if (!username || !password) {
        alert("Fill all fields");
        return;
    }

    // NEW USER STORAGE KEY
    const userKey = `expenseUser_${username}`;
    const existingUser = JSON.parse(localStorage.getItem(userKey));

    if (existingUser) {
        alert("User already exists");
        return;
    }

    // CREATE FULL USER OBJECT
    const newUser = {
        username,
        password,
        monthly: null,
        savings: null,
        fixedTotal: 0,
        dailyLimit: 0,
        today: 0,
        habits: [],
        transactions: []
    };

    localStorage.setItem(userKey, JSON.stringify(newUser));

    alert("Account created successfully!");

    signupForm.reset();
    signupForm.style.display = "none";
    loginForm.style.display = "block";
});

// ==========================
// LOGIN
// ==========================
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();

    // MATCH SAME KEY
    const userKey = `expenseUser_${username}`;
    const user = JSON.parse(localStorage.getItem(userKey));

    if (!user) {
        alert("User not found");
        return;
    }

    if (user.password !== password) {
        alert("Wrong password");
        return;
    }

    // SAVE ACTIVE USER
   localStorage.setItem("loggedInUser", username);

// ==========================
// DAILY CHECK-IN SYSTEM
// ==========================
let userData = JSON.parse(localStorage.getItem(userKey));

const today = new Date().toISOString().split("T")[0];

if (!userData.lastLoginDate) {
    userData.lastLoginDate = today;
    userData.streak = 1;
} else {
    const last = new Date(userData.lastLoginDate);
    const curr = new Date(today);

    const diff = (curr - last) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
        userData.streak += 1; // continue streak
    } else if (diff > 1) {
        userData.streak = 1; // reset streak
    }

    userData.lastLoginDate = today;
}

// INIT BADGES
if (!userData.badges) userData.badges = [];

localStorage.setItem(userKey, JSON.stringify(userData));

    sessionStorage.removeItem("justLoggedOut");
    window.location.href = "dashboard.html";
});