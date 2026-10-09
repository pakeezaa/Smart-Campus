"use strict";
// Faculty tools: dashboard, post assignments, grade submissions, gradebook
const myAssignments = () => loadAssignments().filter(a => courseTeaching().some(c => c.code === a.course)).sort((a, b) => a.due.localeCompare(b.due));
const submissionsFor = id => loadSubmissions().filter(s => s.assignmentId === id);
const enrolledStudents = code => STUDENTS.filter(s => enrolledIds(code).includes(s.id));

function facultyDashboard() {
  if (!$("facStats")) return;
  $("greeting").textContent = greetingText();
  const asgs = myAssignments(), ids = asgs.map(a => a.id), subs = loadSubmissions().filter(s => ids.includes(s.assignmentId));
  const queue = subs.filter(s => s.marks === null);
  const stat = (ic, label, value) => `<div class="card stat"><span class="tile">${icon(ic, 24)}</span><div><small>${label}</small><b>${value}</b></div></div>`;
  $("facStats").innerHTML = stat("book", "Courses Teaching", courseTeaching().length) + stat("file", "Assignments Posted", asgs.length)
    + stat("pencil", "Awaiting Grading", queue.length) + stat("checkCircle", "Graded", subs.length - queue.length)
    + `<a class="card stat" href="courses.html"><span class="tile">${icon("user", 24)}</span><div><small>Enrollment Requests</small><b>${loadEnrollments().filter(e => e.status === "Pending" && courseTeaching().some(c => c.code === e.course)).length}</b></div></a>`;
  $("gradeQueue").innerHTML = queue.length ? queue.slice(0, 5).map(s => {
    const a = asgs.find(x => x.id === s.assignmentId);
    return `<a class="row" href="faculty-grading.html?a=${a.id}"><span class="dot"></span><div class="grow"><b>${studentName(s.studentId)}</b>
      <small>${escapeHTML(a.title)} · ${fmtDate(s.submittedOn)}</small></div><span class="tag Submitted">Grade</span></a>`;
  }).join("") : `<p class="empty">All caught up. Nothing to grade.</p>`;
  $("facClasses").innerHTML = classRows(nextClasses(3, FACULTY.name));
}

function assignmentsPage() {
  const form = $("asgForm"); if (!form) return;
  courseTeaching().forEach(c => $("asgCourse").add(new Option(`${c.code} · ${c.name}`, c.code)));
  const draw = () => {
    $("asgPosted").innerHTML = myAssignments().map(a => {
      const subs = submissionsFor(a.id), graded = subs.filter(s => s.marks !== null).length, n = enrolledStudents(a.course).length || 1;
      return `<article class="card static"><div class="asg-top"><div><small>${a.course} · Due ${fmtDate(a.due)} · ${a.total} marks</small><h3>${escapeHTML(a.title)}</h3><small>${fileLink(a.file)}</small></div>
        <div style="display:flex;gap:8px;align-items:center"><a class="btn sm" href="faculty-grading.html?a=${a.id}">Grade</a>
        <button class="icon-btn danger" data-del="${a.id}" aria-label="Delete assignment">${icon("trash", 18)}</button></div></div>
        <div class="progress"><i style="width:${Math.min(100, subs.length / n * 100)}%"></i></div>
        <small>${subs.length} of ${enrolledStudents(a.course).length} submitted · ${graded} graded</small></article>`;
    }).join("") || `<p class="empty">No assignments posted yet.</p>`;
  };
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const title = $("asgTitle").value.trim(), due = $("asgDue").value, total = Number($("asgTotal").value);
    const error = !title ? "Please enter an assignment title." : !due ? "Please choose a due date." : !(total >= 1 && total <= 100) ? "Total marks must be between 1 and 100." : "";
    $("asgError").textContent = error;
    if (error) { showToast("Assignment not posted", "error"); return; }
    const file = await readFile($("asgFile")); if (file === false) return;
    const all = loadAssignments();
    all.push({ id: Date.now(), title, course: $("asgCourse").value, due, total, file, description: $("asgDesc").value.trim() || "No description provided.", postedBy: FACULTY.name });
    saveAssignments(all); form.reset(); draw(); showToast("Assignment posted successfully");
  });
  $("asgPosted").addEventListener("click", e => {
    const btn = e.target.closest("[data-del]"); if (!btn) return;
    if (!confirm("Delete this assignment and all its submissions?")) return;
    const id = Number(btn.dataset.del);
    saveAssignments(loadAssignments().filter(a => a.id !== id)); saveSubmissions(loadSubmissions().filter(s => s.assignmentId !== id));
    draw(); showToast("Assignment deleted");
  });
  draw();
}

