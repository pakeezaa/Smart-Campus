"use strict";

// Authentication helpers for the static Smart Campus prototype.
// Passwords are hashed with SHA-256 before being stored in localStorage.
// For production, move authentication to a server/database and use
// server-side password hashing such as Argon2/bcrypt plus secure sessions.

const AUTH_STORAGE_KEY = "smartCampusUsers";

async function hashPassword(password) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Secure password hashing is not available in this browser.");
  }
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

function getStoredAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

function saveStoredAccounts(accounts) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts));
}

function clearAuth() {
  localStorage.removeItem("portalRole");
  localStorage.removeItem("portalUser");
}

function setSession(account) {
  localStorage.setItem("portalRole", account.role);
  localStorage.setItem("portalUser", account.id);
}

function authMessage(el, message) {
  if (el) el.textContent = message;
}

function initAuthForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) initLoginForm(loginForm);
  if (registerForm) initRegisterForm(registerForm);
}

function initLoginForm(form) {
  let role = "student";
  const userInput = document.getElementById("loginUser");
  const passwordInput = document.getElementById("loginPassword");
  const error = document.getElementById("loginError");

  const syncRole = () => {
    const faculty = role === "faculty";
    form.querySelectorAll(".chip").forEach(c =>
      c.classList.toggle("active", c.dataset.role === role)
    );
    const label = form.querySelector('label[for="loginUser"]');
    if (label) label.textContent = faculty ? "Faculty ID" : "Student ID";
    userInput.placeholder = faculty ? "e.g. FAC001" : "e.g. 24CS01023";
  };

  form.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    role = chip.dataset.role;
    authMessage(error, "");
    syncRole();
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    authMessage(error, "");

    const id = userInput.value.trim();
    const password = passwordInput.value;

    if (!id || !password) {
      authMessage(error, "Please enter your ID and password.");
      return;
    }

    try {
      const passwordHash = await hashPassword(password);
      const account = getStoredAccounts().find(a =>
        a.id.toLowerCase() === id.toLowerCase() &&
        a.role === role &&
        a.passwordHash === passwordHash
      );

      if (!account) {
        authMessage(error, "Invalid ID, password, or account type.");
        return;
      }

      setSession(account);
      window.location.href = role === "faculty" ? "faculty.html" : "dashboard.html";
    } catch (err) {
      authMessage(error, err.message || "Unable to sign in.");
    }
  });

  syncRole();
}

function initRegisterForm(form) {
  let role = "student";
  const nameInput = document.getElementById("regName");
  const idInput = document.getElementById("regId");
  const emailInput = document.getElementById("regEmail");
  const deptInput = document.getElementById("regDepartment");
  const passwordInput = document.getElementById("regPassword");
  const confirmInput = document.getElementById("regConfirm");
  const idLabel = document.getElementById("regIdLabel");
  const error = document.getElementById("registerError");

  const syncRole = () => {
    const faculty = role === "faculty";
    form.querySelectorAll(".chip").forEach(c =>
      c.classList.toggle("active", c.dataset.role === role)
    );
    idLabel.textContent = faculty ? "Faculty ID" : "Student ID";
    idInput.placeholder = faculty ? "e.g. FAC006" : "e.g. 24CS01031";
  };

  form.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    role = chip.dataset.role;
    authMessage(error, "");
    syncRole();
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();
    authMessage(error, "");

    const name = nameInput.value.trim();
    const id = idInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const department = deptInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if (name.length < 2) return authMessage(error, "Please enter your full name.");
    if (!/^[A-Za-z0-9_-]{4,20}$/.test(id)) {
      return authMessage(error, "Use a valid ID (4–20 letters, numbers, _ or -).");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return authMessage(error, "Please enter a valid email address.");
    }
    if (!department) return authMessage(error, "Please enter your department.");
    if (password.length < 6) return authMessage(error, "Password must be at least 6 characters.");
    if (password !== confirm) return authMessage(error, "Passwords do not match.");

    const accounts = getStoredAccounts();
    if (accounts.some(a => a.id.toLowerCase() === id.toLowerCase())) {
      return authMessage(error, "This ID is already registered.");
    }
    if (accounts.some(a => a.email.toLowerCase() === email)) {
      return authMessage(error, "This email is already registered.");
    }

    try {
      const passwordHash = await hashPassword(password);
      const account = {
        id, name, role, email, department, passwordHash
      };

      accounts.push(account);
      saveStoredAccounts(accounts);
      setSession(account);
      window.location.href = role === "faculty" ? "faculty.html" : "dashboard.html";
    } catch (err) {
      authMessage(error, err.message || "Unable to create the account.");
    }
  });

  syncRole();
}

document.addEventListener("DOMContentLoaded", initAuthForms);
