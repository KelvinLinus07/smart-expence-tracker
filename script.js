// ==========================
// AUTO LOGIN (SESSION CHECK)
// ==========================
const currentUser = localStorage.getItem("loggedInUser");

if (currentUser) {
    window.location.href = "dashboard.html";
}


// ==========================
// SELECT ELEMENTS
// ==========================
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");


// ==========================
// TOGGLE FORMS
// ==========================
showSignup.addEventListener("click", () => {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
});

showLogin.addEventListener("click", () => {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
});


// ==========================
// SIGNUP LOGIC
// ==========================
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("signupUsername").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    if (username === "" || password === "") {
        alert("Please fill all fields!");
        return;
    }

    // Check if user exists
    if (localStorage.getItem(username)) {
        alert("User already exists! Please login.");
        return;
    }

    // Create user object
    const userData = {
        username: username,
        password: password,
        createdAt: new Date().toISOString()
    };

    // Save user
    localStorage.setItem(username, JSON.stringify(userData));

    alert("Account created successfully!");

    // Reset form
    signupForm.reset();

    // Switch to login
    signupForm.style.display = "none";
    loginForm.style.display = "block";
});


// ==========================
// LOGIN LOGIC
// ==========================
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const storedUser = JSON.parse(localStorage.getItem(username));

    if (!storedUser) {
        alert("User not found!");
        return;
    }

    if (storedUser.password === password) {
        alert("Login successful!");

        // Save session
        localStorage.setItem("loggedInUser", username);

        // Redirect to dashboard
        window.location.href = "dashboard.html";
    } else {
        alert("Incorrect password!");
    }
});