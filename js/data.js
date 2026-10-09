"use strict";
// All sample data lives here (replace with your own)
const TERM = { name: "Fall 2026", dropBy: "2026-10-20" };  // last day to drop a course
const COURSES = [
  { code: "CS101", name: "Introduction to Computer Science", instructor: "Dr. Ayesha Khan", credits: 3, semester: "Fall 2026", status: "Ongoing", attendance: 88 },
  { code: "CS102", name: "Data Structures & Algorithms", instructor: "Dr. Ahmed Raza", credits: 4, semester: "Fall 2026", status: "Ongoing", attendance: 82 },
  { code: "CS201", name: "Web Technology", instructor: "Dr. Sara Malik", credits: 3, semester: "Fall 2026", status: "Ongoing", attendance: 90 },
  { code: "CS202", name: "Database Systems", instructor: "Dr. Sara Malik", credits: 4, semester: "Fall 2026", status: "Ongoing", attendance: 80 },
  { code: "CS301", name: "Artificial Intelligence", instructor: "Dr. Farhan Ahmed", credits: 3, semester: "Fall 2026", status: "Upcoming", attendance: 0 },
  { code: "CS302", name: "Computer Networks", instructor: "Dr. M. Iqbal", credits: 3, semester: "Fall 2026", status: "Upcoming", attendance: 0 },
  { code: "CS001", name: "Programming Fundamentals", instructor: "Ms. Nida Rauf", credits: 4, semester: "Spring 2026", status: "Completed", attendance: 94 },
  { code: "MT101", name: "Calculus", instructor: "Mr. Hamza Tariq", credits: 3, semester: "Fall 2025", status: "Completed", attendance: 91 }
];
const SCHEDULE = [
  { code: "CS101", course: "Introduction to Computer Science", instructor: "Dr. Ayesha Khan", day: "Monday", start: "10:00", end: "11:30", room: "CS-101" },
  { code: "CS102", course: "Data Structures & Algorithms", instructor: "Dr. Ahmed Raza", day: "Tuesday", start: "12:00", end: "13:30", room: "CS-102" },
  { code: "CS201", course: "Web Technology", instructor: "Dr. Sara Malik", day: "Wednesday", start: "10:00", end: "11:30", room: "CS-204" },
  { code: "CS202", course: "Database Systems", instructor: "Dr. Sara Malik", day: "Thursday", start: "12:00", end: "13:30", room: "CS-103" },
  { code: "CS301", course: "Artificial Intelligence", instructor: "Dr. Farhan Ahmed", day: "Friday", start: "14:00", end: "15:30", room: "CS-201" }
];
const ANNOUNCEMENTS = [
  { title: "Midterm schedule released", description: "Check the datesheet on the notice board.", date: "2026-10-05", category: "Examination" },
  { title: "Library will remain closed on Friday", description: "Regular timings resume on Saturday.", date: "2026-10-03", category: "General" },
  { title: "Web Tech assignment 2 due", description: "Submit through the course page.", date: "2026-10-01", category: "Academic" },
  { title: "New course registration opens", description: "Register before the deadline.", date: "2026-09-28", category: "Academic" },
  { title: "Tech Fest 2026 registrations open", description: "Register at the society desk.", date: "2026-09-25", category: "Event" }
];
const EVENTS = [
  { name: "Project Submission Deadline", date: "2026-10-15" },
  { name: "Tech Fest 2026", date: "2026-10-20" }
];
const SEED_TASKS = [
  { id: 1, title: "Web Tech assignment 2", course: "CS201", due: "2026-10-15", priority: "High", done: true },
  { id: 2, title: "Database quiz", course: "CS202", due: "2026-10-20", priority: "Medium", done: false },
  { id: 3, title: "Project proposal", course: "CS301", due: "2026-10-25", priority: "Low", done: false }
];
// ---- Accounts + Faculty / grading data ----
// Authentication is stored in browser localStorage because this project is a
// static HTML/CSS/JS application (there is no server/database yet).
const AUTH_KEY = "smartCampusUsers";

