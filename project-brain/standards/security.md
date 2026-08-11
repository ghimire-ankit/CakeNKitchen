# Engineering Standards - Security

1. **Authorization:** All admin endpoints (e.g. backend routes modifying catalog or loading transactions) MUST include token matching middlewares (`authenticateToken`, `isAdmin`).
2. **Secrets:** Never write API keys or SQL hosts directly inside commits; parse dynamically using `process.env`.
3. **Data Sanitization:** Sanitize database parameters using parameterized pools.
