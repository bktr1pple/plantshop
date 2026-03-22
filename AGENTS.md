# AGENTS.md

## Project overview
This repository contains a mini e-commerce project with:
- frontend: Next.js
- backend: NestJS

Treat this repository as a real product codebase, not as a demo or tutorial project.

## Working language
- Always write explanations, summaries, reports, plans, reviews, and implementation notes in Ukrainian.

## General behavior
- First understand the architecture, module boundaries, request flow, auth flow, and environment configuration.
- Always reference actual files and folders.
- Do not invent missing details; explicitly mark uncertainty.
- Prefer concise, technically precise, and practical explanations.
- Be strict, realistic, and evidence-based.
- Treat suspicious, temporary, demo, legacy, experimental, or misleading code as potential technical debt unless proven otherwise.

## Product decisions already made
- Registration must automatically log in the user, but only through the backend creating a real authenticated session.
- Frontend must never fake authenticated state after registration.
- Protected dashboard routes must not be accessible when auth verification fails.
- `admin-test` is a prototype / draft and should not be treated as a real production admin area.
- `/plants` read endpoints may remain public.
- `/plants` write endpoints (POST/PATCH/DELETE) must not remain public.
- Experimental routes should not remain in the production app router.
- Local development backend base URL is `http://localhost:3001`.
- Frontend local client API base URL should be `http://localhost:3001`.
- Frontend local internal SSR API base URL should be `http://localhost:3001`.
- Production URLs may differ and must be handled explicitly through environment variables.
- If `backend/src/generated` is not part of the real runtime, it should be treated as removable after verifying imports/usages.

## Review priorities
When reviewing this repository, pay special attention to:
- frontend/backend integration
- authentication and session consistency
- authorization and route protection
- DTO validation and request validation
- business logic correctness
- API contracts and request flow
- state management consistency
- error handling
- type safety
- dead code, duplicated code, and outdated patterns
- temporary, test, experimental, or legacy files
- configuration problems and environment variable usage
- security risks and production-readiness

## Analysis rules
- Before making conclusions, identify the relevant entry points and dependencies.
- Distinguish clearly between facts, strong assumptions, and open questions.
- If code intent is unclear, say so directly.
- If behavior depends on runtime, environment, database state, cookies, deployment topology, or external configuration that is not available in the repository, mark it as requiring manual verification.
- Prefer file-based evidence over guesswork.

## Development rules
- Do not change code unless explicitly asked.
- Do not install dependencies unless explicitly asked.
- Do not run migrations unless explicitly asked.
- Do not start dev servers unless absolutely necessary for understanding structure or confirming a critical issue.
- Do not redesign architecture unless explicitly asked.
- Prefer minimal, targeted, production-oriented patches instead of large rewrites.
- Do not rewrite large files from scratch unless absolutely necessary.
- Before editing, identify entry points, auth flow, API integration, and environment configuration.
- Pay special attention to frontend/backend interaction, authentication, DTOs, entities, guards, middleware, and config files.

## Environment rules
- Separate local development assumptions from production assumptions.
- Do not mix local and production base URLs in one implicit contract.
- If environment variables are inconsistent, normalize them around a single explicit contract and clearly report the chosen rule.

## Code review rules
When asked to perform a code review:
- review the whole repository as a senior production engineer
- identify bugs, incomplete features, bad practices, architecture inconsistencies, validation gaps, auth/session issues, security problems, suspicious business logic, dead code, duplicated code, outdated patterns, weak typing, and unfinished or misleading files
- group findings by severity
- for each issue explain:
  1. what is wrong
  2. where it is
  3. why it matters
  4. how it should ideally be fixed
  5. whether it is safe for automatic fixing or requires manual/product decision
- separate safe quick wins from risky changes
- prioritize production impact over style nitpicks

## Output format
When asked to analyze, review, or implement changes in the project, provide:
1. architecture summary
2. important files and folders
3. request/data flow
4. risks and technical debt
5. prioritized findings by severity
6. implementation plan
7. safe quick wins
8. risky changes that require careful handling
9. open questions requiring manual verification
10. exact list of changed files after edits