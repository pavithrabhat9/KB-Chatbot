# Knowledge Base Chatbot
### AI-Powered Enterprise Knowledge Management System

🔗 **Live Demo:** https://kb-chatbot-pi.vercel.app

**Try it now:**
- Admin: `pavithrabhat39@gmail.com` / `Pavithra123`
- Employee: Sign up with Google or email

---

## What This Is

A full-stack SaaS application that enables organizations to:
-  Admins curate a knowledge base
-  Deploy a grounded AI chatbot answering ONLY from internal docs
-  Employees get instant answers to questions
-  Admins monitor all conversations in real-time

**Why this matters:** This solves real enterprise problems. Companies pay ₹2,500 to ₹40,000/mo for knowledge management + AI chatbots.

## Architecture Highlights

**Frontend:** React 18 + Vite + Tailwind CSS + Zustand
- Professional dark UI with animations
- Real-time message streaming
- Role-based authentication

**Backend:** Firebase Firestore + Firebase Auth
- Real-time NoSQL database
- Instant sync across all clients
- Secure role-based access

**AI:** Groq API (LLaMA 3.1)
- Grounded responses (answers ONLY from KB)
- Zero hallucinations
- Character-by-character streaming
- Fast + free

**Deployment:** Vercel (frontend) + Firestore (backend)
- Deployed and production-ready
- Live demo available

---

## Key Features

- **Authentication:** Admin hardcoded login + Employee Firebase Auth (Email + Google OAuth)
- **Knowledge Base CRUD:** Create, edit, delete articles
- **Employee Chat:** Multiple sessions, persistent history
- **AI Integration:** Groq API with grounded responses
- **Admin Monitoring:** Real-time employee tracking + conversation oversight
- **Responsive Design:** Desktop/tablet/mobile friendly

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State Management | Zustand |
| Database | Firebase Firestore |
| Authentication | Firebase Auth |
| AI Service | Groq API (LLaMA 3.1) |
| Hosting | Vercel |
| Icons | Lucide React |

---

## Getting Started (3 minutes)

### Option 1: Use Live Demo (Quickest)
Just visit: https://kb-chatbot-pi.vercel.app

### Option 2: Run Locally

**Prerequisites:**
- Node.js 18+
- Firebase account (free)
- Groq API key (free, no credit card)

**Steps:**
```bash
# 1. Clone
git clone https://github.com/pavithrabhat9/kb-chatbot.git
cd kb-chatbot

# 2. Install
npm install

# 3. Create .env.local (copy from .env.example)
cp .env.example .env.local
# Add your Firebase + Groq credentials

# 4. Run
npm run dev
# Open http://localhost:5173
```

**Firebase Setup (2 minutes):**
1. Go to [firebase.google.com](https://firebase.google.com)
2. Create new project
3. Enable Firestore Database + Firebase Auth
4. Copy credentials to `.env.local`

**Groq Setup (1 minute):**
1. Sign up at [console.groq.com](https://console.groq.com) (free)
2. Generate API key
3. Add to `.env.local`

---

##  Screenshots

### Login Page
Professional dark-themed login with admin and employee sign-in tabs.

| Admin Login | Employee Login |
|---|---|
| <img src="https://github.com/user-attachments/assets/7c93c5b4-9746-402d-ae09-ed4fcc72f1ef" width="100%"/> | <img src="https://github.com/user-attachments/assets/5af77055-011a-42cc-af6b-abad51815462" width="100%"/> |

### Admin Dashboard
Manage knowledge base and monitor employee conversations in real-time.

| Knowledge Base Management | Employee Monitoring |
|---|---|
| <img src="https://github.com/user-attachments/assets/ba8f34b3-cf1a-4eb9-a809-8beb00f2760e" width="100%"/> | <img src="https://github.com/user-attachments/assets/e7467fd2-14da-4267-804e-ebfd9795d329" width="100%"/> |

### Employee Chat Interface
Beautiful, real-time chat with streaming AI responses.

| Chat Experience |
|---|
| <img src="https://github.com/user-attachments/assets/6fa1a404-e3c7-4f40-8989-2851baf464f2" width="100%"/> |

---

## How It Works

### Employee Flow
1. Employee logs in (Google or email)
2. Creates new chat session
3. Asks a question
4. AI searches knowledge base, generates grounded answer
5. Answer streams character-by-character with typing animation
6. History saved automatically

### Admin Flow
1. Admin logs in
2. Creates/edits knowledge base articles
3. Views all employees + their status
4. Can monitor live conversations
5. Can end chat sessions if needed

---

## Why This Project Stands Out

**For employers:**
-  **Production-ready code** (not a tutorial)
-  **Real problem solved** (enterprise knowledge management)
-  **Modern stack** (React 18, Vite, Firebase, real-time)
-  **AI integrated correctly** (grounded, not hallucinating)
-  **Deployed** (not just localhost)
-  **Scalable architecture** (real database, real API)

**For learning:**
- Demonstrates full-stack thinking (frontend → backend → database → AI)
- Shows understanding of authentication + authorization
- Real-time data sync (complex, important skill)
- AI/LLM integration best practices
- Professional code organization

---

## What I Learned Building This

- **Firebase Firestore:** Real-time NoSQL, security rules, query optimization
- **React patterns:** State management with Zustand, component composition, hooks
- **AI integration:** Groq API, prompt engineering, grounding techniques, streaming responses
- **Authentication:** Firebase Auth, role-based access control, JWT handling
- **Full-stack thinking:** Frontend ↔ Database ↔ AI coordination
- **Deployment:** Vercel for frontend, Firebase for backend

---

## Future Enhancements

- [ ] PDF upload for KB articles (with text extraction)
- [ ] Chat search + filtering
- [ ] Admin chat takeover feature
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom branding per company

---

## Deployment

**Frontend:** Deployed on Vercel
**Backend:** Firebase (managed)

To deploy your own version:
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy (1 click)

---

## Questions?

If you have questions about the code or want to extend this project, open an issue or contact me.

---

**Built with ❤️ | React + AI + Full-Stack | 2026**
