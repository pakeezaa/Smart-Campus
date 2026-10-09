"use strict";
// Task manager: add, complete, delete, saved in localStorage
const taskForm = document.getElementById("taskForm"), taskList = document.getElementById("taskList");
let tasks = loadTasks();

COURSES.filter(c => c.status === "Enrolled").forEach(c => document.getElementById("taskCourse").add(new Option(c.name, c.name)));

function renderTasks() {
  if (tasks.length === 0) { taskList.innerHTML = `<p class="empty">No tasks yet. Add your first task above.</p>`; return; }
  taskList.innerHTML = tasks.map(t => `<div class="card task pri-${t.priority} ${t.done ? "done" : ""}">
    <div><b class="title">${escapeHTML(t.title)}</b><br><small>${escapeHTML(t.course)} · Due ${t.due} · ${t.priority} priority</small></div>
    <div class="actions"><button class="btn ghost" data-action="toggle" data-id="${t.id}">${t.done ? "Undo" : "Complete"}</button>
    <button class="btn ghost" data-action="delete" data-id="${t.id}">Delete</button></div></div>`).join("");
}
taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value.trim(), due = document.getElementById("taskDue").value;
  if (!title || !due) { showToast("Please enter a task title and due date.", "error"); return; }
  tasks.push({id: Date.now(), title, course: document.getElementById("taskCourse").value, due, priority: document.getElementById("taskPriority").value, done: false});
  saveTasks(tasks); renderTasks(); taskForm.reset(); showToast("Task added successfully");
});
taskList.addEventListener("click", e => {
  const btn = e.target.closest("button"); if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === "toggle") {
    const task = tasks.find(t => t.id === id); task.done = !task.done;
    showToast(task.done ? "Task marked as completed" : "Task moved back to pending");
  } else { tasks = tasks.filter(t => t.id !== id); showToast("Task deleted"); }
  saveTasks(tasks); renderTasks();
});
renderTasks();
