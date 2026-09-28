# PlaceIntel

**A placement intelligence platform for tier-3 college students** — company drives, round-wise updates, prep resources, and AI-powered company research in one place, instead of scattered WhatsApp groups and PDFs.

> Final-year engineering project, built at the intersection of traditional backend engineering and agentic AI systems.

![Java](https://img.shields.io/badge/Java-25-orange) ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1-6DB33F) ![React](https://img.shields.io/badge/React-19-61DAFB) ![Python](https://img.shields.io/badge/Python-FastAPI-3776AB) ![LangGraph](https://img.shields.io/badge/LangGraph-agents-1C3C3C)

**Live demo:** `<add deployed frontend link>`
*(Free-tier hosting spins down when idle — the first request may take 30–50 seconds.)*

---

## Table of Contents

1. [The Problem](#the-problem)
2. [What It Does](#what-it-does)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Engineering Decisions](#engineering-decisions)
6. [Roadmap](#roadmap)
7. [Project Structure](#project-structure)
8. [Getting Started](#getting-started)
9. [Deployment](#deployment)
10. [Security Notes](#security-notes)
11. [Author](#author)

---

## The Problem

Placement information at tier-3 colleges is fragmented: drive announcements, eligibility criteria, interview rounds, and prep material live in chat groups, emails, and word of mouth. Students miss updates, and Training & Placement Officers (TPOs) have no structured way to manage drives end to end.

## What It Does

PlaceIntel gives colleges a structured, role-aware platform to manage placements, and gives students an AI research assistant to prepare for a specific company.

### Core platform
- **Three roles:** `ADMIN`, `TPO` (Training & Placement Officer), `STUDENT`
- **Full CRUD** for Users, Student Profiles, Companies, Drives (with nested Rounds), and Resources
- **Filterable search** across drives and companies using JPA Specifications
- **Verification gate:** unverified accounts are blocked by a custom `VerificationGateFilter`
- **Redis-backed rate limiting** on sensitive endpoints
- **Cloudinary integration** for image uploads (only the URL is stored in Postgres)
- **Clean API contracts:** Java record DTOs, a consistent `ApiResponse` wrapper, centralized exception handling

### AI company research
- LangGraph agent that researches a company on demand
- Live web search through Tavily; LLM reasoning through Groq
- Output mapped into a structured shape and rendered as Markdown in the UI

---

## Architecture

PlaceIntel is three independently deployable services.

```mermaid
flowchart TB
    subgraph Client["Frontend: client"]
        FE["React 19 + Vite<br/>Tailwind 4 + DaisyUI"]
    end

    subgraph Backend["Backend: Java / Spring Boot 4.1"]
        SEC["Spring Security<br/>JWT in HttpOnly cookies"]
        API["REST Controllers<br/>Services and Repositories"]
        RL["Rate Limiting"]
        SCH["Scheduler"]
        WC["WebClient"]
    end

    subgraph AI["AI Service: Python / FastAPI"]
        F["FastAPI (main.py)"]
        G["LangGraph agent<br/>(graph.py, agents.py, state.py)"]
        T["tools.py"]
        M["research_mapper.py"]
    end

    subgraph Ext["Data and External Services"]
        PG[("PostgreSQL")]
        RD[("Redis")]
        CL["Cloudinary"]
        GQ["Groq API<br/>LLM inference"]
        TV["Tavily API<br/>Web search"]
    end

    FE -->|"HTTPS / REST (axios)"| SEC
    SEC --> API
    API --> PG
    API --> CL
    RL --> RD
    API --- RL
    API --- SCH
    API --> WC
    WC -->|"internal HTTP"| F
    F --> G
    G --> T
    G --> GQ
    T --> TV
    G --> M
```

### How a request flows

1. The **React client** calls the Spring Boot API with axios; the JWT travels in an **HttpOnly cookie**.
2. **Spring Security** authenticates the request, `VerificationGateFilter` blocks unverified accounts, and **role-based access control** authorizes it.
3. Core data is served from **PostgreSQL**, with **JPA Specifications** powering filtered queries.
4. Sensitive endpoints are protected by **Redis-backed rate limiting**.
5. Image uploads go to **Cloudinary**; only the returned URL is stored.
6. Company-research requests are forwarded by the backend (via **WebClient**) to the **AI service**, where a **LangGraph** agent uses **Groq** for reasoning and **Tavily** for live search. The result is mapped into a structured response the frontend renders as Markdown.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, DaisyUI, Framer Motion, React Router 7, Axios, react-markdown + remark-gfm, Lucide icons |
| Backend | Java 25, Spring Boot 4.1.0, Spring Web MVC, Spring Data JPA, Spring Security, Bean Validation, WebClient, Lombok |
| Auth | JWT (jjwt 0.13) in HttpOnly cookies, three-role RBAC |
| Database | PostgreSQL (UUID primary keys) |
| Cache / rate limiting | Redis (Spring Data Redis) |
| Media storage | Cloudinary |
| AI service | Python, FastAPI, Uvicorn, Pydantic, LangGraph |
| LLM and search | Groq API, Tavily API |

---

## Engineering Decisions

- **HttpOnly cookies over localStorage** for JWTs, to reduce XSS exposure.
- **`VerificationGateFilter`** as a dedicated filter, keeping account-verification logic out of controllers.
- **Java records for DTOs** and an **`ApiResponse` wrapper**, so entities are never serialized directly (avoids circular references and leaking internals).
- **JPA Specifications** for composable, filterable queries instead of a growing set of repository methods.
- **`orphanRemoval` on drive rounds**, so nested rounds stay consistent when a drive is edited.
- **UUID primary keys** across all entities.
- **AI logic isolated in its own service**, called only by the backend, so LLM/search keys never reach the browser and the agent can evolve independently of the Java codebase.

---

## Roadmap

- [x] **Phase 1 — Backend foundation:** auth, RBAC, verification gate, CRUD for all core entities, filtering, rate limiting, Cloudinary uploads
- [x] **Company research agent:** LangGraph + Groq + Tavily, integrated with the backend and frontend
- [ ] **Phase 2 — RAG-based company research:** embeddings + `pgvector` in PostgreSQL, so the agent can ground answers in stored placement data alongside live web search
- [ ] **Production deployment:** see [Deployment](#deployment)

---

## Project Structure

```
placeintel/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── api/                # Axios instances and API calls
│       ├── assets/
│       ├── components/
│       ├── context/            # React context (e.g. auth state)
│       ├── pages/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/                    # Spring Boot service (com.rtx.placeintel)
│   └── src/main/java/com/rtx/placeintel/
│       ├── config/
│       ├── controller/
│       ├── dto/
│       ├── entity/
│       ├── exception/
│       ├── repository/
│       ├── scheduler/          # Scheduled jobs
│       ├── security/           # JWT, filters, RBAC
│       ├── service/
│       ├── util/
│       └── PlaceintelApplication.java
│
└── ai-service/                 # Python / FastAPI / LangGraph
    ├── main.py                 # FastAPI entry point
    ├── graph.py                # LangGraph graph definition
    ├── agents.py               # Agent nodes
    ├── state.py                # Graph state
    ├── tools.py                # Tavily search tool(s)
    ├── prompts.py              # System / task prompts
    ├── models.py               # Pydantic request/response models
    ├── research_mapper.py      # Maps raw agent output to the response schema
    ├── message_utils.py
    ├── config.py               # Settings / env loading
    ├── test_agent.py
    └── requirements.txt
```

---

## Getting Started

### Prerequisites
- Java 25 and Maven (wrapper included)
- Node.js 18+
- Python 3.11+
- PostgreSQL, Redis, a Cloudinary account
- Groq and Tavily API keys

### 1. Backend
```bash
cd backend
# Configure src/main/resources/application.yml with your own values:
#   datasource (PostgreSQL), Redis, Cloudinary credentials,
#   JWT secret, and the AI service base URL
./mvnw spring-boot:run
```

### 2. AI service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Create a .env file with GROQ_API_KEY and TAVILY_API_KEY
uvicorn main:app --reload --port 8000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev
```

> **Never commit secrets.** `application.yml` and `.env` must be gitignored. Commit a sanitized example file and keep real credentials in your hosting provider's environment variables.

---

## Deployment

Each service is deployed independently on free-tier infrastructure:

| Service | Host |
|---|---|
| Database | Neon PostgreSQL |
| AI service (FastAPI) | Render |
| Backend (Spring Boot) | Render |
| Frontend (React) | Vercel |

Configure each service through environment variables (datasource URL, JWT secret, Cloudinary, Redis, Groq/Tavily keys, and the AI service URL for the backend). Deploy in this order: database → AI service → backend → frontend, so each layer has its dependency's URL ready.

---

## Security Notes

- JWTs live in **HttpOnly cookies**, so client-side scripts cannot read them.
- Authorization is enforced **server-side** via Spring Security roles plus the verification gate; the client is never trusted.
- **Rate limiting** protects sensitive endpoints from abuse.
- The AI service is called by the backend only, so Groq and Tavily keys never reach the browser.

---

## Author

**Ritesh** — final-year student building at the intersection of backend engineering and agentic AI.
[LinkedIn](https://www.linkedin.com/in/riteshchavan2002/)
