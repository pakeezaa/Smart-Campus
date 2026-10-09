"use strict";
// Shared code: icons, role guard, storage helpers, layout (landing nav or sidebar), theme, dashboard, notices, schedule
const ICONS = {
  cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5M22 10v6"/>',
  home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  book: '<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/>',
  moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chart: '<path d="M3 3v18h18"/><path d="M8 17v-6M13 17V7M18 17v-3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'
};
const icon = (name, size = 20) => `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const $ = id => document.getElementById(id);
const STUDENT_NAV = [["dashboard.html", "Home", "home"], ["courses.html", "Courses", "book"], ["schedule.html", "Schedule", "calendar"], ["assignments.html", "Assignments", "file"], ["tasks.html", "My Tasks", "checkCircle"], ["announcements.html", "Notices", "bell"], ["profile.html", "Profile", "user"]];
const FACULTY_NAV = [["faculty.html", "Dashboard", "home"], ["courses.html", "Courses", "book"], ["schedule.html", "Schedule", "calendar"], ["faculty-assignments.html", "Assignments", "file"], ["faculty-grading.html", "Grading", "pencil"], ["faculty-gradebook.html", "Gradebook", "chart"], ["announcements.html", "Notices", "bell"], ["profile.html", "Profile", "user"]];
const KEYS = { role: "portalRole", user: "portalUser", theme: "portalTheme", profile: "portalProfile_" + ME_ID, tasks: "portalTasks_" + ME_ID, asg: "portalAssignments", sub: "portalSubmissions", notice: "portalNotices", enr: "portalEnrollments" };
const ROLE = localStorage.getItem(KEYS.role);

// Route guard: each page declares which role may open it
(() => {
  const need = document.body.dataset.role; if (!need) return;
  if (!ROLE) location.replace("login.html");
  else if (need !== "any" && need !== ROLE) location.replace(ROLE === "faculty" ? "faculty.html" : "dashboard.html");
})();

function readStore(key, seed) {
  const raw = localStorage.getItem(key);
  if (raw === null) { localStorage.setItem(key, JSON.stringify(seed)); return JSON.parse(JSON.stringify(seed)); }  // first visit: demo data
  try { return JSON.parse(raw) || []; } catch { return []; }
}
function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { showToast("Browser storage is full. Try a smaller file.", "error"); }
}
const loadTasks = () => readStore(KEYS.tasks, SEED_TASKS), saveTasks = t => writeStore(KEYS.tasks, t);
const loadAssignments = () => readStore(KEYS.asg, SEED_ASSIGNMENTS), saveAssignments = a => writeStore(KEYS.asg, a);
const loadSubmissions = () => readStore(KEYS.sub, SEED_SUBMISSIONS), saveSubmissions = s => writeStore(KEYS.sub, s);
const loadNotices = () => readStore(KEYS.notice, ANNOUNCEMENTS), saveNotices = n => writeStore(KEYS.notice, n);
const loadEnrollments = () => readStore(KEYS.enr, SEED_ENROLLMENTS), saveEnrollments = e => writeStore(KEYS.enr, e);
const enrollment = (studentId, course) => loadEnrollments().find(e => e.studentId === studentId && e.course === course);
const enrolledIds = course => loadEnrollments().filter(e => e.course === course && e.status === "Approved").map(e => e.studentId);
const myCourses = () => COURSES.filter(c => (enrollment(ME_ID, c.code) || {}).status === "Approved");
const passFail = pct => pct >= 50 ? "Pass" : "Fail";
// Upload helper: resolves {name, data}, null (no file) or false (rejected file). Files are kept in localStorage.
const readFile = input => new Promise(done => {
  const f = input.files[0]; if (!f) return done(null);
  if (!/\.(pdf|docx?)$/i.test(f.name)) { showToast("Only PDF or Word files are allowed.", "error"); return done(false); }
  if (f.size > 1.5e6) { showToast("File must be under 1.5 MB.", "error"); return done(false); }
  const reader = new FileReader(); reader.onload = () => done({ name: f.name, data: reader.result }); reader.readAsDataURL(f);
});
const fileLink = f => f ? `<a href="${f.data}" download="${escapeHTML(f.name)}">📎 ${escapeHTML(f.name)}</a>` : "";
function loadProfile() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEYS.profile)) || {}; } catch { }
  const account = ACCOUNTS.find(a => a.id.toLowerCase() === String(USER || "").toLowerCase() && a.role === ROLE);
  if (account) {
    return {
      fullName: account.name || (ROLE === "faculty" ? "Faculty" : studentName(ME_ID)),
      email: account.email || "",
      department: account.department || "Computer Science",
      phone: account.phone || "",
      semester: account.semester || "",
      ...saved
    };
  }
  return { fullName: ROLE === "faculty" ? "Faculty" : studentName(ME_ID), department: "Computer Science", ...saved };
}
const studentName = id => (STUDENTS.find(s => s.id === id) || { name: id }).name;
const gradeLetter = pct => pct >= 85 ? "A" : pct >= 70 ? "B" : pct >= 60 ? "C" : pct >= 50 ? "D" : "F";
const todayISO = () => new Date().toISOString().slice(0, 10);
const courseTeaching = () => COURSES.filter(c => c.instructor === FACULTY.name && c.status !== "Completed");
const currentName = () => ROLE === "faculty" ? (loadProfile().fullName || FACULTY.name) : loadProfile().fullName;
const initials = name => name.replace(/^(Dr|Mr|Ms|Mrs)\.?\s+/, "").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
const shortName = name => name.startsWith("Dr.") ? name.split(" ").slice(0, 2).join(" ") : name.split(" ")[0];
const escapeHTML = text => String(text).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const fmtDate = iso => new Date(iso + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
function greetingText() { const h = new Date().getHours(); return `Good ${h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening"}, ${shortName(currentName())}!`; }

function showToast(message, type = "success") {
  let toast = $("toast");
  if (!toast) { toast = document.createElement("div"); toast.id = "toast"; toast.setAttribute("role", "status"); document.body.appendChild(toast); }
  toast.textContent = message; toast.className = "show " + type;
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.className = "", 2800);
}
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  document.querySelectorAll(".themeBtn").forEach(b => b.innerHTML = icon(theme === "dark" ? "sun" : "moon"));
}
function bindTheme() {
  applyTheme(localStorage.getItem(KEYS.theme) || "light");
  document.querySelectorAll(".themeBtn").forEach(btn => btn.addEventListener("click", () => {
    const next = document.body.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem(KEYS.theme, next); applyTheme(next);
  }));
}
function renderUser() {
  const name = currentName();
  if ($("avatar")) $("avatar").textContent = initials(name);
  if ($("userName")) $("userName").textContent = shortName(name);
}
function renderLayout() {
  const page = location.pathname.split("/").pop() || "index.html";
  const themeBtn = `<button class="icon-btn themeBtn" type="button" aria-label="Switch light or dark mode"></button>`;
  if (document.body.dataset.layout === "landing") {
    const nav = $("topnav"), home = ROLE === "faculty" ? "faculty.html" : "dashboard.html";
    nav.innerHTML = `<div class="wrap nav-in"><a class="brand" href="index.html">${icon("cap", 28)}<span>Smart Campus</span></a>
      <nav class="links" aria-label="Main"><a href="index.html">Home</a><a href="courses.html">Courses</a><a href="index.html#events">Events</a><a href="index.html#about">About</a></nav>
      ${themeBtn}<a class="btn" href="${ROLE ? home : "login.html"}">${ROLE ? "Dashboard" : "Login"}</a>
      <button id="menuBtn" class="icon-btn mobile-only" aria-label="Open menu">${icon("menu")}</button></div>`;
    $("menuBtn").addEventListener("click", () => nav.classList.toggle("open"));
    if (ROLE === "faculty") document.querySelectorAll("[data-fac]").forEach(a => a.href = a.dataset.fac);
  } else {
    const links = ROLE === "faculty" ? FACULTY_NAV : STUDENT_NAV;
    $("sidebar").innerHTML = `<a class="brand" href="index.html">${icon("cap", 28)}<span>Smart Campus</span></a>
      <nav class="nav" aria-label="Main">${links.map(([href, label, ic]) => `<a href="${href}" class="${href === page ? "active" : ""}">${icon(ic)}${label}</a>`).join("")}</nav>
      <button class="nav-btn" id="logoutBtn" type="button">${icon("logout")}Log out</button>`;
    $("topbar").innerHTML = `<button id="menuBtn" class="icon-btn mobile-only" aria-label="Open menu">${icon("menu")}</button>
      <form class="search" id="searchForm" role="search">${icon("search", 18)}<input id="globalSearch" type="search" placeholder="Search courses..." aria-label="Search courses"></form>
      <div class="top-actions">${themeBtn}<a class="icon-btn" href="announcements.html" aria-label="Notices">${icon("bell")}</a>
      <div class="user-chip"><span class="avatar" id="avatar"></span><span id="userName"></span></div></div>`;
    const scrim = document.createElement("div"); scrim.className = "scrim"; document.body.appendChild(scrim);
    const setMenu = open => { $("sidebar").classList.toggle("open", open); scrim.classList.toggle("show", open); };
    $("menuBtn").addEventListener("click", () => setMenu(true)); scrim.addEventListener("click", () => setMenu(false));
    $("searchForm").addEventListener("submit", e => { e.preventDefault(); location.href = "courses.html?q=" + encodeURIComponent($("globalSearch").value.trim()); });
    $("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem(KEYS.role);
      localStorage.removeItem(KEYS.user);
      location.href = "login.html";
    });
    renderUser();
  }
  document.querySelectorAll("[data-icon]").forEach(el => el.innerHTML = icon(el.dataset.icon, Number(el.dataset.size) || 22));
  bindTheme();
}
function scheduleForCurrentUser() {
  if (ROLE === "faculty") return SCHEDULE.filter(s => s.instructor === FACULTY.name);
  const approved = new Set(loadEnrollments().filter(e => e.studentId === ME_ID && e.status === "Approved").map(e => e.course));
  return SCHEDULE.filter(s => approved.has(s.code));
}
function nextClasses(count, instructor) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], now = new Date();
  return scheduleForCurrentUser().filter(s => !instructor || s.instructor === instructor).map(s => {
    const [h, m] = s.start.split(":").map(Number);
    const when = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (days.indexOf(s.day) - now.getDay() + 7) % 7, h, m);
    if (when < now) when.setDate(when.getDate() + 7);
    return { ...s, when };
  }).sort((a, b) => a.when - b.when).slice(0, count);
}
const classRows = list => list.map(s => `<a class="row" href="schedule.html"><span class="dot"></span>
  <div class="grow"><b>${s.course}</b><small>${s.day.slice(0, 3)}, ${s.start} – ${s.end} · ${s.room}</small></div></a>`).join("");
