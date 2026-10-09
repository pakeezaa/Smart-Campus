"use strict";
// Registration form validation with inline messages
const form = document.getElementById("profileForm");
const rules = {
  fullName: v => v.trim().length >= 3 ? "" : "Enter your full name (at least 3 characters).",
  regNo: v => /^\d{4}-[A-Z]{2,5}-\d{1,4}$/.test(v) ? "" : "Use the format 2023-BSCS-014.",
  email: v => /^[^\s@]+@[^\s@]+\.edu\.pk$/i.test(v) ? "" : "Please enter a valid university email address (ending in .edu.pk).",
  department: v => v ? "" : "Select your department.",
  semester: v => v ? "" : "Select your semester.",
  phone: v => /^03\d{2}-?\d{7}$/.test(v) ? "" : "Enter a valid mobile number like 0300-1234567.",
  password: v => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(v) ? "" : "Use at least 8 characters with a letter and a number.",
  confirm: v => v === form.password.value && v ? "" : "Passwords do not match."
};
function validateField(id) {
  const input = document.getElementById(id), message = rules[id](input.value);
  document.getElementById(id + "Error").textContent = message;
  input.classList.toggle("invalid", !!message); input.classList.toggle("valid", !message);
  return !message;
}
Object.keys(rules).forEach(id => document.getElementById(id).addEventListener("blur", () => validateField(id)));
form.addEventListener("submit", e => {
  e.preventDefault();
  const allValid = Object.keys(rules).map(validateField).every(Boolean);
  if (allValid) { showToast("Profile saved successfully"); form.reset(); form.querySelectorAll("input").forEach(i => i.classList.remove("valid")); }
  else showToast("Please fix the highlighted fields.", "error");
});
