# JudgeAndSolve - Online Judge Platform

A full-stack online judge platform for coding problems, built with Next.js, Express.js, and Docker.

## 🔨 Tech Stack

- **Frontend**: Next.js + Tailwind CSS
- **Backend**: Express.js REST API
- **Database**: PostgreSQL via Sequelize ORM
- **Authentication**: OAuth + Passport.js (Google/GitHub), JWT
- **Code Execution**: Docker (sandboxed containers)
- **Deployment**: Docker + AWS

## 🚀 Features

- User Authentication (Login, Signup, Profile)
- Problem Management (View, Create, Update, Delete)
- Code Submission & Execution
- Leaderboard & Statistics
- Admin Dashboard

## 📁 Project Structure

```
judgeandsolve/
├── client/               # Next.js frontend
├── server/               # Express.js backend
└── docker/              # Docker configuration files
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker
- PostgreSQL

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/agrpranjal07/judgeandsolve.git
cd judgeandsolve
```

2. Setup Frontend:
```bash
cd client
npm install
npm run dev
```

3. Setup Backend:
```bash
cd server
npm install
npm run dev
```

4. Setup Environment Variables:
- Copy `.env.example` to `.env` in both client and server directories
- Update the variables as needed

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 