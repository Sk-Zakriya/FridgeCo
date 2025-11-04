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

// ========== Load Reports ==========
async function loadReports() {
  try {
    const res = await fetch("/reports");
    
    if (res.status === 401) {
      alert("Session expired. Please log in again.");
      window.location.href = "login.html";
      return;
    }
    
    const data = await res.json();

    const tbody = document.querySelector("#reportTable tbody");
    tbody.innerHTML = "";

    data.forEach(r => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td data-label="ID"><span>${r.id}</span></td>
        <td data-label="Location"><span>${r.location}</span></td>
        <td data-label="Date"><span>${r.date}</span></td>
        <td data-label="Machine #"><span>${r.machineNumber}</span></td>
        <td data-label="Technician"><span>${r.technicianName}</span></td>
        <td data-label="Problem Solved"><span>${r.problemSolved}</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading reports:", error);
    alert("Error loading reports. Please try again.");
  }
}

// ========== Dark Mode with Smooth Fade ==========
const toggleButton = document.getElementById("themeToggle");

if (!localStorage.getItem("theme")) {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  }
}
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  toggleButton.textContent = "☀️ Light Mode";
}

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

// Initialize page
window.onload = async () => {
  const authenticated = await checkAuth();
  if (authenticated) {
    await loadReports();
  }
};