const DEFAULT_ACCOUNTS = [
  {
    id: "24CS01023", name: "Pakeeza", role: "student", email: "pakeeza@smartcampus.edu", department: "Computer Science",
    passwordHash: "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b"
  },
  {
    id: "24CS01005", name: "Ali Hassan", role: "student", email: "ali@smartcampus.edu", department: "Computer Science",
    passwordHash: "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b"
  },
  {
    id: "24CS01011", name: "Fatima Noor", role: "student", email: "fatima@smartcampus.edu", department: "Computer Science",
    passwordHash: "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b"
  },
  {
    id: "24CS01017", name: "Usman Tariq", role: "student", email: "usman@smartcampus.edu", department: "Computer Science",
    passwordHash: "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b"
  },
  {
    id: "24CS01030", name: "Maryam Siddiqui", role: "student", email: "maryam@smartcampus.edu", department: "Computer Science",
    passwordHash: "703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b"
  },
  {
    id: "FAC001", name: "Dr. Sara Malik", role: "faculty", email: "sara.malik@smartcampus.edu", department: "Computer Science",
    passwordHash: "27041f5856c7387a997252694afb048d1aa939228ffcdbd6285b979b8da20e7a"
  },
  {
    id: "FAC002", name: "Dr. Ayesha Khan", role: "faculty", email: "ayesha.khan@smartcampus.edu", department: "Computer Science",
    passwordHash: "27041f5856c7387a997252694afb048d1aa939228ffcdbd6285b979b8da20e7a"
  },
  {
    id: "FAC003", name: "Dr. Ahmed Raza", role: "faculty", email: "ahmed.raza@smartcampus.edu", department: "Computer Science",
    passwordHash: "27041f5856c7387a997252694afb048d1aa939228ffcdbd6285b979b8da20e7a"
  },
  {
    id: "FAC004", name: "Dr. Farhan Ahmed", role: "faculty", email: "farhan.ahmed@smartcampus.edu", department: "Computer Science",
    passwordHash: "27041f5856c7387a997252694afb048d1aa939228ffcdbd6285b979b8da20e7a"
  },
  {
    id: "FAC005", name: "Dr. M. Iqbal", role: "faculty", email: "m.iqbal@smartcampus.edu", department: "Computer Science",
    passwordHash: "27041f5856c7387a997252694afb048d1aa939228ffcdbd6285b979b8da20e7a"
  }
];

function getAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_KEY));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch { }
  localStorage.setItem(AUTH_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  return JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
}
const ACCOUNTS = getAccounts();
const STUDENTS = ACCOUNTS.filter(a => a.role === "student").map(a => ({
  id: a.id, name: a.name, email: a.email, department: a.department
}));
const TEACHERS = ACCOUNTS.filter(a => a.role === "faculty").map(a => ({
  id: a.id, name: a.name, email: a.email, department: a.department
}));

// Logged-in person: every page uses the account selected at login.
const USER = localStorage.getItem("portalUser");
const ROLE_FROM_STORAGE = localStorage.getItem("portalRole");
const FACULTY = TEACHERS.find(t => t.id === USER) || TEACHERS[0];
const ME_ID = (STUDENTS.find(s => s.id === USER) || STUDENTS[0]).id;
const SEED_ASSIGNMENTS = [
  { id: 101, title: "Responsive Web Page", course: "CS201", due: "2026-10-15", total: 20, description: "Build a responsive page using Flexbox and Grid.", postedBy: "Dr. Sara Malik" },
  { id: 102, title: "Portfolio Page", course: "CS201", due: "2026-10-08", total: 10, description: "Create a personal portfolio page with semantic HTML.", postedBy: "Dr. Sara Malik" },
  { id: 103, title: "ER Diagram", course: "CS202", due: "2026-10-20", total: 15, description: "Design an ER diagram for a library system.", postedBy: "Dr. Sara Malik" }
];
const SEED_SUBMISSIONS = [
  { id: 1, assignmentId: 101, studentId: "24CS01005", text: "Link: github.com/ali/responsive-page", submittedOn: "2026-10-02", marks: null, feedback: "" },
  { id: 2, assignmentId: 101, studentId: "24CS01011", text: "Link: github.com/fatima/responsive", submittedOn: "2026-10-03", marks: null, feedback: "" },
  { id: 3, assignmentId: 102, studentId: "24CS01005", text: "Portfolio hosted at ali.example.com", submittedOn: "2026-10-01", marks: 8, feedback: "Good layout, improve spacing." },
  { id: 4, assignmentId: 102, studentId: "24CS01011", text: "Portfolio link: fatima.example.com", submittedOn: "2026-10-02", marks: null, feedback: "" },
  { id: 5, assignmentId: 102, studentId: "24CS01017", text: "Uploaded to GitHub Pages", submittedOn: "2026-10-03", marks: null, feedback: "" },
  { id: 6, assignmentId: 102, studentId: "24CS01030", text: "Portfolio link: maryam.example.com", submittedOn: "2026-09-30", marks: 9, feedback: "Clean and responsive." },
  { id: 7, assignmentId: 103, studentId: "24CS01030", text: "ER diagram PDF attached via Drive link", submittedOn: "2026-10-01", marks: 13, feedback: "Well normalised." }
];
// Enrollment requests: status is Pending, Approved or Rejected
const SEED_ENROLLMENTS = [
  ...["CS101", "CS102", "CS201", "CS202", "CS001", "MT101"].map((course, i) => ({ id: i + 1, studentId: "24CS01023", course, status: "Approved" })),
  { id: 7, studentId: "24CS01023", course: "CS301", status: "Pending" },
  { id: 8, studentId: "24CS01005", course: "CS201", status: "Approved" }, { id: 9, studentId: "24CS01005", course: "CS202", status: "Approved" },
  { id: 10, studentId: "24CS01011", course: "CS201", status: "Approved" }, { id: 11, studentId: "24CS01011", course: "CS202", status: "Pending" },
  { id: 12, studentId: "24CS01017", course: "CS201", status: "Approved" },
  { id: 13, studentId: "24CS01030", course: "CS201", status: "Approved" }, { id: 14, studentId: "24CS01030", course: "CS202", status: "Approved" }
];
