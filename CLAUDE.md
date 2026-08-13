# Finance Assistant — Project Instructions

## 1. Project Overview

Finance Assistant is a personal finance management web application with an AI-powered conversational assistant.

The application allows users to:

* Record income and expenses
* Categorize financial transactions
* View their financial balance
* Review transaction history
* Analyze spending patterns
* Ask questions about their own financial data through an AI assistant
* Receive useful financial insights based on their recorded data

The AI assistant is not intended to replace a professional financial advisor.

The primary goal of this project is to demonstrate a practical integration of:

* Modern web development
* Relational database design
* AI/LLM integration
* Tool calling
* Data analysis
* Secure user-specific data access
* Clean software architecture

The project should remain realistic and maintainable rather than unnecessarily complex.

---

# 2. Current Development Phase

**Phase 1 — Project Setup + Database Foundation**

The project is being developed incrementally.

Do not automatically implement features from future phases unless explicitly instructed.

### Development roadmap

```text
Phase 1 — Project Setup + Database
Phase 2 — Authentication
Phase 3 — Transaction Management
Phase 4 — Dashboard + Financial Summary
Phase 5 — AI Chatbot
Phase 6 — AI Tool Calling + Financial Queries
Phase 7 — AI Financial Insights
Phase 8 — Testing + Security + Error Handling
Phase 9 — Deployment + Production Polish
Phase 10 — Optional Advanced Features
```

When a phase is completed, the project owner will explicitly move the project to the next phase.

Never assume that the next phase should begin automatically.

---

# 3. Core Technology Stack

Use the following technologies unless explicitly instructed otherwise.

## Frontend

* Next.js 15
* React
* TypeScript
* App Router
* Tailwind CSS

## Backend

* Next.js Route Handlers / server-side functionality
* TypeScript

## Database

* MySQL
* Prisma ORM

## AI

* OpenAI API

AI integration should only be introduced during the appropriate AI development phases.

## Charts

* Recharts

Charts should only be introduced when dashboard development begins.

## Authentication

## Current Phase

Authentication technology should be selected during Phase 2.

Do not implement authentication during Phase 1 unless explicitly requested.

---

# 4. General Architecture

The application should follow a clear separation of responsibilities.

Target architecture:

```text
User
 │
 ▼
Next.js UI
 │
 ├── Dashboard
 ├── Transactions
 └── AI Assistant
       │
       ▼
Application / API Layer
 │
 ├── Authentication
 ├── Transaction Services
 ├── Financial Analysis
 └── AI Services
       │
       ├── AI Model
       ├── Tool Calling
       └── AI Prompts
       │
       ▼
Prisma ORM
 │
 ▼
MySQL
```

The frontend should not directly access the database.

Database access should happen through server-side code.

---

# 5. Project Structure

Use a structure similar to:

```text
finance-assistant/
│
├── app/
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── transactions/
│   ├── chat/
│   │
│   ├── api/
│   │   ├── auth/
│   │   ├── transactions/
│   │   └── ai/
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── transactions/
│   └── chat/
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── ai.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

This structure may evolve as the application grows.

Do not create unnecessary folders or abstractions without a reason.

---

# 6. Database Design

The initial database consists of:

```text
User
Transaction
```

## User

```text
id
name
email
passwordHash
createdAt
```

## Transaction

```text
id
userId
type
amount
category
description
transactionDate
createdAt
```

Transaction type:

```text
INCOME
EXPENSE
```

A user can have many transactions.

```text
User 1 ───────── * Transaction
```

The relationship should use cascading deletion where appropriate.

Transactions must always belong to a user.

---

# 7. Database Rules

Use Prisma for all database operations.

Do not write raw SQL unless there is a clear technical reason and it has been explicitly approved.

Use appropriate database types.

Financial amounts must use decimal precision rather than floating-point types.

For example:

```text
Decimal(10, 2)
```

Do not use JavaScript floating-point arithmetic for financial calculations when precise decimal handling is required.

Always filter user-owned records by the authenticated user's ID.

Never retrieve all transactions and filter them only on the client.

Bad:

```text
Fetch all transactions
→ send to browser
→ filter by user
```

Good:

```text
Authenticated user ID
→ database query with userId
→ return only authorized records
```

---

# 8. Financial Data Rules

Financial calculations must be deterministic and performed by application code whenever possible.

Do not ask the LLM to perform calculations that the backend can perform reliably.

For example:

User asks:

> How much did I spend this month?

The system should:

```text
1. Identify the requested period
2. Query the database
3. Calculate the total using backend logic
4. Give the result to the AI
5. Let the AI explain the result naturally
```

The LLM should not invent or estimate transaction totals.

---

# 9. Currency

The initial application uses:

```text
MYR / RM
```

as the default currency.

Examples:

```text
RM15.00
RM1,250.50
```

Currency formatting should be centralized rather than duplicated throughout the application.

Future multi-currency support may be added later, but it is outside the MVP.

---

# 10. Transaction Categories

Initial expense categories:

```text
Food
Transport
Bills
Shopping
Entertainment
Healthcare
Education
Others
```

Initial income categories may include:

```text
Salary
Freelance
Allowance
Other
```

Categories should be centralized where practical.

Do not allow arbitrary category strings to spread throughout the application.

---

# 11. Authentication Rules

Authentication is introduced in Phase 2.

When authentication is implemented:

* Passwords must never be stored in plaintext.
* Passwords must be securely hashed.
* Sessions must be handled securely.
* Protected pages must verify authentication.
* API endpoints must verify authentication.
* Every transaction query must be scoped to the authenticated user.

Never trust a `userId` supplied by the client.

For example, do not blindly accept:

```text
POST /api/transactions
{
  "userId": 123
}
```

Instead, determine the user from the authenticated session.

---

# 12. AI Architecture

The AI assistant should not be implemented as a simple:

```text
User message
→ LLM
→ response
```

The intended architecture is:

```text
User
 ↓