function gradingPage() {
  const select = $("gradeAsg"); if (!select) return;
  const asgs = myAssignments();
  if (!asgs.length) { $("gradeInfo").textContent = "Post an assignment first."; return; }
  asgs.forEach(a => select.add(new Option(`${a.course} · ${a.title}`, a.id)));
  const wanted = Number(new URLSearchParams(location.search).get("a"));
  if (asgs.some(a => a.id === wanted)) select.value = wanted;
  const draw = () => {
    const a = asgs.find(x => x.id === Number(select.value)), subs = submissionsFor(a.id);
    $("gradeInfo").textContent = `${a.total} marks · Due ${fmtDate(a.due)} · ${subs.length} of ${enrolledStudents(a.course).length} submitted`;
    $("gradeBody").innerHTML = enrolledStudents(a.course).map(st => {
      const s = subs.find(x => x.studentId === st.id), who = `<td data-label="Student"><b>${st.name}</b><br><small>${st.id}</small></td>`;
      if (!s) return `<tr>${who}<td data-label="Status"><span class="tag Pending">Not submitted</span></td><td data-label="Work">–</td><td data-label="Marks">–</td><td data-label="Feedback">–</td><td></td></tr>`;
      const late = s.submittedOn > a.due;
      return `<tr data-id="${s.id}">${who}<td data-label="Status"><span class="tag ${s.marks === null ? "Submitted" : passFail(s.marks / a.total * 100)}">${s.marks === null ? "Submitted" : passFail(s.marks / a.total * 100)}</span>${late ? ' <span class="tag Overdue">Late</span>' : ""}<br><small>${fmtDate(s.submittedOn)}</small></td>
        <td data-label="Work" class="work">${escapeHTML(s.text)} ${fileLink(s.file)}</td>
        <td data-label="Marks"><input class="mark-in" type="number" min="0" max="${a.total}" value="${s.marks ?? ""}" aria-label="Marks for ${st.name}"> <small>/ ${a.total}</small></td>
        <td data-label="Feedback"><input type="text" value="${escapeHTML(s.feedback)}" placeholder="Optional feedback" aria-label="Feedback for ${st.name}"></td>
        <td><button class="btn sm" data-save>Save</button></td></tr>`;
    }).join("");
  };
  $("gradeBody").addEventListener("click", e => {
    const btn = e.target.closest("[data-save]"); if (!btn) return;
    const row = btn.closest("tr"), a = asgs.find(x => x.id === Number(select.value));
    const raw = row.querySelector('input[type="number"]').value, marks = Number(raw);
    if (raw === "" || !(marks >= 0 && marks <= a.total)) { showToast(`Enter marks between 0 and ${a.total}.`, "error"); return; }
    const subs = loadSubmissions(), s = subs.find(x => x.id === Number(row.dataset.id));
    s.marks = marks; s.feedback = row.querySelector('input[type="text"]').value.trim();
    saveSubmissions(subs); draw(); showToast(`Marks saved for ${studentName(s.studentId)}`);
  });
  select.addEventListener("change", draw);
  draw();
}

function gradebookPage() {
  const body = $("gradebookBody"); if (!body) return;
  const asgs = myAssignments(), subs = loadSubmissions(), rows = [];
  $("gradebookHead").innerHTML = `<tr><th>Student</th>${asgs.map(a => `<th>${a.course} · ${escapeHTML(a.title)} (${a.total})</th>`).join("")}<th>Total</th><th>Grade</th></tr>`;
  const inClass = STUDENTS.filter(st => courseTeaching().some(c => enrolledIds(c.code).includes(st.id)));
  body.innerHTML = inClass.map(st => {
    let earned = 0, possible = 0;
    const cells = asgs.map(a => {
      const s = subs.find(x => x.assignmentId === a.id && x.studentId === st.id);
      if (s && s.marks !== null) { earned += s.marks; possible += a.total; return s.marks; }
      return s ? "Pending" : "–";
    });
    const pct = possible ? Math.round(earned / possible * 100) : null, grade = pct === null ? "–" : gradeLetter(pct);
    rows.push([st.name, st.id, ...cells, pct === null ? "" : pct + "%", grade]);
    return `<tr><td data-label="Student"><b>${st.name}</b> <small>${st.id}</small></td>${cells.map((c, i) => `<td data-label="${escapeHTML(asgs[i].title)}">${c}</td>`).join("")}
      <td data-label="Total">${pct === null ? "–" : pct + "%"}</td><td data-label="Grade"><b>${grade}</b></td></tr>`;
  }).join("");
  $("exportBtn").addEventListener("click", () => {
    const csv = [["Student", "ID", ...asgs.map(a => a.title), "Percent", "Grade"], ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "gradebook.csv"; link.click();
    showToast("Gradebook exported");
  });
}
facultyDashboard(); assignmentsPage(); gradingPage(); gradebookPage();
