// ========== Load Reports ==========
async function loadReports() {
  const res = await fetch("/reports");
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
}
window.onload = loadReports;

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
