# Calendar Web APP

## Tech Stack

- WebAPP: Remix + React (TypeScript)
- Scheduler: Node.JS + Cron
- Database: FireStore
- Auth Service: Firebase Auth

## Email Reminder Usage

! Please fill in all the .env file & the firebase key json file

```
-- Email Reminder Usage
* * * * * ./run_reminder.sh

-- WebApp Usage
dev mod: npm run dev
only build: npm run build
start mod: npm run build && npm run start
```

## Features

|           | Content                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------- |
| ✅        | The app shall provide users the ability to input calendar items through manual entry or by importing data from a CSV file. |
| ✅        | The app shall send email reminders to users for their scheduled calendar items, even when the PWA is not actively running. |
| ✅        | The app shall allow users to log in using their email or Google OAuth for authentication.                                  |
| ✅        | The app shall be accessible from various devices, including desktop computers, tablets, and mobile phones.                 |
| (Unknown) | The app shall have a user-friendly interface that is intuitive and easy to navigate.                                       |
| (Unknown) | The app shall follow good UI/UX design principles to enhance user experience and engagement.                               |
| ✅        | The app shall allow users to register for an account using their email.                                                    |
| ✅        | The app shall provide a password reset functionality for users who have forgotten their password.                          |
