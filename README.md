# ⚖️ VerdictFlow

### 🚀 AI-Powered Court Judgment Analysis & Compliance System

**VerdictFlow** is a production-ready, AI-powered platform designed for government use in India 🇮🇳.
It transforms complex, unstructured court judgment PDFs into **verified, structured, and actionable compliance plans** using a powerful **4-stage AI pipeline** powered by Google Gemini 1.5 Pro.

---

## ✨ Key Features

### 📄 Smart PDF Intelligence

* Upload court judgments and instantly extract structured insights
* Handles complex legal language with high accuracy

### 🤖 AI Action Plan Generator

* Converts judgments into:

  * ✅ Compliance steps
  * ⚖️ Appeal strategies
  * 📌 Execution plans

### 📊 Case Lifecycle Tracking

* Track:

  * 📅 Deadlines
  * 🔄 Status updates
  * ⏳ Critical timelines

### 👨‍⚖️ Human-in-the-Loop Verification

* Legal professionals can:

  * Review AI outputs
  * Approve or refine decisions

### 🏛️ Department-Level Insights

* Automatically distributes tasks across departments
* Clear visualization of responsibilities

### 🎨 Premium UI/UX

* Smooth transitions with Framer Motion
* Clean, modern government-grade interface

---

## 🧠 How It Works

1. 📥 **Upload PDF**
2. 🔍 **AI Extraction (Gemini)**
3. 🧾 **Structured Insight Generation**
4. 📋 **Action Plan + Verification**

---

## 🛠️ Tech Stack

| Category       | Technology                          |
| -------------- | ----------------------------------- |
| ⚙️ Framework   | Next.js 14 (App Router)             |
| 💻 Language    | TypeScript                          |
| 🎨 Styling     | Tailwind CSS + shadcn/ui            |
| 🗄️ Database   | Supabase (PostgreSQL + Storage)     |
| 🤖 AI Model    | Google Gemini API (`@google/genai`) |
| 🎞️ Animations | Framer Motion                       |

---

## ⚡ Prerequisites

Before running the project, ensure you have:

* 🟢 Node.js 18+
* 🗄️ Supabase Project
* 🔑 Google Gemini API Key

---

## 🚀 Getting Started

### 1️⃣ Database Setup

* Open your Supabase Dashboard
* Go to **SQL Editor**
* Copy the contents of `supabase/schema.sql`
* Paste and run the script

---

### 2️⃣ Environment Variables

Create a `.env.local` file:

```bash
cp .env.local.example .env.local
```

Add your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key  
GEMINI_API_KEY=your_gemini_api_key  
```

---

### 3️⃣ Install Dependencies

```bash
npm install
```

---

### 4️⃣ Run the App

```bash
npm run dev
```

🌐 Open: http://localhost:3000

---

## 📁 Project Structure

```
📦 VerdictFlow  
├── app/  
│   ├── (auth)/           🔐 Authentication pages  
│   ├── (dashboard)/      📊 Main dashboard & features  
│   ├── api/              ⚡ Backend API routes  
│  
├── components/  
│   └── ui/               🎨 Reusable UI components  
│  
├── lib/  
│   ├── gemini/           🤖 AI integration & prompts  
│   ├── supabase/         🗄️ DB clients & config  
│  
├── supabase/  
│   └── schema.sql        📜 Database schema  
```

---

## 🎯 Design Philosophy

* 🟦 Government-grade aesthetic
* 🌙 Dark-mode ready
* 🎯 Clean typography & spacing
* ⚡ Micro-interactions for better UX

---

## 🌐 Connect With Me

* 💻 GitHub: https://github.com/debanjan100
* 🔗 LinkedIn: https://www.linkedin.com/in/debanjanghorui5567/

---

## ⭐ Future Improvements

* 📌 Role-based access control
* 📊 Advanced analytics dashboard
* 🌍 Multi-language legal support
* 🔔 Smart notifications & alerts

---

## 📌 Why VerdictFlow?

* ⚡ Saves hours of manual legal analysis
* 🎯 Improves decision accuracy
* 🏛️ Built for real government workflows
* 🤖 Combines AI + Human verification for reliability

---

## 🧩 License

This project is open-source and available under the **MIT License**.

---

## ⭐ Support

If you found this project useful:

* ⭐ Star the repo
* 🍴 Fork it
* 🤝 Contribute

---
