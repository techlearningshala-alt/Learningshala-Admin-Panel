# Resume Builder — Frontend Handoff

Standalone Resume Builder UI for the public website frontend.
This is **not** part of the admin panel.

## What’s included

```
resume-builder-frontend-handoff/
├── README.md
├── lib/
│   └── resumeApi.js              # API client (axios)
├── pages/
│   └── resume-builder/
│       ├── index.js              # Landing: blank / paste / upload
│       └── [id].js               # Editor + live preview + PDF download
└── components/
    └── resume-builder/
        ├── ResumeFormPanel.js     # Manual form editor
        └── ResumeWizardPanel.js   # Step wizard editor
```

## Dependencies

- Next.js (pages router)
- React
- axios
- react-hot-toast
- Tailwind CSS (class names used in UI)

Optional: `@/` path alias pointing to your `src/` (or update imports).

## Env

Set your Mentorship (-1) API base (same as CMS API base that mounts resumes):

```env
NEXT_PUBLIC_API_URL=https://YOUR-API-HOST/api/cms
```

Local default in `resumeApi.js`: `http://localhost:4000/api/cms`

## How to plug into Next.js site

1. Copy folders into your frontend `src/`:
   - `lib/resumeApi.js` → `src/lib/resumeApi.js`
   - `pages/resume-builder/` → `src/pages/resume-builder/`
   - `components/resume-builder/` → `src/components/resume-builder/`
2. Ensure `@/` alias maps to `src/` (jsconfig/tsconfig).
3. Add `NEXT_PUBLIC_API_URL` in `.env.local`.
4. Open: `/resume-builder`

## Routes

| Path | Purpose |
|------|---------|
| `/resume-builder` | Create resume (form / paste text / upload file) |
| `/resume-builder/[id]` | Edit + preview + download PDF |

## Backend API used (`resumeApi.js`)

Base: `{NEXT_PUBLIC_API_URL}`

| Method | Path | Use |
|--------|------|-----|
| GET | `/resumes/templates` | List templates |
| POST | `/resumes/generate` | Create blank / from text |
| POST | `/resumes/upload` | Upload file → parse |
| GET | `/resumes/:id` | Load resume |
| GET | `/resumes/:id/wizard` | Wizard state |
| POST | `/resumes/:id/wizard/step` | Submit wizard step |
| PUT | `/resumes/:id` | Update resume |
| POST | `/resumes/:id/chat` | Chat edit |
| GET | `/resumes/:id/preview/:templateKey` | HTML preview |
| GET | `/resumes/:id/download/:templateKey` | PDF download (blob) |

## Notes for frontend developer

- Uses Next.js **pages router** (`pages/`), not App Router.
- Preview is HTML from API rendered in an iframe/`dangerouslySetInnerHTML` pattern in `[id].js`.
- PDF download uses blob + browser download link.
- No admin auth required in this client — point `NEXT_PUBLIC_API_URL` at the Mentorship backend that hosts `/api/cms/resumes`.
- Keep CORS allowed from your website origin on the API.

## Share

Zip this folder and send to the website frontend developer:

```
resume-builder-frontend-handoff.zip
```
