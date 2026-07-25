# Memory Domain - API Specifications

## Outbound Network Client
*   **Location:** `/src/services/api.js` using Axios module.
*   **Base URL:** Pointed to `VITE_API_URL` environment variables with local dev fallback.
*   **Token Interception:** Automatically pulls JWT from `'token'` key in `localStorage` and appends it to header parameters.

```javascript
headers: {
  'Authorization': 'Bearer <Token>'
}
```

### Action Operations
*   `registerUser(userData)`
*   `loginUser(credentials)`
*   `fetchCategories()`
*   `fetchCakes(catId)`
*   `fetchCakeById(id)`
*   `placeOrder(orderData)`
*   *Protected admin routines: `fetchAdminCakes()`, `createCake()`, `toggleCakeAvailability()`, `fetchAdminOrders()`, `updateOrderStatus()`.*
