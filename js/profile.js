"use strict";

// Logged-in profile editor for both students and faculty.
// The profile is tied to the authenticated account in smartCampusUsers.
const form = document.getElementById("profileForm");
const accountId = localStorage.getItem("portalUser");
const role = localStorage.getItem("portalRole");

function accountsFromStorage() {
  try { return JSON.parse(localStorage.getItem("smartCampusUsers")) || []; } catch { return []; }
}
function saveAccounts(accounts) {
  localStorage.setItem("smartCampusUsers", JSON.stringify(accounts));
}
function currentAccount() {
  return accountsFromStorage().find(a => a.id.toLowerCase() === String(accountId || "").toLowerCase() && a.role === role);
}
async function hashProfilePassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const rules = {
  fullName: v => v.trim().length >= 3 ? "" : "Enter your full name (at least 3 characters).",
  regNo: v => /^[A-Za-z0-9_-]{4,20}$/.test(v) ? "" : "Enter a valid ID.",
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email address.",
  department: v => v ? "" : "Select your department.",
  semester: v => role === "faculty" || v ? "" : "Select your semester.",
  phone: v => !v || /^03\d{2}-?\d{7}$/.test(v) ? "" : "Enter a valid number like 0300-1234567.",
  password: v => !v || /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v) ? "" : "Use 8+ characters with a letter and a number.",
  confirm: v => !form.password.value || v === form.password.value ? "" : "Passwords do not match."
};

function validateField(id) {
  const input = document.getElementById(id);
  const error = document.getElementById(id + "Error");
  if (!input || !rules[id]) return true;
  const message = rules[id](input.value);
  if (error) error.textContent = message;
  input.classList.toggle("invalid", !!message);
  return !message;
}

function fillProfile(account) {
  if (!account) return;
  form.fullName.value = account.name || "";
  form.regNo.value = account.id || "";
  form.email.value = account.email || "";
  form.department.value = account.department || "";
  form.semester.value = account.semester || "";
  form.phone.value = account.phone || "";
  document.getElementById("profileName").textContent = account.name || "My Profile";
  document.getElementById("profileNote").textContent = `${account.role === "faculty" ? "Faculty" : "Student"} · ${account.department || ""}`;
  if (account.role === "faculty") {
    document.getElementById("profileTitle").textContent = "Faculty Profile";
    document.getElementById("profileSubtitle").textContent = "View and update your faculty account information.";
    document.getElementById("semester").closest("div").style.display = "none";
    document.getElementById("semesterError").textContent = "";
  }
}

if (form) {
  const account = currentAccount();
  if (!account) {
    location.replace("login.html");
  } else {
    fillProfile(account);
    Object.keys(rules).forEach(id => {
      const input = document.getElementById(id);
      if (input) input.addEventListener("blur", () => validateField(id));
    });

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const ids = role === "faculty" ? ["fullName", "regNo", "email", "department", "phone", "password", "confirm"] : Object.keys(rules);
      if (!ids.map(validateField).every(Boolean)) {
        showToast("Please fix the highlighted fields.", "error");
        return;
      }

      const accounts = accountsFromStorage();
      const index = accounts.findIndex(a => a.id.toLowerCase() === account.id.toLowerCase() && a.role === role);
      if (index < 0) return showToast("Account could not be found.", "error");

      const email = form.email.value.trim().toLowerCase();
      const duplicateEmail = accounts.some((a, i) => i !== index && a.email && a.email.toLowerCase() === email);
      if (duplicateEmail) return showToast("This email is already used by another account.", "error");

      const updated = {
        ...accounts[index],
        name: form.fullName.value.trim(),
        email,
        department: form.department.value,
        phone: form.phone.value.trim(),
        ...(role === "student" ? { semester: form.semester.value } : {})
      };

      if (form.password.value) updated.passwordHash = await hashProfilePassword(form.password.value);
      accounts[index] = updated;
      saveAccounts(accounts);
      fillProfile(updated);
      renderUser();
      form.password.value = "";
      form.confirm.value = "";
      showToast("Profile updated successfully");
    });
  }
}
