# 🚀 Knowledge Base Chatbot

> **AI-Powered Enterprise Chat Assistant** - A full-stack, real-time knowledge base management system with intelligent chatbot grounded entirely in admin-curated content.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase)

---

## ✨ Overview

Knowledge Base Chatbot is a **full-stack SaaS application** that empowers organizations to:

- 📚 **Manage Knowledge**: Admins create and maintain a curated knowledge base
- 🤖 **Deploy AI**: Ground a smart chatbot entirely on company knowledge
- 💬 **Support Employees**: Provide instant answers to employee questions
- 👁️ **Monitor Live**: Admins oversee all conversations in real-time

The AI is **completely grounded** - it answers ONLY from the knowledge base articles and says *"I don't have that information"* when the answer isn't available.

---

## 🎯 Key Features

### 🔐 **Authentication**
- ✅ Hard-coded admin login (email/password)
- ✅ Employee Firebase authentication (Email signup + Google OAuth)
- ✅ Role-based access control (Admin/Employee)
- ✅ Persistent sessions with localStorage

### 📖 **Knowledge Base Management (Admin)**
- ✅ Create articles with title and rich content
- ✅ Edit existing articles in real-time
- ✅ Delete articles with confirmation
- ✅ View all articles in professional table format
- ✅ Search and filter capabilities

### 💬 **Employee Chat**
- ✅ Create multiple independent chat sessions
- ✅ Ask questions to AI chatbot
- ✅ Receive answers grounded in knowledge base only
- ✅ Persistent chat history across sessions
- ✅ Real-time message streaming with typing animation
- ✅ Beautiful message UI (user/bot distinction)

### 👁️ **Admin Monitoring**
- ✅ View all employees with online/offline status
- ✅ Monitor live employee conversations
- ✅ View complete chat history per employee
- ✅ Stop active chats (employee sees "Chat ended by admin")
- ✅ Real-time updates with Firestore listeners
- ✅ Employee session analytics

### 🤖 **AI Integration**
- ✅ Groq API - Ultra-fast, free
- ✅ System prompt grounding (answers ONLY from KB)
- ✅ Zero hallucinations (no general knowledge)
- ✅ Streaming responses (character-by-character)
- ✅ Automatic response persistence to Firestore

### 🎨 **Professional UI/UX**
- ✅ Dark theme with high contrast colors
- ✅ Smooth animations and transitions
- ✅ Responsive design (desktop/tablet/mobile)
- ✅ Professional gradients and shadows
- ✅ Enterprise-ready appearance
- ✅ Accessibility optimized

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                       │
│  React 18 + Vite + TailwindCSS + Zustand               │
│  ├─ Login Page (Admin + Employee)                       │
│  ├─ Admin Dashboard (KB Management + Monitoring)        │
│  └─ Employee Chat (Chat Sessions + Messages)            │
└────────────────────┬────────────────────────────────────┘
                     │ REST API + WebSocket
┌────────────────────┴────────────────────────────────────┐
│                    DATA LAYER                           │
│  Firebase Firestore (Real-time NoSQL)                  │
│  ├─ users (authentication + roles)                      │
│  ├─ kb_articles (knowledge base)                        │
│  ├─ chat_sessions (conversation threads)               │
│  └─ chat_messages (message history)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                    AI LAYER                             │
│  Groq API (LLaMA 3.1 8B Instant)                        │
│  System Prompt: "Answer ONLY from KB articles"          │
│  Response: Streamed + Grounded                          │
└─────────────────────────────────────────────────────────┘
```

### **Data Flow**

```
Employee Question
       ↓
Fetch KB Articles from Firestore
       ↓
Build System Prompt + User Question
       ↓
Send to Groq API (LLaMA 3.1)
       ↓
Stream Response to UI (typing animation)
       ↓
Save Bot Response to Firestore
       ↓
