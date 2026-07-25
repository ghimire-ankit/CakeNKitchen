# Project Brain v2 - System Configuration

## Global Engineering Workflow
Defines how the AI runtime handles engineering prompts deterministically.

### Core Constraints
1. **Zero Monolithic Context:** Never load lists of whole files unless requested.
2. **Strict Flow Order:** Always progress in sequence: Classification -> Retrieval -> Planning -> Execution -> Validation -> Review -> Sync.
3. **No Dynamic Logic:** This file is static. Do not write feature code or architecture here.

***
*Project Brain v2 Runtime Engine - Activating Node Graph*
