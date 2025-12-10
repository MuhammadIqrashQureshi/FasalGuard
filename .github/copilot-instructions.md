# FasalGuard — Copilot / AI Agent Instructions

Purpose: give AI coding agents the minimal, actionable knowledge to be productive in this repo.

- **Project layout (big picture):**
  - Frontend: React app in the repository root `src/` (single-page UI). Key files: `src/App.js`, `src/PredictionResults.js`, `src/WeatherVisualizations.js`, `src/IrrigationCalculator.js`, `src/CropComparisonMatrix.js`, `src/components/SoilTrends.js`.
  - Backend API: Node + Express in `backend/`. Key entry: `backend/server.js`. Routes live in `backend/routes/`, business logic in `backend/controllers/`, models in `backend/models/`, helpers in `backend/utils/`.
  - ML microservice: Python Flask service in `backend/ml_service/` (`app.py`, `model_predictor.py`, `requirements.txt`). Trained model files live under `backend/ml_models/` (e.g. `*_lstm_model.h5` / `*_gru_model.h5`).

- **Data flow & integration points:**
  - Frontend gathers `inputData` and/or `predictionData` and passes `city` down to components via props (see `src/App.js` and `src/PredictionResults.js`). Example: `city={predictionData?.location?.city || inputData?.city}`.
  - Backend exposes `/api/predict` routes and additional endpoints. `backend/server.js` also exposes `/api/weather` which uses `app.locals.weatherController` (see `backend/controllers/weatherController.js`) — this endpoint requires a `city` query param.
  - The ML microservice (`backend/ml_service/app.py`) exposes endpoints such as `/api/weather` and prediction endpoints; it may be called directly by the backend or used during development. Check `backend/ml_service/app.py` for parameter expectations (e.g. `request.args.get('city')` or `data.get('city')`).

- **Common patterns and conventions used in this repo:**
  - `app.locals` is used to attach shared helpers in `backend/server.js` (e.g. `getCropSpecificRecommendations`, `generateRealisticWeather`). Use `app.locals.*` rather than importing helpers everywhere when editing backend routes.
  - Controllers return plain JS objects and route handlers wrap results into `{ success: true/false, ... }` responses. Follow this response shape when adding endpoints.
  - Frontend uses conditional chaining heavily (`?.`) and passes props down to visual components — missing data upstream will surface as blank UI.
  - The ML microservice is a lightweight Flask app used for mocked or real ML endpoints; its responses are shaped to match frontend expectations (see `backend/ml_service/app.py` returning `forecast` and `city`).

- **How to run & debug locally (developer workflows):**
  - Frontend (root):
    - `npm install` (once)
    - `npm start` — React dev server (localhost:3000 by default)
  - Backend (server):
    - `cd backend`
    - `npm install` (once)
    - `npm run dev` (uses `nodemon`) or `node server.js` to start API (localhost:5000 by default)
  - ML microservice (Python):
    - `cd backend/ml_service`
    - Create venv and install: `python -m venv venv && source venv/Scripts/activate && pip install -r requirements.txt` (Windows Git Bash uses `venv/Scripts/activate`)
    - Run: `python app.py` (Flask app prints endpoints and logs)

- **Environment & config files:**
  - Two main env files exist: root `config.env` and `backend/config.env`. Most backend env vars are read by `server.js` via `dotenv`. Ensure `MONGO_URI` / `MONGODB_URI` and `JWT_SECRET` are set.

- **Where to look when UI shows blank outputs for weather/irrigation/crop matrix:**
  - Trace `city` upstream: start at `src/App.js` (where `predictionData` and `inputData` live), then `src/PredictionResults.js` (which composes the child pages), then the child component (e.g. `src/WeatherVisualizations.js`, `src/IrrigationCalculator.js`, `src/CropComparisonMatrix.js`). Example suspicious expression: `city={predictionData?.location?.city || inputData?.city}` — if both are undefined, children get no `city`.
  - Confirm backend weather endpoints accept and require `city`. In `backend/server.js` `/api/weather` returns 400 if `city` missing. Also inspect `backend/ml_service/app.py` which has its own `/api/weather` expecting `city` as query arg.
  - Check where frontend calls the backend: if components rely on `predictionData` but the prediction API fails or returns different shape, UI will be empty. Search for `fetch`/`axios` calls in `src/` (e.g. where `predictionData` is set).

- **Examples of concrete edits an agent might make:**
  - Add runtime guard in `src/App.js` or `src/PredictionResults.js` to fallback to a sensible default city (e.g. `'Lahore'`) or display a clear message when `city` is missing.
  - Ensure any frontend API calls include `?city=${encodeURIComponent(city)}` when calling `/api/weather` or related endpoints.
  - When adding backend endpoints that need helpers, attach them via `app.locals` or reuse `backend/utils/*` helpers to stay consistent.

- **Testing & quick checks:**
  - Health-check: `GET http://localhost:5000/api/health`.
  - Backend weather: `GET http://localhost:5000/api/weather?city=Lahore&days=7` (must return success JSON).
  - ML service weather (if running standalone): `GET http://localhost:PORT/api/weather?city=Lahore` — check `backend/ml_service/app.py` for its port (it prints on startup).

- **When merging changes:**
  - Preserve response shapes used by frontend (`{ success, forecast, summary, city }`) to avoid breaking existing components.
  - Keep controller logic in `backend/controllers/` and minimal express route glue in `backend/routes/`.

If any section is unclear or you want more detailed examples (small diffs to fix missing `city` flow, or a health-check script), tell me which area to expand and I will iterate.
