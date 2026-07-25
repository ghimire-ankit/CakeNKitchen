# Memory Domain - Frontend Layer

## Client Layout & State
*   **Location:** `/cakenkitchen-frontend/`
*   **Tooling:** Powered by Vite React SPA.
*   **Layout Framework:** Uses an import hierarchy defined in `src/index.css` leveraging modular styling files (`src/styles/*.css`).
*   **State Containers:**
    *   `App.jsx`: Manages global user state, reactive shopping cart arrays (synced in `localStorage`), and system toasts.
    *   Route paths are parsed by `react-router-dom`.
*   **Key Pages:**
    *   `Home.jsx`: Asymmetrical designer hero, promotional banner, category filters, and live product catalog elements supporting e-commerce cart bounce micro-interactions.
    *   `CakeDetail.jsx`: Image gallery, pricing, custom weights selection (lbs), writing personalized frosting messages.
    *   `Cart.jsx`, `Checkout.jsx`, `AdminDashboard.jsx`.
