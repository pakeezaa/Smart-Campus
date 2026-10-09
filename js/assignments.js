"use strict";
// Student: view assignments of enrolled courses, submit text and/or a PDF/Word file, see marks and Pass/Fail
const asgList = $("asgList");
function drawAssignments() {
  const mineCodes = myCourses().map(c => c.code), all = loadAssignments();
  const assignments = all.filter(a => mineCodes.includes(a.course)).sort((a, b) => a.due.localeCompare(b.due));
  const mine = loadSubmissions().filter(s => s.studentId === ME_ID && assignments.some(a => a.id === s.assignmentId));
  const graded = mine.filter(s => s.marks !== null);
  const earned = graded.reduce((sum, s) => sum + s.marks, 0), possible = graded.reduce((sum, s) => sum + all.find(a => a.id === s.assignmentId).total, 0);
  $("asgSummary").textContent = possible ? `Average: ${Math.round(earned / possible * 100)}% (Grade ${gradeLetter(earned / possible * 100)} · ${passFail(earned / possible * 100)})` : "No graded work yet.";
  asgList.innerHTML = assignments.map(a => {
    const s = mine.find(x => x.assignmentId === a.id), course = COURSES.find(c => c.code === a.course);
    const result = s && s.marks !== null ? passFail(s.marks / a.total * 100) : "";
    const status = result || (s ? "Submitted" : a.due < todayISO() ? "Overdue" : "Pending");
    const work = s ? `<p class="small">Your work: ${escapeHTML(s.text)} ${fileLink(s.file)}</p>` : "";
    const body = result
      ? `<p><b>${result}</b> · Grade ${gradeLetter(s.marks / a.total * 100)} · ${s.marks}/${a.total} marks</p><p class="small">Feedback: ${escapeHTML(s.feedback || "No feedback given.")}</p>${work}`
      : `<form class="sub-form" data-id="${a.id}"><label for="work${a.id}">Your answer or link</label><textarea id="work${a.id}">${s ? escapeHTML(s.text) : ""}</textarea>
        <label for="file${a.id}">Or upload a PDF / Word file</label><input id="file${a.id}" type="file" accept=".pdf,.doc,.docx">${s ? fileLink(s.file) : ""}
        <button class="btn sm" type="submit">${s ? "Update submission" : "Submit"}</button></form>`;
    return `<article class="card static"><div class="asg-top"><div><small>${a.course} · ${course ? course.name : ""}</small><h3>${escapeHTML(a.title)}</h3>
      <small>Due ${fmtDate(a.due)} · ${a.total} marks · ${a.postedBy}</small></div><span class="tag ${status}">${result ? `${result} · ${s.marks}/${a.total}` : status}</span></div>
      <p class="small" style="margin-top:8px">${escapeHTML(a.description)} ${fileLink(a.file)}</p>
      <details><summary>${result ? "View result" : s ? "View or edit submission" : "Submit work"}</summary>${body}</details></article>`;
  }).join("") || `<p class="empty">No assignments yet. Enroll in a course to see its assignments.</p>`;
}
asgList.addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target, id = Number(form.dataset.id), text = form.querySelector("textarea").value.trim(), file = await readFile(form.querySelector("input[type=file]"));
  if (file === false) return;
  const subs = loadSubmissions(), existing = subs.find(s => s.assignmentId === id && s.studentId === ME_ID);
  if (!text && !file && !(existing && existing.file)) { showToast("Write an answer or upload a file.", "error"); return; }
  if (existing) { existing.text = text; existing.submittedOn = todayISO(); if (file) existing.file = file; }
  else subs.push({ id: Date.now(), assignmentId: id, studentId: ME_ID, text, file, submittedOn: todayISO(), marks: null, feedback: "" });
  saveSubmissions(subs); drawAssignments(); showToast("Assignment submitted successfully");
});
drawAssignments();
