// ==========================
// AUTO REDIRECT FIXED
// ==========================
const currentUser = localStorage.getItem("loggedInUser");

if (currentUser && !sessionStorage.getItem("justLoggedOut")) {
    window.location.href = "dashboard.html";
}

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

    if (!username || !password) return alert("Fill all fields");

    if (localStorage.getItem(username)) {
        return alert("User already exists");
    }

    localStorage.setItem(username, JSON.stringify({ username, password }));

    alert("Account created!");

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

    const user = JSON.parse(localStorage.getItem(username));

    if (!user) return alert("User not found");

    if (user.password === password) {
        localStorage.setItem("loggedInUser", username);
        sessionStorage.removeItem("justLoggedOut");
        window.location.href = "dashboard.html";
    } else {
        alert("Wrong password");
    }
});