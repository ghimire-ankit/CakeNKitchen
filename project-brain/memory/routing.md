# Memory Domain - Routing Map

## Frontend Routes (react-router-dom)
*   `/` : `Home` Page (General catalog display & filters)
*   `/cake/:id` : `CakeDetail` Page (Frosting message customization & configuration)
*   `/cart` : `Cart` Page (Weight/price adjustments, checkout review)
*   `/checkout` : `Checkout` Page (Address forms and payment select options)
*   `/login` : `Login` Page (JWT token distribution)
*   `/register` : `Register` Page (Registration form)
*   `/admin` : `AdminDashboard` Page (Exclusively accessible by `admin` users)

## Backend Routes (Express Mount `/api`)
*   `POST /auth/register` : User self-registration
*   `POST /auth/login` : Login verify
*   `GET /categories` : Category menu list
*   `GET /cakes` : Active catalog list
*   `GET /cakes/:id` : Cake detail lookup
*   `POST /orders` : Anonymous checkout orders submission
*   `GET /cakes/admin` : Protected (Admin only)
*   `POST /cakes` : Protected (Admin only)
*   `PATCH /cakes/:id/toggle` : Protected (Admin only)
*   `GET /orders` : Protected (Admin only)
*   `PATCH /orders/:id/status` : Protected (Admin only)
