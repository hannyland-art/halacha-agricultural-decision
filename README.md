# מצוות התלויות בארץ — Halachic Agricultural Decision Platform

A web application that helps users evaluate halachic questions related to plants and trees, starting with the topic of **Orlah (עורלה)**.

> ⚠️ This is a guidance tool only, not a final halachic ruling system. Every result includes a disclaimer recommending consultation with a rabbi.

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Lucide React icons
- **Backend:** Node.js, Express.js
- **Data:** Mock in-memory JSON data (structured for easy DB migration)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

**1. Start the server:**

```bash
cd server
npm install
npm start
```

The API will be available at `http://localhost:3001`.

**2. Start the client (in a separate terminal):**

```bash
cd client
npm install
npm run dev
```

The client will be available at `http://localhost:5173`.

### Mock Users

| Email              | Role  |
|--------------------|-------|
| hannah@example.com | user  |
| admin@example.com  | admin |

## Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components (AIAssistant, DecisionPath)
│   │   ├── hooks/             # Custom hooks (useAuth)
│   │   ├── layouts/           # Layout components (MainLayout)
│   │   ├── pages/             # Page components
│   │   │   ├── admin/         # Admin pages
│   │   │   └── ...            # Public & user pages
│   │   ├── services/          # API service layer
│   │   └── utils/             # Utility functions
│   └── index.html
├── server/                    # Node.js backend
│   ├── src/
│   │   ├── data/              # Mock JSON data files
│   │   ├── routes/            # Express route handlers
│   │   ├── services/          # Business logic (rulesEngine, aiExtractor)
│   │   └── middleware/        # (Placeholder for auth middleware)
│   └── package.json
└── README.md
```

## Features

- 🌱 Guided Orlah decision wizard with dynamic questions
- 📊 Visual decision path showing how the result was reached
- 🤖 AI assistant for natural language parameter extraction
- 🌿 Plant record management (My Plants)
- ⚙️ Admin configuration screens (Modules, Questions, Rules, Templates)
- 🔐 Mock authentication (login/register UI)
- 🇮🇱 Full Hebrew RTL UI
- 📱 Responsive layout

## API Endpoints

| Method | Path                         | Description                     |
|--------|------------------------------|---------------------------------|
| GET    | /api/modules                 | List active modules             |
| GET    | /api/modules/:code/questions | Get questions for a module      |
| GET    | /api/plants                  | List plants                     |
| GET    | /api/plants/:id              | Get plant details               |
| POST   | /api/plants                  | Create a plant                  |
| POST   | /api/decision/evaluate       | Evaluate answers against rules  |
| POST   | /api/ai/extract-parameters   | Extract params from free text   |
| POST   | /api/auth/login              | Mock login                      |
| POST   | /api/auth/register           | Mock register                   |
| GET    | /api/admin/stats             | Admin dashboard stats           |
| GET    | /api/admin/modules           | Admin modules list              |
| GET    | /api/admin/questions         | Admin questions list            |
| GET    | /api/admin/rules             | Admin rules list                |
| GET    | /api/admin/result-templates  | Admin result templates          |

## Pages

### Public
- **/** — Homepage with hero, features, modules
- **/check** — Start a new check
- **/wizard/orlah** — Orlah decision wizard
- **/result** — Result page with decision path
- **/login** — Login page
- **/register** — Register page
- **/about** — FAQ & About

### Authenticated
- **/my-plants** — Saved plants list
- **/plants/:id** — Plant details with history

### Admin
- **/admin** — Dashboard with stats
- **/admin/modules** — Manage modules
- **/admin/questions** — Manage questions
- **/admin/rules** — Manage rules & rule sets
- **/admin/templates** — Manage result templates
