document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await cwApi.postJson("/auth/login", { email, password }, { auth: false, raw: true });

    if (!response.ok) {
      showError("Invalid email or password");
      return;
    }

    const data = await response.json();

    // Save token
    localStorage.setItem("token", data.token);
    localStorage.setItem("email", email);

    // Decode role from JWT
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    const role = payload.role.replace("ROLE_", "");

    localStorage.setItem("role", role);

    // Redirect based on role
    if (role === "ADMIN") {
      window.location.href = "/admin-dashboard.html";
    } else if (role === "WORKER") {
      window.location.href = "/worker-dashboard.html";
    } else {
      window.location.href = "/citizen-dashboard.html";
    }

  } catch (err) {
    showError("Network error. Please try again.");
  }
});

function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.classList.add("show");
}
