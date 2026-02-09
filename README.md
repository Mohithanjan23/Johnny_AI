# JohnnyAI 🤖

**JohnnyAI** is a voice-interactive personal AI assistant that brings science fiction into reality. Built with a modern tech stack, it features a responsive React frontend with speech capabilities and a robust FastAPI backend powered by Google's Gemini Pro LLM.

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- **🗣️ Voice Interaction**: Real-time Speech-to-Text (STT) and Text-to-Speech (TTS) using the Web Speech API.
- **🧠 Advanced Intelligence**: Powered by Google's **Gemini Pro**, providing context-aware and natural responses.
- **🎨 Dynamic UI**: A beautiful, dark-themed interface built with **React** and **Tailwind CSS**.
- **🔐 Secure Authentication**: Magic link sign-in via **Supabase**.
- **⚡ Fast Performance**: Backend driven by **FastAPI** for low-latency responses.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Visuals**: Three.js (Canvas Background), React Feather (Icons)
- **State/Auth**: Supabase Client

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn
- **AI Model**: Google Gemini Pro (`google-generativeai`)
- **Configuration**: Pydantic Settings

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10+)
- **Supabase Account** (for Auth)
- **Google Cloud API Key** (for Gemini)

### 1. Clone the Repository
```bash
git clone https://github.com/Mohithanjan23/JohnnyAI.git
cd JohnnyAI
```

### 2. Backend Setup
Navigate to the backend directory and set up the environment.

```bash
cd johnny_backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**Configuration**:
Create a `.env` file in `johnny_backend/` and add your keys:
```env
SUPABASE_URL="your_supabase_url"
SUPABASE_KEY="your_supabase_anon_key"
GEMINI_API_KEY="your_google_gemini_api_key"
```

Start the server:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies.

```bash
cd johnny_frontend
npm install
```

**Configuration**:
Create a `.env.local` file in `johnny_frontend/` and add your Supabase keys:
```env
VITE_SUPABASE_URL="your_supabase_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

Start the development server:
```bash
npm run dev
```

## 🖥️ Usage

1.  Open your browser to `http://localhost:5173`.
2.  Log in using your email (Magic Link).
3.  Click the **Mic** icon to start speaking to Johnny.
4.  Johnny will process your voice, query Gemini Pro, and respond back with voice and text!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
