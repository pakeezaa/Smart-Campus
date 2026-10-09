"use strict";
// Task manager: add, complete, delete; saved in localStorage
const taskForm = document.getElementById("taskForm"), taskList = document.getElementById("taskList"), taskError = document.getElementById("taskError");
let tasks = loadTasks();
COURSES.filter(c => c.status !== "Completed").forEach(c => document.getElementById("taskCourse").add(new Option(c.code + " · " + c.name, c.code)));

function renderTasks() {
  if (!tasks.length) { taskList.innerHTML = `<p class="empty">No tasks yet. Add your first task above.</p>`; return; }
  taskList.innerHTML = tasks.map(t => `<div class="card static task ${t.done ? "done" : ""}">
    <button class="check" role="checkbox" aria-checked="${t.done}" aria-label="Mark task complete" data-action="toggle" data-id="${t.id}">${t.done ? icon("check", 16) : ""}</button>
    <b class="title">${escapeHTML(t.title)}</b><small class="code">${escapeHTML(t.course)}</small><small class="due">${fmtDate(t.due)}</small>
    <span class="tag ${t.priority}">${t.priority}</span>
    <button class="icon-btn danger" aria-label="Delete task" data-action="delete" data-id="${t.id}">${icon("trash", 18)}</button></div>`).join("");
}
taskForm.addEventListener("submit", e => {
  e.preventDefault();
  const title = document.getElementById("taskTitle").value.trim(), due = document.getElementById("taskDue").value;
  if (!title || !due) { taskError.textContent = "Please enter a task title and a due date."; showToast("Task not added", "error"); return; }
  taskError.textContent = "";
  tasks.unshift({ id: Date.now(), title, course: document.getElementById("taskCourse").value, due, priority: document.getElementById("taskPriority").value, done: false });
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
