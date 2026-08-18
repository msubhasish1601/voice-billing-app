# 🎙️ AI Voice Billing System

An intelligent, full-stack web application that allows users to generate, manage, and track invoices using natural language voice commands. Powered by **FastAPI**, **React**, **PostgreSQL**, and **Google's Gemini AI**, this system automatically parses voice transcripts to extract customer details, correct phonetic errors, and instantly generate line items with accurate pricing and quantities.

## ✨ Features

* **AI-Powered Voice Parsing:** Utilizes Gemini 3.1 Flash-Lite to extract customer names, normalize addresses, and bind prices/quantities to specific line items.
* **Acoustic Error Correction:** Automatically fixes phonetic mistakes from voice transcripts (e.g., "45 or Charlie" -> "45 Orchid Lane").
* **Incremental Item Addition:** Users can continuously add items to an existing invoice via sequential voice commands without overwriting previous data.
* **Full CRUD Functionality:** Create, Read, Update, and Delete invoices and their associated line items.
* **Server-Side DataGrid:** Highly performant, paginated, sortable, and searchable invoice listing directly querying the PostgreSQL database.
* **Relational Database Architecture:** Seamless parent-child data integrity between `bills` and `bill_items` using SQLAlchemy with cascading deletes.
* **Toast Notifications:** Lightweight, self-clearing UI feedback for database operations.

## 🛠️ Tech Stack

**Frontend**
* React (Vite)
* Axios (API Client)
* Lucide-React (Icons)
* Browser Web Speech API (Microphone Integration)

**Backend**
* Python 3.10+
* FastAPI (Web Framework)
* Uvicorn (ASGI Server)
* SQLAlchemy (ORM)
* Google GenAI SDK (LLM Integration)

**Database & Deployment**
* PostgreSQL (Hosted via Neon.tech)
* Render (Backend Hosting)

---

## 🚀 Local Setup Instructions

### Prerequisites
* Python 3.10 or higher
* Node.js and npm
* A Google Gemini API Key
* A PostgreSQL instance (Local or Neon.tech)

### 1. Backend Setup (FastAPI)

Navigate to the backend directory and set up your virtual environment:

```bash
cd backend
python -m venv .venv