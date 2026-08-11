# Engineering Standards - React & Vite

1. **State Locality:** Keep state scoped as close to the target component as possible. Use local storage sync only for cart arrays or auth credentials.
2. **Prop Drilling:** Avoid hierarchies deeper than 3 levels.
3. **Styling Principles:** Use predefined global tokens from `base.css` (e.g. `--primary`, `--dark`).
