# Smart Campus Portal — Authentication

## What changed
- Added separate Student and Faculty registration.
- Added ID + password login.
- Added password confirmation and basic validation.
- Prevents duplicate IDs and email addresses.
- Stores accounts persistently in browser localStorage.
- Passwords are stored as SHA-256 hashes rather than plain text.
- Existing student/faculty portal pages continue using the logged-in account.
- Logout clears the active session.

## Demo accounts
For the existing seeded portal data:

- Student: `24CS01023` / `student123`
- Faculty: `FAC001` / `faculty123`

The other seeded student and faculty accounts use the same respective demo passwords.

## Important
This project is currently a static frontend. localStorage authentication is suitable for a college prototype/demo, but it is **not production-grade security**. A real deployment should move registration/login to a backend database with server-side password hashing (Argon2/bcrypt), HTTPS, secure sessions/JWTs, and server-side authorization.
