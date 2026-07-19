# ❤️ RapidAid AI

> AI-powered Emergency Triage & First Aid Assistant

RapidAid AI is a full-stack AI-powered healthcare web application that helps users assess the severity of their symptoms, receive first-aid recommendations, identify possible medical conditions, and determine the appropriate healthcare specialist using Artificial Intelligence.

Developed for the **NxtWave IDEA2IMPACT Online Hackathon 2026**.

---

## 🚀 Features

- 🤖 AI-powered symptom analysis
- 🩺 First-aid recommendations
- 📊 Severity assessment
- 📋 Possible medical causes
- 👨‍⚕️ Recommended medical specialist
- 🔐 Secure user authentication (JWT)
- 👤 User registration & login
- 🔑 Password reset
- 📄 Automatic report history
- 📥 Download reports as PDF
- 🗑 Delete reports
- 💾 SQLite database integration
- 📱 Fully responsive UI
- 🆘 Emergency guidance
- ⚡ Mock AI fallback when Gemini quota is exceeded

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- React Router
- CSS3
- Responsive Design

### Backend
- Flask
- Flask Blueprints
- Flask-JWT-Extended
- Flask-Bcrypt
- SQLAlchemy
- SQLite

### AI
- Google Gemini API
- Mock AI Fallback System

---

## 📂 Project Structure

```
RapidAid-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── database/
│   ├── utils/
│   ├── app.py
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
cd RapidAid-AI
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on:

```
http://127.0.0.1:5000
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
GEMINI_API_KEY=your_api_key_here
JWT_SECRET_KEY=your_secret_key
SECRET_KEY=your_flask_secret
```

---

## 📸 Screens

- Home
- Authentication
- Symptom Analysis
- AI Results
- Reports Dashboard
- PDF Export
- Responsive Mobile UI

---

## 🎯 Problem Statement

Many people struggle to determine the urgency of their medical symptoms during emergencies.

RapidAid AI helps users:

- Understand symptom severity
- Receive first-aid guidance
- Learn possible medical conditions
- Identify the appropriate healthcare specialist
- Store previous analysis reports securely

---

## 🛡 Disclaimer

RapidAid AI is designed for educational and informational purposes only.
It is **not** a substitute for professional medical advice, diagnosis, or treatment.
Always consult a qualified healthcare professional during medical emergencies.

---

## 🚀 Future Improvements

- Hospital Locator
- Nearby Emergency Services
- Voice-based Symptom Input
- Multi-language Support
- Doctor Appointment Integration
- Medical Report Upload
- OCR Prescription Scanner
- AI Chat Assistant

---

## 👨‍💻 Developer
**Sai Harish Tiruvidhula**

B.Tech CSE Student
Frontend Developer | Aspiring Software Engineer

---

## 🏆 Hackathon

NxtWave IDEA2IMPACT Online Hackathon 2026

Theme:
**Crisis Management • HealthTech • Emergency Response**

---

## 📄 License

This project is developed for educational and hackathon purposes.
