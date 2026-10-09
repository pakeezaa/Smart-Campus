"use strict";
// Sample data for the portal (replace with your own details)
const CURRENT_SEMESTER = 5;
const COURSES = [
  {code:"CS-301",name:"Web Technology",instructor:"Dr. Ayesha Khan",credits:3,semester:5,status:"Enrolled",attendance:92},
  {code:"CS-302",name:"Database Systems",instructor:"Mr. Bilal Ahmed",credits:4,semester:5,status:"Enrolled",attendance:85},
  {code:"CS-303",name:"Operating Systems",instructor:"Dr. Sana Malik",credits:3,semester:5,status:"Enrolled",attendance:88},
  {code:"CS-304",name:"Computer Networks",instructor:"Mr. Hamza Tariq",credits:3,semester:5,status:"Enrolled",attendance:79},
  {code:"CS-201",name:"Data Structures",instructor:"Dr. Imran Shah",credits:4,semester:3,status:"Completed",attendance:95},
  {code:"MT-210",name:"Linear Algebra",instructor:"Ms. Nida Rauf",credits:3,semester:4,status:"Completed",attendance:90},
  {code:"CS-401",name:"Artificial Intelligence",instructor:"Dr. Farah Noor",credits:3,semester:6,status:"Upcoming",attendance:0}
];
const ANNOUNCEMENTS = [
  {title:"Mid-term exam schedule released",description:"Mid-terms begin on 3 November. Check the datesheet on the notice board.",date:"2026-10-02",category:"Examination"},
  {title:"Web Technology Assignment 1 due",description:"Submit the Smart Campus Portal project folder by 12 October.",date:"2026-10-01",category:"Academic"},
  {title:"Tech Fest 2026 registrations open",description:"Hackathon, robotics and poster competitions. Register at the society desk.",date:"2026-09-29",category:"Event"},
  {title:"Library timings extended",description:"The library stays open until 9 PM on weekdays during exam season.",date:"2026-09-27",category:"General"},
  {title:"Course withdrawal deadline",description:"Last date to withdraw from a course is 15 October.",date:"2026-09-25",category:"Academic"}
];
const EVENTS = [
  {name:"Tech Fest 2026",date:"2026-10-20",place:"Main Auditorium"},
  {name:"Career Counselling Day",date:"2026-10-27",place:"Seminar Hall"},
  {name:"Blood Donation Drive",date:"2026-11-05",place:"Student Centre"}
];
const SCHEDULE = [
  {course:"Web Technology",instructor:"Dr. Ayesha Khan",day:"Monday",start:"09:00",end:"10:30",room:"Lab 2"},
  {course:"Database Systems",instructor:"Mr. Bilal Ahmed",day:"Monday",start:"11:00",end:"12:30",room:"Room 104"},
  {course:"Operating Systems",instructor:"Dr. Sana Malik",day:"Tuesday",start:"09:00",end:"10:30",room:"Room 201"},
  {course:"Computer Networks",instructor:"Mr. Hamza Tariq",day:"Wednesday",start:"10:00",end:"11:30",room:"Lab 4"},
  {course:"Web Technology",instructor:"Dr. Ayesha Khan",day:"Thursday",start:"09:00",end:"10:30",room:"Lab 2"},
  {course:"Database Systems",instructor:"Mr. Bilal Ahmed",day:"Friday",start:"08:30",end:"10:00",room:"Room 104"}
];
