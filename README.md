# FUDD Financial Models Studio

A lightweight **financial modeling studio**: a Next.js (TypeScript) web UI backed by a FastAPI service that runs common corporate-finance models with **clean JSON inputs** and **deterministic outputs** (no spreadsheet copy/paste).

Deployed setup in this repo:
- Frontend: **Netlify** (`netlify.toml`)
- Backend: **Render** (`render.yaml`)

> Disclaimer: This project is for learning/demonstration. It is **not** investment advice and is **not** production-hardened.

---

## What’s included

### Models (API + UI)
- **LBO**: purchase/exit multiples, senior + sub debt, debt schedule, **IRR** and **MoM**
- **Reverse DCF**: implied growth rate solver given price + FCF assumptions
- **Comparable Company Analysis (Comps)**: simplified valuation range from peer metrics
- **Monte Carlo Simulation**: run many scenarios and return distribution/percentiles
- **M&A Accretion/Dilution**: pro-forma EPS impact
- **Financial Model Generator**: simple projection of financial statements from assumptions

### Frontend features
- Dashboard for each model
- Scenario save/load (localStorage) on some pages
- Exports (varies by model): **JSON / CSV / PDF**
- Charts for Monte Carlo results

---

## Repo layout

```
/
  fudd-backend/     # FastAPI service (Python)
  fudd-frontend/    # Next.js app (TypeScript)
  netlify.toml      # Netlify build/deploy config (frontend)
  render.yaml       # Render service definition (backend)
```

---

## Tech stack

**Frontend (`fudd-frontend`)**
- Next.js 14 + React 18 + TypeScript
- TailwindCSS + shadcn/ui + Radix UI
- Zustand (state)
- Recharts (visualization)
- papaparse (CSV) + pdfmake (PDF)

**Backend (`fudd-backend`)**
- FastAPI + Uvicorn
- Pydantic v2 validation

---

## Quickstart (local development)

### 1) Backend (FastAPI)

From the repo root:

```powershell
cd fudd-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Verify:
- Health: `http://localhost:8000/health`
- OpenAPI docs: `http://localhost:8000/docs`

### 2) Frontend (Next.js)

From the repo root:

```powershell
cd fudd-frontend
npm install
```

Create `fudd-frontend/.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Run:

```powershell
npm run dev
```

Open:
- `http://localhost:3000`

---

## API overview

Base URL (local): `http://localhost:8000`

Endpoints implemented in `fudd-backend/main.py`:
- `GET /` and `GET /health`
- `POST /api/v1/login` (mock login)
- `POST /api/v1/lbo`
- `POST /api/v1/reverse-dcf`
- `POST /api/v1/comps`
- `POST /api/v1/financial-model`
- `POST /api/v1/monte-carlo`
- `POST /api/v1/m-and-a`

### Example: LBO (curl)

**Bash/zsh**

```bash
curl -s http://localhost:8000/api/v1/lbo \
  -H "Content-Type: application/json" \
  -d '{"ebitda":100000,"ebitda_growth_rate":0.05,"purchase_ebitda_multiple":8,"exit_ebitda_multiple":8,"senior_debt_percent":0.5,"senior_interest_rate":0.08,"sub_debt_percent":0.25,"sub_interest_rate":0.12,"holding_period_years":5,"initial_equity_percent":0.25}'
```

**PowerShell**

```powershell
$body = @{
  ebitda = 100000
  ebitda_growth_rate = 0.05
  purchase_ebitda_multiple = 8
  exit_ebitda_multiple = 8
  senior_debt_percent = 0.5
  senior_interest_rate = 0.08
  sub_debt_percent = 0.25
  sub_interest_rate = 0.12
  holding_period_years = 5
  initial_equity_percent = 0.25
} | ConvertTo-Json

Invoke-RestMethod http://localhost:8000/api/v1/lbo -Method Post -ContentType "application/json" -Body $body
```

For full request/response schemas, use:
- `GET /openapi.json`
- `GET /docs`

---

## Deployment

### Netlify (frontend)
`netlify.toml` builds the Next.js app from `fudd-frontend`:
- build: `npm run build`
- publish: `.next`
- plugin: `@netlify/plugin-nextjs`

Set environment variable in Netlify:
- `NEXT_PUBLIC_API_BASE_URL` → your deployed backend URL

### Render (backend)
`render.yaml` provisions a Python web service:
- build: `pip install -r requirements.txt`
- start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Notes / non-production caveats

This repo is intentionally demo-friendly. If you plan to productionize it, prioritize:
- Replace mock auth (`/api/v1/login`) with real auth + secure token storage
- Tighten CORS (avoid `allow_origins=["*"]` with credentials)
- Add input validation/guardrails for edge cases and extreme values
- Add tests for model correctness and regression

---

## License

Add a license if you plan to open-source this project.
