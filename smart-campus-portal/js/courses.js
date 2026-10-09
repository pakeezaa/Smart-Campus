"use strict";
// Course cards, search and filters
const searchInput = document.getElementById("search"), semesterSelect = document.getElementById("semester"),
      statusSelect = document.getElementById("status"), courseGrid = document.getElementById("courseGrid"),
      resultCount = document.getElementById("resultCount");

function courseCard(c) {
  return `<article class="card"><span class="tag ${c.status}">${c.status}</span><h3>${c.name}</h3>
    <p class="muted">${c.code} · Semester ${c.semester}</p><p>${c.instructor}</p><small>${c.credits} credit hours</small></article>`;
}
function renderCourses() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = COURSES.filter(c =>
    (c.name + " " + c.code).toLowerCase().includes(query) &&
    (semesterSelect.value === "all" || String(c.semester) === semesterSelect.value) &&
    (statusSelect.value === "all" || c.status === statusSelect.value));
  courseGrid.innerHTML = matches.length ? matches.map(courseCard).join("") : `<p class="empty">No matching course found.</p>`;
  resultCount.textContent = `${matches.length} of ${COURSES.length} courses shown`;
}
[...new Set(COURSES.map(c => c.semester))].sort().forEach(s => semesterSelect.add(new Option("Semester " + s, s)));
[searchInput, semesterSelect, statusSelect].forEach(el => el.addEventListener("input", renderCourses));
renderCourses();
