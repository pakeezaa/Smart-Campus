"use strict";
// Courses: students request/drop enrollment; faculty approve requests and see enrolled students
const isFac = ROLE === "faculty", open = new Set();
const CATALOG = isFac ? COURSES.filter(c => c.instructor === FACULTY.name) : COURSES;
const searchBox = $("search"), semesterSelect = $("semester"), statusSelect = $("status"), courseGrid = $("courseGrid"), tabs = $("courseTabs");
let tab = "mine";
const nameOf = id => (STUDENTS.find(s => s.id === id) || { name: id }).name;
const canDrop = c => c.status !== "Completed" && todayISO() <= TERM.dropBy;

function studentAction(c) {
  const e = enrollment(ME_ID, c.code), btn = (act, label) => `<button class="btn sm" data-act="${act}" data-code="${c.code}">${label}</button>`;
  if (e && e.status === "Approved") return c.status === "Completed" ? `<span class="tag Approved">Enrolled</span>`
    : canDrop(c) ? btn("drop", "Drop course") + `<small>Drop by ${fmtDate(TERM.dropBy)}</small>` : `<small>Drop deadline passed</small>`;
  if (e && e.status === "Pending") return `<span class="tag Pending">Request pending</span>` + btn("drop", "Cancel");
  if (c.status === "Completed") return "";
  return (e ? `<span class="tag Rejected">Declined</span>` : "") + btn("req", e ? "Request again" : "Request enrollment");
}
function facultyPanel(c) {
  const all = loadEnrollments().filter(e => e.course === c.code), ok = all.filter(e => e.status === "Approved"), wait = all.filter(e => e.status === "Pending");
  const pend = wait.map(e => `<div class="sub-row"><span class="grow">${nameOf(e.studentId)} <small>${e.studentId}</small></span>
    <button class="btn sm" data-act="approve" data-id="${e.id}">Approve</button><button class="btn sm" data-act="reject" data-id="${e.id}">Reject</button></div>`).join("");
  return `<details ${open.has(c.code) ? "open" : ""}><summary>${ok.length} enrolled · ${wait.length} pending</summary>${pend}
    ${ok.map(e => `<div class="sub-row"><span class="dot"></span>${nameOf(e.studentId)} <small>${e.studentId}</small></div>`).join("") || `<p class="small">No enrolled students yet.</p>`}</details>`;
}
function courseCard(c) {
  return `<article class="card course"><span class="tile">${icon("book", 24)}</span><div class="grow">
    <small>${c.code}</small><h3>${c.name}</h3><small>${c.instructor}</small>
    <div class="meta"><small>${c.credits} credits · ${c.semester}</small><span class="tag ${c.status}">${c.status}</span></div>
    ${isFac ? facultyPanel(c) : `<div class="meta">${studentAction(c)}</div>`}</div></article>`;
}
function renderCourses() {
  const query = searchBox.value.trim().toLowerCase();
  const matches = CATALOG.filter(c => (c.name + " " + c.code).toLowerCase().includes(query)
    && (isFac || tab === "all" || (enrollment(ME_ID, c.code) || {}).status === "Approved")
    && (semesterSelect.value === "all" || c.semester === semesterSelect.value)
    && (statusSelect.value === "all" || c.status === statusSelect.value));
  courseGrid.innerHTML = matches.length ? matches.map(courseCard).join("") : `<p class="empty">No matching course found.</p>`;
}
if (isFac) { tabs.hidden = true; $("pageTitle").textContent = "My Courses"; }
else {
  $("pageTitle").textContent = "Courses";
  tabs.innerHTML = `<button class="chip active" data-tab="mine">My Enrolled Courses</button><button class="chip" data-tab="all">All Courses</button>`;
  tabs.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    tab = b.dataset.tab; tabs.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === b)); renderCourses();
  });
}
courseGrid.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const act = b.dataset.act, list = loadEnrollments();
  if (act === "req") {
    const old = list.find(x => x.studentId === ME_ID && x.course === b.dataset.code);
    if (old) old.status = "Pending"; else list.push({ id: Date.now(), studentId: ME_ID, course: b.dataset.code, status: "Pending" });
    showToast("Request sent to the professor");
  } else if (act === "drop") {
    const c = COURSES.find(x => x.code === b.dataset.code);
    if (!canDrop(c)) { showToast("Drop deadline has passed.", "error"); return; }
    if (!confirm(`Drop ${c.code}?`)) return;
    list.splice(list.findIndex(x => x.studentId === ME_ID && x.course === c.code), 1); showToast("Course dropped");
  } else {
    const en = list.find(x => x.id === Number(b.dataset.id)); open.add(en.course);
    en.status = act === "approve" ? "Approved" : "Rejected"; showToast(`Request ${en.status.toLowerCase()}`);
  }
  saveEnrollments(list); renderCourses();
});
[...new Set(CATALOG.map(c => c.semester))].forEach(s => semesterSelect.add(new Option(s, s)));
searchBox.value = new URLSearchParams(location.search).get("q") || "";
[searchBox, semesterSelect, statusSelect].forEach(el => el.addEventListener("input", renderCourses));
renderCourses();
