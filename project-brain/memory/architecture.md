# Memory Domain - Architecture

## Structure & Data Flow
CakeNKitchen operates as a decoupled client-server architecture:

```
                  ┌───────────────────┐
                  │   Vite React SPA  │
                  └─────────┬─────────┘
                            │ (Axios API Client + JWT)
                  ┌─────────▼─────────┐
                  │  Express Node API │
                  └─────────┬─────────┘
                            │ (MySQL2 Promise Connection Pool)
                  ┌─────────▼─────────┐
                  │ MySQL (Aiven/DB)  │
                  └───────────────────┘
```

### Module Boundaries
*   `cakenkitchen-frontend/`: Client build outputs (`/src`, `/public`).
*   `cakenkitchen-backend/`: Server infrastructure (`/src/config`, `/src/middleware`, `/src/controllers`, `/src/models`, `/src/routes`).
