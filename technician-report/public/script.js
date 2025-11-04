// ========== Authentication Check ==========
async function checkAuth() {
  try {
    const res = await fetch("/api/auth/check");
    const data = await res.json();
    
    if (!data.authenticated) {
      window.location.href = "login.html";
      return false;
    }
    
    // Display username
    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay) {
      userDisplay.textContent = `Welcome, ${data.username}`;
    }
    
    return true;
  } catch (error) {
    window.location.href = "login.html";
    return false;
  }
}

// ========== Logout Handler ==========
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "login.html";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "login.html";
    }
  });
}

// ========== Technician Report Form Handler ==========
document.getElementById("reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    location: document.getElementById("location").value.trim(),
    date: document.getElementById("date").value,
    machineNumber: document.getElementById("machineNumber").value.trim(),
    technicianName: document.getElementById("technicianName").value.trim(),
    problemSolved: document.getElementById("problemSolved").value.trim()
  };

  try {
    const res = await fetch("/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (res.status === 401) {
      alert("Session expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }

    const result = await res.json();
    alert(result.message);
    document.getElementById("reportForm").reset();
  } catch (error) {
    alert("❌ Error saving report. Please try again.");
    console.error(error);
  }
});

// ========== Dark Mode Toggle with Smooth Fade ==========
const toggleButton = document.getElementById("themeToggle");

// Auto-detect system preference (only first time)
if (!localStorage.getItem("theme")) {
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  }
}

// Apply saved theme on load
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  toggleButton.textContent = "☀️ Light Mode";
} else {
  toggleButton.textContent = "🌙 Dark Mode";
}

// Toggle theme with smooth fade
toggleButton.addEventListener("click", () => {
  document.body.classList.add("fade-theme");

  setTimeout(() => {
    document.body.classList.toggle("dark-mode");
    const darkMode = document.body.classList.contains("dark-mode");

    toggleButton.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("theme", darkMode ? "dark" : "light");

    document.body.classList.remove("fade-theme");
  }, 150);
});

// Check auth on page load
checkAuth();
