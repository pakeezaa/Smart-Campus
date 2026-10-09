"use strict";
// Shared code: layout, theme, toast, helpers, and the home/schedule pages
const NAV_LINKS = [["index.html","Home"],["courses.html","Courses"],["schedule.html","Schedule"],["tasks.html","Tasks"],["profile.html","Profile"]];
const TASK_KEY = "portalTasks", THEME_KEY = "portalTheme";

function loadTasks() { try { return JSON.parse(localStorage.getItem(TASK_KEY)) || []; } catch { return []; } }
function saveTasks(tasks) { localStorage.setItem(TASK_KEY, JSON.stringify(tasks)); }
function escapeHTML(text) {
  return text.replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function showToast(message, type = "success") {
  let toast = document.getElementById("toast");
  if (!toast) { toast = document.createElement("div"); toast.id = "toast"; toast.setAttribute("role","status"); document.body.appendChild(toast); }
  toast.textContent = message; toast.className = "show " + type;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.className = "", 2800);
}
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  const btn = document.getElementById("themeBtn");
  if (btn) btn.textContent = theme === "dark" ? "☀ Light" : "☾ Dark";
}
function renderLayout() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.getElementById("site-header").innerHTML = `<div class="bar">
    <a class="logo" href="index.html">Smart<span>Campus</span></a>
    <button id="menuBtn" class="btn ghost" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav id="nav" aria-label="Main">${NAV_LINKS.map(([href,label]) => `<a href="${href}" class="${href === page ? "active" : ""}">${label}</a>`).join("")}
    <button id="themeBtn" class="btn ghost" type="button"></button></nav></div>`;
  document.getElementById("site-footer").innerHTML = `<p><b>SmartCampus Student Portal</b> · Help desk: portal@university.edu.pk · Mon–Fri, 9 AM–5 PM</p><p>&copy; 2026 University Student Portal prototype</p>`;
  applyTheme(localStorage.getItem(THEME_KEY) || "light");
  document.getElementById("themeBtn").addEventListener("click", () => {
    const next = document.body.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next); applyTheme(next);
  });
  const menuBtn = document.getElementById("menuBtn"), nav = document.getElementById("nav");
  menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", nav.classList.toggle("open")));
}
function renderDashboard() {
  const grid = document.getElementById("statGrid"); if (!grid) return;
  const enrolled = COURSES.filter(c => c.status === "Enrolled");
  const attendance = Math.round(enrolled.reduce((sum, c) => sum + c.attendance, 0) / enrolled.length);
  const pendingTasks = loadTasks().filter(t => !t.done).length;
  const stats = [["Registered courses", enrolled.length],["Completed courses", COURSES.filter(c => c.status === "Completed").length],
    ["Current semester", CURRENT_SEMESTER],["Attendance", attendance + "%"],["Pending assignments", pendingTasks],["Upcoming events", EVENTS.length]];
  grid.innerHTML = stats.map(([label, value]) => `<div class="card stat"><b>${value}</b>${label}</div>`).join("");
}
function renderAnnouncements() {
  const list = document.getElementById("annList"), bar = document.getElementById("annFilters"); if (!list) return;
  const categories = ["All", ...new Set(ANNOUNCEMENTS.map(a => a.category))];
  bar.innerHTML = categories.map((c, i) => `<button class="chip${i === 0 ? " active" : ""}" data-cat="${c}">${c}</button>`).join("");
  const draw = cat => {
    list.innerHTML = ANNOUNCEMENTS.filter(a => cat === "All" || a.category === cat)
      .map(a => `<article class="card"><span class="tag">${a.category}</span><h3>${a.title}</h3><p>${a.description}</p><small>${a.date}</small></article>`).join("");
  };
  bar.addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn) return;
    bar.querySelectorAll(".chip").forEach(chip => chip.classList.toggle("active", chip === btn));
    draw(btn.dataset.cat);
  });
  draw("All");
}
function renderEvents() {
  const list = document.getElementById("eventList"); if (!list) return;
  list.innerHTML = EVENTS.map(ev => `<div class="card"><h3>${ev.name}</h3><p>${ev.date}</p><small>${ev.place}</small></div>`).join("");
}
function renderSchedule() {
  const body = document.getElementById("scheduleBody"); if (!body) return;
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const sorted = [...SCHEDULE].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day) || a.start.localeCompare(b.start));
  body.innerHTML = sorted.map(s => `<tr><td data-label="Day">${s.day}</td><td data-label="Course">${s.course}</td><td data-label="Instructor">${s.instructor}</td>
    <td data-label="Time">${s.start} – ${s.end}</td><td data-label="Room">${s.room}</td></tr>`).join("");
}
document.addEventListener("DOMContentLoaded", () => {
  renderLayout(); renderDashboard(); renderAnnouncements(); renderEvents(); renderSchedule();
});