AI Assistant
 ↓
Intent / Tool Decision
 ↓
Application Tool
 ↓
Database / Calculation
 ↓
Tool Result
 ↓
AI Response
```

The AI should use application tools for actions and data retrieval.

Potential tools include:

```text
create_transaction
get_transactions
get_balance
get_spending_by_category
get_monthly_summary
```

Tools should be introduced gradually during the AI phases.

---

# 13. AI Data Access Rules

The AI must never have unrestricted direct database access.

The AI interacts with application-defined tools.

For example:

```text
User:
"How much did I spend on food this month?"

AI
 ↓
get_spending_by_category()
 ↓
Backend
 ↓
Database
 ↓
Result
 ↓
AI
 ↓
Response
```

The AI should only receive the minimum data necessary to answer the request.

Never expose:

* Password hashes
* Authentication tokens
* API keys
* Internal database credentials
* Other users' transactions
* Unnecessary personally identifiable information

---

# 14. AI Transaction Creation

The AI should eventually support natural language transaction entry.

Example:

```text
User:
"I spent RM18 on McDonald's today."
```

The AI should extract structured information:

```text
type: EXPENSE
amount: 18
category: Food
description: McDonald's
transactionDate: today
```

The backend should validate the structured data before saving it.

The AI must not directly write to the database.

The application layer is responsible for:

* Validation
* Authorization
* Database writes
* Error handling

---

# 15. Ambiguous AI Requests

The AI should ask for clarification when important information is missing.

Example:

```text
User:
"I spent 20 today."
```

The AI may ask:

> What was the expense for?

Do not guess critical financial information.

For example, do not automatically assume:

```text
category = Food
```

if the category cannot reasonably be determined.

---

# 16. AI Financial Advice

The assistant may provide general financial guidance based on user-provided data.

However:

* Do not present guesses as facts.
* Do not fabricate financial data.
* Do not claim professional financial authority.
* Clearly distinguish calculated data from recommendations.
* Avoid high-risk investment recommendations.
* Encourage professional advice for serious financial decisions.

The AI should prioritize accurate analysis of the user's actual transaction data.

---

# 17. Security Principles

Security is a core requirement.

Never:

* Commit secrets
* Hardcode API keys
* Hardcode database passwords
* Expose `.env`
* Trust client-provided user IDs
* Expose other users' data
* Return password hashes
* Put sensitive database operations in client components

Use environment variables for secrets.

Example:

```env
DATABASE_URL=
OPENAI_API_KEY=
```

`.env` must not be committed.

`.env.example` may be committed with placeholder values.

---

# 18. Server vs Client Components

Prefer Server Components by default.

Use Client Components only when interactivity requires them.

Examples of appropriate Client Components:

* Interactive forms
* Chat interface
* Dropdowns
* Charts
* UI requiring browser state

Do not add `"use client"` to every component unnecessarily.

---

# 19. TypeScript Rules

Use TypeScript strictly.

Avoid:

```typescript
any
```

unless there is a justified reason.

Prefer explicit types and interfaces.

Validate external input before using it.

AI-generated structured data must also be validated.

Do not assume that an LLM response is automatically valid.

---

# 20. Error Handling

Application errors should be handled intentionally.

Do not expose internal errors to users.

Bad:

```text
PrismaClientKnownRequestError:
Invalid database query...
```

Better:

```text
Unable to save the transaction. Please try again.
```

Server logs may contain technical details where appropriate.

User-facing messages should remain understandable.

---

# 21. API Design

API endpoints should have clear responsibilities.

Potential structure:

```text
/api/auth/*
/api/transactions/*
/api/ai/*
```

Use appropriate HTTP methods.

Examples:

```text
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

Every protected endpoint must verify authentication and ownership.

---

# 22. Validation

Validate all user input.

Validation should cover:

* Required fields
* Amount
* Transaction type
* Category
* Description length
* Date
* Email format
* Password requirements when authentication is implemented

Do not rely only on frontend validation.

Server-side validation is mandatory.

---

# 23. UI/UX Principles

The UI should be:

* Clean
* Modern
* Simple
* Responsive
* Accessible
* Professional

Avoid unnecessary visual complexity.

The application should feel like a real finance product rather than a student demo.

However, do not over-engineer the interface.

Prioritize usability over decoration.

---

# 24. Dashboard Principles

The dashboard should eventually provide:

```text
Total Income
Total Expenses
Current Balance
Monthly Spending
Recent Transactions
Spending by Category
```

Financial figures should come from backend/database data.

Do not hardcode dashboard values.

---

# 25. Development Principles

Before implementing a feature:

1. Understand the existing architecture.
2. Inspect relevant files.
3. Identify dependencies.
4. Make the smallest clean change required.
5. Keep existing functionality working.
6. Test the change.
7. Report what was changed.

Do not rewrite large parts of the project unnecessarily.

Do not introduce a new library when existing dependencies can solve the problem cleanly.

---

# 26. Avoid Overengineering

This project is intentionally designed to be intermediate in complexity.

Do not introduce unnecessary:

* Microservices
* Message queues
* Kubernetes
* Complex event-driven architecture
* Multiple databases
* Multiple AI agents
* Excessive abstraction layers

Prefer a well-structured monolithic Next.js application.

Complexity should only be introduced when it provides a clear benefit.

---

# 27. Code Quality

Code should be:

* Readable
* Modular
* Reusable
* Typed
* Maintainable
* Consistent

Avoid:

* Huge components
* Duplicate logic
* Hardcoded financial calculations
* Magic numbers
* Unnecessary global state
* Dead code
* Unused imports
* Unused dependencies

Keep business logic separate from UI where practical.

---

# 28. Testing Strategy

Testing should increase as the project grows.

Important areas to test:

### Unit tests

* Financial calculations
* Category calculations
* Balance calculations
* Date range calculations

### Integration tests

* Database operations
* Transaction creation
* Transaction retrieval
* User ownership checks
* AI tool execution

### End-to-end tests

Eventually test critical flows:

```text
Register
→ Login
→ Add income
→ Add expense
→ View balance
→ Ask AI about spending
```

Do not add a large testing framework during Phase 1 unless explicitly requested.

---

# 29. Git Practices

Use meaningful commits.

Examples:

```text
feat: initialize Next.js project
feat: add Prisma database schema
feat: add authentication
feat: add transaction management
feat: add finance dashboard
feat: add AI transaction tool
fix: prevent unauthorized transaction access
```

Avoid commits such as:

```text
update
stuff
changes
test
asdf
```

Do not commit:

```text
.env
API keys
database passwords
secrets
```

---

# 30. Documentation

Maintain `README.md` as the human-facing project documentation.

README should eventually include:

* Project overview
* Features
* Tech stack
* Installation
* Environment variables
* Database setup
* Development commands
* AI configuration
* Deployment instructions

`CLAUDE.md` is for AI coding-agent instructions.

`README.md` is for project documentation.

Do not mix these purposes.

---

# 31. Environment Configuration

Expected environment variables may include:

```env
DATABASE_URL=""
OPENAI_API_KEY=""
```

Additional variables may be introduced later if required.

Never expose server-only secrets through client-side environment variables.

Do not use `NEXT_PUBLIC_` for private credentials.

---

# 32. Phase 1 Scope

Phase 1 includes:

* Next.js setup
* TypeScript
* Tailwind CSS
* Prisma
* MySQL
* Initial Prisma schema
* User model
* Transaction model
* Database relationship
* Initial migration
* Prisma client
* Environment configuration
* Basic project structure

Phase 1 does NOT include:

* Authentication
* Registration
* Login
* Dashboard
* Transaction UI
* AI
* OpenAI API calls
* Charts
* Budgeting

---

# 33. Phase 2 Scope

Phase 2 will introduce:

* Registration
* Login
* Password hashing
* Sessions
* Protected routes
* User authentication
* Authentication middleware where appropriate

Do not start Phase 2 unless explicitly instructed.

---

# 34. Phase 3 Scope

Phase 3 will introduce:

* Create transaction
* Read transactions
* Update transaction
* Delete transaction
* Transaction filtering
* Transaction validation
* User-specific transaction access

---

# 35. Phase 4 Scope

Phase 4 will introduce:

* Dashboard
* Income summary
* Expense summary
* Current balance
* Monthly spending
* Recent transactions
* Spending categories
* Charts

---

# 36. Phase 5 Scope

Phase 5 will introduce the AI chat interface.

Initial capabilities:

* Conversational UI
* Message history
* AI response handling
* Basic finance-related conversation

Do not allow AI to modify financial data yet unless explicitly implemented through validated tools.

---

# 37. Phase 6 Scope

Phase 6 will introduce AI tool calling.

Potential tools:

```text
create_transaction
get_transactions
get_balance
get_monthly_summary
get_spending_by_category
```

AI actions must go through validated backend tools.

---

# 38. Phase 7 Scope

Phase 7 will introduce AI-generated insights.

Examples:

```text
"Food is your highest spending category this month."

"Your spending increased compared with last month."

"You spent RM420 on food this month."
```

Insights must be based on actual database data.

Never fabricate financial statistics.

---

# 39. Phase 8 Scope

Phase 8 will focus on:

* Security review
* Input validation
* Error handling
* Unit testing
* Integration testing
* End-to-end testing
* AI failure handling
* Authorization testing

---

# 40. Phase 9 Scope

Phase 9 will focus on:

* Production configuration
* Deployment
* Environment variables
* Database hosting
* Performance
* Logging
* Monitoring
* Final UI polish

---

# 41. Optional Advanced Features

Only consider these after the core application is stable:

* Receipt OCR
* CSV bank statement import
* Recurring transactions
* Budget management
* Savings goals
* Monthly financial reports
* Spending forecasts
* Multi-currency support
* Voice input
* More advanced AI insights

Do not implement these prematurely.

---

# 42. AI Coding-Agent Behaviour

When working on this project, follow these rules:

### Before coding

* Inspect the relevant project files.
* Understand the current implementation.
* Check the current development phase.
* Do not assume missing requirements.

### During coding

* Make focused changes.
* Follow existing conventions.
* Avoid unnecessary rewrites.
* Keep the application runnable.
* Preserve existing functionality.

### After coding

Run appropriate validation.

At minimum, where applicable:

```bash
npm run lint
```

and:

```bash
npx tsc --noEmit
```

If database changes were made, validate Prisma as well.

Report:

* What changed
* Why it changed
* What was tested
* Any remaining issues

---

# 43. Do Not Automatically Expand Scope

If a requested task belongs to a future phase, do not silently implement it.

For example, during Phase 1, if asked to set up Prisma, do not also implement:

* Authentication
* Dashboard
* AI
* Transaction forms

Keep the requested task focused.

If a future feature requires architectural preparation, prepare only what is necessary.

---

# 44. Handling Ambiguous Requirements

If requirements are ambiguous but a reasonable implementation can be made without affecting architecture, choose the simplest sensible option.

If the ambiguity could significantly affect:

* Database design
* Security
* Authentication
* AI behaviour
* API contracts
* Major architecture

stop and ask for clarification before making the change.

Do not make major architectural assumptions silently.

---

# 45. Definition of Done

A feature is considered complete only when:

1. The implementation matches the requested scope.
2. Existing functionality still works.
3. TypeScript passes.
4. ESLint passes.
5. Relevant tests pass.
6. Database migrations are valid when applicable.
7. No secrets are exposed.
8. User data remains properly isolated.
9. The implementation is reasonably maintainable.
10. The result is documented when necessary.

---

# 46. Current Project Goal

The final MVP should allow a user to:

```text
Register
   ↓
Login
   ↓
Record income
   ↓
Record expenses
   ↓
View financial dashboard
   ↓
Open AI Assistant
   ↓
Ask questions about their finances
   ↓
Allow AI to safely interact with financial data
   ↓
Receive accurate financial summaries and insights
```

The application should demonstrate that the AI is integrated with a real application and database rather than being a simple ChatGPT wrapper.

---

# 47. Final Principle

Build the simplest system that correctly solves the current problem.

Do not optimize for maximum complexity.

Do not add features just because they are technically possible.

Prioritize:

```text
Correctness
→ Security
→ Maintainability
→ User Experience
→ AI Capability
→ Advanced Features
```

The project should grow incrementally from a solid foundation into a practical AI-powered finance assistant.
