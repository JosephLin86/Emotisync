# EmotiSync  

An AI-powered mental health analytics platform that enables therapists to gain data-driven insights into their clients' emotional well-being through automated journal analysis and wellness tracking.

## Features  

- 🔑 Role-based access control (therapist/client)  
- 🏠 Private therapy rooms  
- 🧠 AI-powered journal analysis using Claude API  
- 💬 Real-time messaging with Socket.io  
- 📊 Mood tracking and wellness scoring  
- 📈 Time-series emotional analytics (7-90 day trends)  
- 📁 Resource sharing via AWS S3  
- 🔒 JWT authentication  

## Tech Stack  

**Frontend:** React 19, Vite, Tailwind CSS 4, Socket.io  
**Backend:** Node.js, Express, MongoDB, Claude AI API, AWS S3  
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas  

## AI Pipeline  
```
Journal Entry → MongoDB → Claude API Analysis → Structured Emotional Data → 
Aggregation → Wellness Scoring (0-100) → Therapist Insights Dashboard
```

## Key Features

**AI Analysis:** Claude API extracts sentiment, emotions, intensity, and risk flags from journal entries  
**Wellness Scoring:** Multi-factor algorithm (mood, sentiment, stress, energy, volatility)  
**Real-time Chat:** Socket.io messaging with typing indicators  
**Analytics Dashboard:** Emotional patterns, trend analysis, risk assessment  

## License  

MIT

---

**GitHub:** https://github.com/JosephLin86/emotisync