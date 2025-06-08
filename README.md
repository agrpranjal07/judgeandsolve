# JudgeAndSolve - Online Judge Platform

A full-stack online judge platform for coding problems, built with Next.js, Express.js, PostgreSQL, and Docker.  
Supports secure code execution in sandboxed containers and is ready for cloud deployment (AWS, Docker, etc).

---

## 🚀 Features

- User Authentication (Login, Signup, Profile)
- Problem Management (View, Create, Update, Delete)
- Code Submission & Execution (Python, C/C++, Node.js)
- Leaderboard & Statistics
- Admin Dashboard
- OAuth (Google, GitHub)
- JWT-based authentication
- Scalable, cloud-ready architecture

---

## 📁 Project Structure

```
judgeandsolve/
├── client/               # Next.js frontend
├── server/               # Express.js backend
```

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18+)
- Docker (for local code execution and deployment)
- PostgreSQL database
- Redis (for job queue)
- (Optional) AWS account for cloud deployment

---

### Development Setup

1. **Clone the repository:**
    ```bash
    git clone https://github.com/agrpranjal07/judgeandsolve.git
    cd judgeandsolve
    ```

2. **Setup Environment Variables:**
    - Copy `.env.example` to `.env` in both `client/` and `server/` directories.
    - Fill in the required values (see `.env.example` for details).

3. **Start the Frontend:**
    ```bash
    cd client
    npm install
    npm run dev
    ```

4. **Start the Backend:**
    ```bash
    cd ../server
    npm install
    npm run dev
    ```

5. **(Optional) Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    This will start the backend, database, and Redis for local development.

---

## 🐳 Docker & Production Deployment

- **Build the backend Docker image:**
    ```bash
    docker build -t judgeandsolve-server:latest ./server
    ```
- **Run the backend container (with Docker socket for code execution):**
    ```bash
    docker run -d -p 4000:4000 \
      --env-file ./server/.env \
      -v /var/run/docker.sock:/var/run/docker.sock \
      --name judgeandsolve-server \
      judgeandsolve-server:latest
    ```
- **Pre-pull language images (on every host/instance):**
    ```bash
    docker pull python:3.11
    docker pull gcc:13
    docker pull node:20
    ```

- **Deploy to AWS (ECR/EC2):**
    - Push your backend image to ECR.
    - Use EC2 User Data or a startup script to pre-pull language images.
    - Mount Docker socket as above.
    - Use Nginx or AWS ALB for HTTPS and load balancing.

---

## ⚠️ Security Notes

- Mounting the Docker socket gives the backend full control over the host Docker daemon. Use only on trusted, isolated servers.
- Always use strong secrets and secure your cloud resources (Postgres, Redis, etc).
- For public/multi-tenant deployments, consider sandboxing or using a dedicated VM for code execution.

---

## 📝 License

MIT

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

---

## 📣 Contact

For questions or support, reach out via [GitHub Issues](https://github.com/agrpranjal07/judgeandsolve/issues).