# JudgeAndSolve - Online Judge Platform

A full-stack online judge platform for coding problems, built with Next.js 14, Express.js, PostgreSQL (NeonDB), and Docker microservices.  
Features secure code execution with microservice architecture and cloud deployment on AWS.

🌐 **Live Demo**: [judgeandsolve.me](https://judgeandsolve.me)  
🚀 **API**: [api.judgeandsolve.me](https://api.judgeandsolve.me)

---

## 🚀 Features

- **User Authentication**: Login, Signup, Profile management with OAuth (Google, GitHub)
- **Problem Management**: Browse, solve, and manage coding problems with difficulty levels
- **Code Execution**: Support for Python 3, C++, and JavaScript with isolated execution
- **Judge System**: Microservice architecture with dedicated judge service for scalability
- **Real-time Results**: Live submission tracking and test case results
- **AI Code Review**: Powered by Google Gemini API for code analysis and feedback
- **Leaderboard**: User rankings based on weighted scoring system
- **Statistics**: User performance analytics and submission history
- **Admin Dashboard**: Problem and user management capabilities
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

---

## 📁 Project Structure

```
judgeandsolve/
├── client/               # Next.js 14 frontend (TypeScript)
│   ├── src/
│   │   ├── app/         # Next.js app router
│   │   ├── _components/ # Reusable UI components
│   │   ├── _services/   # API service layer
│   │   └── _store/      # Zustand state management
│   ├── .env
│   ├── .env.development
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── package.json
├── server/              # Express.js backend (TypeScript)
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Sequelize models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Authentication & error handling
│   │   ├── config/      # Database and app configuration
│   │   └── judge/       # Judge system integration
│   ├── __tests__/       # Test files
│   ├── .env
│   ├── .env.prod
│   ├── Dockerfile
│   └── package.json
├── judge-service/       # Microservice for code execution
│   ├── src/
│   │   ├── index.ts     # Express server
│   │   ├── judgeRunner.ts # Code execution engine
│   │   └── types.ts     # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml   # Production deployment configuration
```

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Zustand** for state management
- **Monaco Editor** for code editing
- **Deployed on Vercel**

### Backend
- **Express.js** with TypeScript
- **Sequelize ORM** with PostgreSQL
- **NeonDB** for cloud PostgreSQL database
- **BullMQ** for job queue management
- **Redis** (local instance) for caching and queues
- **JWT** for authentication
- **Passport.js** for OAuth (Google, GitHub)
- **Google Gemini API** for AI code reviews

### Infrastructure
- **Docker** for containerization
- **AWS ECR** for container registry
- **AWS EC2** for backend deployment
- **Nginx** for reverse proxy with SSL
- **Let's Encrypt** for SSL certificates
- **Judge Service** microservice for code execution

### Supported Languages
- **Python 3** with `python3`
- **C++** with `g++` compiler
- **JavaScript** with `node` runtime

---

## 🏗️ Architecture

### Microservice Design

```
Frontend (Vercel)     Backend (EC2)     Judge Service (EC2)
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Next.js 14     │  │  Express.js     │  │  Express.js     │
│  judgeandsolve. │──│  api.judgeand   │──│  Port 4001      │
│  me             │  │  solve.me       │  │  Code Execution │
│                 │  │  Port 4000      │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │                      
                     ┌─────────────────┐              
                     │  NeonDB         │              
                     │  PostgreSQL     │              
                     └─────────────────┘              
                              │                      
                     ┌─────────────────┐              
                     │  Redis          │              
                     │  Local Instance │              
                     └─────────────────┘              
```

### Code Execution Flow

1. User submits code through frontend
2. Backend validates and queues submission using BullMQ
3. Judge service executes code in isolated environment
4. Results sent back through microservice API
5. Frontend displays real-time results

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- AWS account with ECR access
- NeonDB PostgreSQL database
- Redis instance

### Development Setup

1. **Clone the repository:**
    ```bash
    git clone https://github.com/agrpranjal07/judgeandsolve.git
    cd judgeandsolve
    ```

2. **Setup Environment Variables:**
    
    **`client/.env`:**
    ```bash
    NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
    NEXT_PUBLIC_GITHUB_OAUTH_URL=http://localhost:4000/api/v1/auth/github
    NEXT_PUBLIC_GOOGLE_OAUTH_URL=http://localhost:4000/api/v1/auth/google
    ```
    
    **`server/.env`:**
    ```bash
    PORT=4000
    DATABASE_URL=your-neondb-postgresql-url
    REDIS_URL=redis://localhost:6379
    JWT_SECRET=your-jwt-secret
    REFRESH_SECRET=your-refresh-secret
    CLIENT_URL=http://localhost:3000
    JUDGE_SERVICE_URL=http://localhost:4001
    GEMINI_API_KEY=your-gemini-api-key
    
    # OAuth Configuration
    OAUTH_GITHUB_CLIENT_ID=your-github-client-id
    OAUTH_GITHUB_CLIENT_SECRET=your-github-client-secret
    OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
    OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
    ```
    
    **`judge-service/.env`:**
    ```bash
    PORT=4001
    ```

3. **Install Dependencies:**
    ```bash
    # Frontend
    cd client && npm install
    
    # Backend
    cd ../server && npm install
    
    # Judge Service
    cd ../judge-service && npm install
    ```

4. **Start Development Servers:**
    ```bash
    # Start Redis locally
    redis-server
    
    # Frontend (Terminal 1)
    cd client && npm run dev
    
    # Backend (Terminal 2)
    cd server && npm run dev
    
    # Judge Service (Terminal 3)
    cd judge-service && npm run dev
    ```

5. **Access the Application:**
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:4000
    - Judge Service: http://localhost:4001

---

## 🐳 Production Deployment

### AWS Infrastructure

- **Frontend**: Deployed on Vercel at [judgeandsolve.me](https://judgeandsolve.me)
- **Backend**: AWS EC2 with Docker containers
- **Database**: NeonDB PostgreSQL (cloud)
- **Redis**: Local instance on EC2
- **Container Registry**: AWS ECR
- **SSL**: Let's Encrypt with Nginx
- **Domain**: api.judgeandsolve.me

### Deployment Steps

1. **Build and Push Images to ECR:**
    ```bash
    # Build judge service
    cd judge-service
    docker build -t judgeandsolve-judge .
    docker tag judgeandsolve-judge:latest 471112932256.dkr.ecr.ap-south-1.amazonaws.com/judgeandsolve-judge:latest
    docker push 471112932256.dkr.ecr.ap-south-1.amazonaws.com/judgeandsolve-judge:latest
    
    # Build and push server
    cd ../server
    docker build -t judgeandsolve-server .
    docker tag judgeandsolve-server:latest 471112932256.dkr.ecr.ap-south-1.amazonaws.com/judgeandsolve-server:latest
    docker push 471112932256.dkr.ecr.ap-south-1.amazonaws.com/judgeandsolve-server:latest
    ```

2. **Deploy on EC2:**
    ```bash
    # Login to ECR
    aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 471112932256.dkr.ecr.ap-south-1.amazonaws.com
    
    # Start services using docker-compose
    docker compose up -d
    ```

3. **Setup Nginx with SSL:**
    ```bash
    # Install Nginx (Amazon Linux)
    sudo yum install nginx -y
    
    # Configure SSL with Let's Encrypt
    sudo yum install python3-pip -y
    sudo pip3 install certbot certbot-nginx
    sudo certbot --nginx -d api.judgeandsolve.me
    ```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  redis:
    image: redis:7
    container_name: redis_server
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - judge-network
    restart: unless-stopped

  judge-service:
    image: 471112932256.dkr.ecr.ap-south-1.amazonaws.com/judgeandsolve-judge:latest
    container_name: judge_service
    ports:
      - "127.0.0.1:4001:4001"
    environment:
      - PORT=4001
    networks:
      - judge-network
    restart: unless-stopped

  backend:
    image: 471112932256.dkr.ecr.ap-south-1.amazonaws.com/judgeandsolve-server:latest
    container_name: judge_server
    ports:
      - "127.0.0.1:4000:4000"
    depends_on:
      - redis
      - judge-service
    env_file:
      - ./server/.env
    environment:
      - JUDGE_SERVICE_URL=http://judge-service:4001
      - CLIENT_URL=https://judgeandsolve.me
    networks:
      - judge-network
    restart: unless-stopped

networks:
  judge-network:
    driver: bridge
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `GET /api/v1/auth/github` - GitHub OAuth
- `GET /api/v1/auth/google` - Google OAuth
- `GET /api/v1/auth/me` - Get current user

### Problems
- `GET /api/v1/problems` - List problems with pagination
- `GET /api/v1/problems/:id` - Get problem details
- `POST /api/v1/problems` - Create problem (admin only)
- `GET /api/v1/problems/:id/testcases/public` - Get sample test cases

### Submissions
- `POST /api/v1/submissions` - Submit code for judging
- `GET /api/v1/submissions/:id` - Get submission details
- `POST /api/v1/submissions/testcases` - Test sample cases
- `GET /api/v1/recentSubmissions` - Get recent submissions

### Statistics
- `GET /api/v1/stats/leaderboard` - Get leaderboard
- `GET /api/v1/stats/user/:username` - User statistics

### AI Features
- `POST /api/v1/ai/review` - Get AI code review

---

## 🧪 Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test
```

---

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Docker containerization for code execution isolation
- Input validation and sanitization
- Rate limiting on API endpoints
- HTTPS enforcement in production
- OAuth integration for secure login
- Environment variable management

---

## 📈 Performance Optimizations

- Redis caching for improved response times
- Database query optimization with Sequelize
- Async job processing with BullMQ
- Microservice architecture for scalability
- Container reuse for faster code execution
- CDN integration through Vercel

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | NeonDB PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `CLIENT_URL` | Frontend URL for CORS | ✅ |
| `JUDGE_SERVICE_URL` | Judge service internal URL | ✅ |
| `OAUTH_GITHUB_CLIENT_ID` | GitHub OAuth client ID | ✅ |
| `OAUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework
- [NeonDB](https://neon.tech/) for cloud PostgreSQL
- [Shadcn/ui](https://ui.shadcn.com/) for UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for code editing
- [Docker](https://www.docker.com/) for containerization
- [AWS](https://aws.amazon.com/) for cloud infrastructure
- [Vercel](https://vercel.com/) for frontend deployment

---

## 📞 Support

For questions or support:
- 🐛 Issues: [GitHub Issues](https://github.com/agrpranjal07/judgeandsolve/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/agrpranjal07/judgeandsolve/discussions)

---

## 🌐 Live Demo

- **Frontend**: [https://judgeandsolve.me](https://judgeandsolve.me)
- **API**: [https://api.judgeandsolve.me](https://api.judgeandsolve.me)

---

**Happy Coding! 🚀**