function renderDashboard() {
  const grid = $("statGrid"); if (!grid) return;
  $("greeting").textContent = greetingText();
  const mine = myCourses(), ongoing = mine.filter(c => c.status === "Ongoing");
  const attendance = ongoing.length ? Math.round(ongoing.reduce((sum, c) => sum + c.attendance, 0) / ongoing.length) : 0;
  const submitted = loadSubmissions().filter(s => s.studentId === ME_ID).map(s => s.assignmentId);
  const pending = loadAssignments().filter(a => mine.some(c => c.code === a.course) && !submitted.includes(a.id)).length;
  const stat = (ic, label, value, href) => `<a class="card stat" href="${href}"><span class="tile">${icon(ic, 24)}</span><div><small>${label}</small><b>${value}</b></div></a>`;
  grid.innerHTML = stat("book", "Registered Courses", mine.filter(c => c.status !== "Completed").length, "courses.html")
    + stat("checkCircle", "Completed Courses", mine.filter(c => c.status === "Completed").length, "courses.html")
    + stat("calendar", "Current Semester", TERM.name, "schedule.html")
    + `<a class="card stat" href="courses.html"><div class="ring" style="--p:${attendance}"><span>${attendance}%</span></div><div><small>Attendance</small></div></a>`
    + stat("file", "Pending Assignments", pending, "assignments.html") + stat("bell", "Upcoming Events", EVENTS.length, "announcements.html");
  $("classList").innerHTML = classRows(nextClasses(3));
}
function renderEvents() {
  const list = $("eventList"); if (!list) return;
  list.innerHTML = EVENTS.map(ev => `<a class="row" href="announcements.html"><span class="tile">${icon("calendar")}</span><div class="grow"><b>${ev.name}</b><small>${fmtDate(ev.date)}</small></div>${icon("arrow", 18)}</a>`).join("");
}
let noticeCategory = "All";
function drawNotices() {
  const list = $("annList"), limit = Number(list.dataset.limit) || Infinity, detailed = !!$("annFilters");
  const shown = loadNotices().filter(a => noticeCategory === "All" || a.category === noticeCategory).sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
  list.innerHTML = shown.length ? shown.map(a => `<${detailed ? "div" : 'a href="announcements.html"'} class="row"><span class="dot cat-${a.category}"></span>
    <div class="grow"><b>${escapeHTML(a.title)}</b>${detailed ? `<small>${a.category}${a.description ? " · " + escapeHTML(a.description) : ""}</small>` : ""}</div><small class="date">${fmtDate(a.date)}</small></${detailed ? "div" : "a"}>`).join("")
    : `<p class="empty">No announcements in this category.</p>`;
}
function renderAnnouncements() {
  if (!$("annList")) return;
  const bar = $("annFilters");
  if (bar) {
    bar.innerHTML = ["All", "Academic", "Examination", "Event", "General"].map((c, i) => `<button class="chip${i ? "" : " active"}" data-cat="${c}">${c}</button>`).join("");
    bar.addEventListener("click", e => {
      const btn = e.target.closest("button"); if (!btn) return;
      bar.querySelectorAll(".chip").forEach(chip => chip.classList.toggle("active", chip === btn));
      noticeCategory = btn.dataset.cat; drawNotices();
    });
  }
  const form = $("noticeForm");
  if (form && ROLE === "faculty") {            // only faculty can post notices
    form.hidden = false;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const title = $("noticeTitle").value.trim();
      if (!title) { showToast("Please enter a notice title.", "error"); return; }
      const notices = loadNotices();
      notices.push({ title, description: $("noticeDesc").value.trim(), date: todayISO(), category: $("noticeCat").value });
      saveNotices(notices); form.reset(); drawNotices(); showToast("Notice posted successfully");
    });
  }
  drawNotices();
}
function renderSchedule() {
  const body = $("scheduleBody"); if (!body) return;
  const rows = scheduleForCurrentUser();
  body.innerHTML = rows.map(s => `<tr><td data-label="Course"><b>${s.code}</b> <small>${s.course}</small></td><td data-label="Instructor">${s.instructor}</td>
    <td data-label="Day">${s.day.slice(0, 3)}</td><td data-label="Time">${s.start} – ${s.end}</td><td data-label="Room">${s.room}</td></tr>`).join("");
}
document.addEventListener("DOMContentLoaded", () => { renderLayout(); renderDashboard(); renderEvents(); renderAnnouncements(); renderSchedule(); });
