# Project Brain v2 - Planner Configuration

## Planning Orchestration Pipeline
Defines task evaluation and orchestration.

### Steps
1. **Decomposition:** Break user prompts into distinct steps.
2. **Complexity Mapping:** Define if task is Low / Medium / High impact.
3. **Risk Analysis:** Check if updates impact critical authentication, payment, or database constraints.
4. **Rollback Strategy:** Document command backups (e.g. Git hashes) prior to execution.