Admin Sees Live Update in Monitoring Panel
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 + Vite | Fast, modern UI development |
| **Routing** | React Router DOM v7 | Client-side navigation |
| **State Management** | Zustand | Lightweight, global state |
| **Styling** | Tailwind CSS | Professional dark theme |
| **Icons** | Lucide React | Beautiful, consistent icons |
| **Backend/Runtime** | Node.js (Vercel Functions) | Serverless execution |
| **Database** | Firebase Firestore | Real-time NoSQL database |
| **Authentication** | Firebase Auth | Email/Password + Google OAuth |
| **AI Service** | Groq API (LLaMA 3.1) | Fast, free, grounded AI |
| **Hosting** | Vercel | Seamless deployment |

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ installed
- Firebase project (free tier)
- Groq API key (free)
- Git installed

### **Installation**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/kb-chatbot.git
cd kb-chatbot

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Create .env.local file:
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GROQ_API_KEY=your_groq_api_key

# 4. Start development server
npm run dev

# 5. Open browser
# Visit http://localhost:5173
```

### **Firebase Setup**

1. Create project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database (test mode)
3. Enable Authentication:
   - Email/Password
   - Google OAuth
4. Copy credentials to `.env.local`

### **Groq API Setup**

1. Sign up at [console.groq.com](https://console.groq.com) (free, no credit card)
2. Generate API key
3. Add to `.env.local` as `VITE_GROQ_API_KEY`

---

## 📊 Demo Credentials

### **Admin Account** (Hard-coded)
```
Email:    admin@example.com
Password: admin123
Role:     Admin (Knowledge Base + Monitoring)
```

### **Employee Accounts**
```
Option 1: Sign up with Google
Option 2: Sign up with Email (creates Firebase account)
```

---

## 🎮 Usage

### **Admin Workflow**

1. **Login** → `admin@example.com` / `admin123`
2. **Create Articles** → "Knowledge Base" tab → "+ Create Article"
3. **Monitor Employees** → "Employee Monitoring" tab
4. **Stop Chats** → Click "Stop Chat" button on active sessions

### **Employee Workflow**

1. **Login** → Google OAuth or Email signup
2. **Create Chat** → "+ New Chat" button
3. **Ask Questions** → Type in message input
4. **Get Answers** → AI responds from knowledge base only
5. **View History** → Messages persist automatically

---

## 📸 Screenshots

### Login Page
Professional dark-themed login with admin and employe sign-in tabs.

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/7c93c5b4-9746-402d-ae09-ed4fcc72f1ef" />

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/5af77055-011a-42cc-af6b-abad51815462" />

### Admin Dashboard
- **Knowledge Base Tab**: Table of articles with create/edit/delete

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/ba8f34b3-cf1a-4eb9-a809-8beb00f2760e" />

- **Monitoring Tab**: Real-time employee list and chat tracking

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/e7467fd2-14da-4267-804e-ebfd9795d329" />

### Employee Chat
- **Sidebar**: Chat sessions with active/ended status
- **Chat Window**: Messages with streaming animation

<img width="1920" height="1080" alt="Image" src="https://github.com/user-attachments/assets/6fa1a404-e3c7-4f40-8989-2851baf464f2" />

---

## 📦 Deployment

### **Deploy to Vercel**

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# vercel.com → Import repository

# 3. Set environment variables in Vercel dashboard
# VITE_FIREBASE_API_KEY, VITE_GROQ_API_KEY, etc.

# 4. Deploy
vercel deploy --prod
```

### **Live URL**
https://kb-chatbot-pi.vercel.app

---

## 🚦 Status & Features Roadmap

### ✅ **Completed**
- [x] Authentication (Admin + Employee)
- [x] KB Management (CRUD)
- [x] Employee Chat with AI
- [x] Admin Monitoring
- [x] Real-time Firestore sync
- [x] Professional UI/UX
- [x] Groq API integration
- [x] Vercel deployment

### 🔄 **Future Enhancements**
- [ ] PDF upload for KB articles (with text extraction)
- [ ] Chat search and filtering
- [ ] Chat summary generation
- [ ] Admin chat intervention (takeover)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom branding per company

---

## 🌟 Made with ❤️

Built with passion for enterprise-grade knowledge management and AI integration.

---

<div align="center">

### ⭐ If you found this helpful, please star the repository!

</div>
