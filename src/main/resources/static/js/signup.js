document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value; // WORKER / CITIZEN

  try {
    const response = await cwApi.postJson("/auth/signup", { username, email, password, role }, { auth: false, raw: true });

    if (!response.ok) {
      showError("Signup failed. Email may already exist or request already pending.");
      return;
    }

    if (role === "WORKER") {
      alert("Worker account request submitted. An administrator will approve it before you can log in.");
    } else {
      alert("Signup successful. Please login.");
    }
    window.location.href = "/login.html";

  } catch (err) {
    showError("Network error. Please try again.");
  }
});

function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.classList.add("show");
}
