# Copilot Project Instructions

---

# 🏗 Architecture Overview

This project follows a modular, feature-based architecture.

All business features must live inside:

- src/modules/

Each module is self-contained and may contain:

- components/
- hooks/
- services/
- store/
- types/
- pages/
- utils/
- index.ts (public exports only)

Shared/global logic lives in:

- src/components → reusable UI components
- src/hooks → shared hooks
- src/services → shared API logic
- src/store → global Zustand stores
- src/utils → shared utilities
- src/types → shared types
- src/config → configuration
- src/routes → route definitions
- src/layouts → layout components
- src/constants → constants
- src/contexts → React contexts
- src/api → API configuration layer
- src/lib → shared library setup

Do NOT mix module-specific logic into global folders.
Do NOT access internal files of another module directly.
Only use public exports.

---

# 🧰 Tech Stack (Strict – Do Not Suggest Alternatives)

- React 19 + TypeScript (strict mode)
- Vite
- Zustand (global state management)
- TanStack React Query v5 (server state)
- Axios (HTTP client – required)
- React Router v6
- Zod (schema validation)
- React Hook Form (forms)
- TailwindCSS (styling)

Do not suggest Redux, SWR, fetch, or alternative libraries.

---

# 📦 State Management Rules

- Server data → React Query only
- Global app state → Zustand
- Local component state → useState
- API calls → Axios only
- Validation → Zod only
- Forms → React Hook Form + Zod resolver

Always handle:
- loading state
- error state
- empty state (if applicable)

---

# 🧼 Code Quality Standards

Strictly enforce:

- No console.log()
- No mock data
- No fake APIs
- No placeholder implementations
- No unused imports or variables
- No `any` type
- No implicit any
- No untyped function parameters
- No business logic inside UI components
- No large monolithic components

Required:

- Strict TypeScript typing
- Proper return types
- Clear naming conventions
- Separation of concerns
- Reusable abstractions
- Scalable structure
- Clean architecture principles

Extract:
- Business logic → hooks
- API logic → services
- Global state → store
- Validation schemas → separate files

---

# 💬 Commenting Rules (Mandatory)

- Every function must have a short professional description above it.
- Custom hooks must explain responsibility and side effects.
- Complex logic must include inline explanation comments.
- Comments must be concise and meaningful.
- Do NOT over-comment obvious code.
- Do NOT add decorative or useless comments.


# 🧠 Multi-Role Internal Development Workflow

When generating code, internally follow this structured process before returning the final result.

## 1️⃣ Senior Frontend Engineer Phase

- Implement scalable, production-ready React + TypeScript code.
- Follow modular architecture strictly.
- Use Zustand for global state.
- Use React Query v5 for server state.
- Use Axios for API calls.
- Apply strict typing.
- Keep separation of concerns.
- Extract business logic into hooks.
- Keep components clean and focused.

---

## 2️⃣ Tech Lead Review Phase

Before finalizing the output, review the implementation and:

- Ensure no console.log() exists.
- Ensure no mock data or fake APIs.
- Ensure no `any` types.
- Ensure proper folder placement.
- Verify separation of concerns.
- Improve naming consistency.
- Remove duplicated logic.
- Improve maintainability and scalability.
- Ensure the solution aligns with the existing architecture.
- Ensure public APIs are properly exported via index.ts.

If issues are found, refactor internally before returning the final result.

---

## 3️⃣ QA / Tester Validation Phase

Before returning the final answer, validate:

- Loading state exists where needed.
- Error state is handled properly.
- Empty states are handled where applicable.
- Async logic has proper error handling.
- No unhandled promise rejections.
- React hooks dependency arrays are correct.
- Edge cases are considered.
- Types are safe and complete.
- No unused variables or imports exist.

Return ONLY the final improved version.
Do NOT show intermediate review steps.
Do NOT explain reasoning unless explicitly requested.

# 📤 Output Rules

- Return production-ready code only.
- No explanations unless explicitly requested.
- No unnecessary text.
- Follow project standards strictly.