
<img width="1920" height="1020" alt="Screenshot 2026-09-01 114003" src="https://github.com/user-attachments/assets/86b021cc-e1bf-4477-8e98-ac9213e0ebbc" />

# CleanSlate

CleanSlate is a Chrome extension that scans a Gmail inbox, classifies cleanup
candidates into useful categories, and lets the user review, label, archive, or
trash selected conversations. Protected senders are excluded before
classification.

## Repository layout

- `frontend/` — React and Vite Chrome extension side-panel interface
- `backend/` — Node, Express, Sequelize, Gmail API, and Google Gemini services

## Local development

Run the servers in separate terminals:

```bash
cd backend
npm install
npm start
```

```bash
cd frontend/CleanSlate_sidebar
npm install
npm run dev
```

Create the required local environment files from the examples supplied in each
application. Never commit credentials or API keys.

## Project history

CleanSlate was developed as a collaborative capstone project. This personal
monorepo preserves the frontend and backend Git histories from the original
team repositories:

- [CleanSlate frontend](https://github.com/Capstone-III-CleanSlate/CleanSlate_frontend)
- [CleanSlate backend](https://github.com/Capstone-III-CleanSlate/CleanSlate_backend)
