---

**What tool to use**

For a student project / small team like yours, the answer is simple: **Notion**.

Here's why Notion beats the alternatives for your situation:

- Free for teams
- You can share it with your whole team with one link
- Supports tables, code blocks, diagrams, callouts, headers — everything you need
- No setup, no markdown knowledge required
- You can embed images, diagrams, even your Postman link inside it
- Everyone can edit and comment

The alternatives — Confluence (paid, overkill), GitBook (good but more complex), plain README.md in your repo (fine but limited formatting) — are all valid in industry but Notion is the fastest to get going and looks the most professional for a project like RootUP.

---

**What goes inside the document**

A technical doc has 7 sections. Let me walk through each one and tell you exactly what to write.

---

**Section 1 — Project Overview**

This is the "what is this thing" section. Someone who has never heard of RootUP should read this and understand the entire product in 2 minutes.

Write:
- What the product does in 2–3 sentences
- Who the users are (job seekers + employers)
- The tech stack as a simple list (Node.js, Express/NestJS, MongoDB Atlas, hosted on X)
- A link to the live app and the Postman docs

This sounds obvious but it's the most important section — it gives context for everything that follows.

---

**Section 2 — System Architecture**

This is a high-level diagram showing how all the pieces connect. Not code — a visual map.

For RootUP it would show:

- The frontend (React app)
- Your backend API (Node/Express)
- MongoDB Atlas
- Any external services (AI parser for CV, file storage like S3, email service)
- How they all talk to each other

Draw this in **Excalidraw** (free, simple) or use a Notion embed. One diagram is worth more than three pages of text here. Label the arrows — "REST API calls", "Mongoose queries", "S3 file upload" etc.

---

**Section 3 — Database Schema**

This explains every MongoDB collection, what it stores, and how collections relate to each other.

For each collection write:
- What it represents in plain English
- A table of fields, their types, and what they mean
- Which fields reference other collections (the relationships)

You already have this — your `rootup_backend_entities.md` file is essentially this section. You just need to paste it into Notion cleanly and add the ERD diagram on top.

The ERD is the visual version — a diagram showing User connects to CV, CV connects to LearningRoadmap, etc. This is what a developer looks at when they want to understand data flow quickly.

---

**Section 4 — API Reference Summary**

Wait — didn't we already do this in Postman?

Yes, but this section is different. Postman is for the frontend team to *use* the API. This section is for your own team to *understand the business logic* behind each endpoint group.

For each feature group write:
- What this group of endpoints does
- Any important business rules (e.g. "a user cannot submit a new CV until onboarding is complete", "the roadmap is auto-generated when a CV is analysed — there is no manual create endpoint")
- Which entities are touched
- Any background jobs or side effects (e.g. "completing a course triggers a badge check, which may trigger a notification")

This is the stuff that's invisible in Postman but critical for maintenance.

---

**Section 5 — Local Setup Guide**

How does a new developer get this project running on their laptop from zero? Write it as numbered steps. Be embarrassingly specific — assume the reader has never seen this codebase.

Write:
- Prerequisites (Node version, MongoDB, any CLI tools)
- How to clone the repo
- How to install dependencies (`npm install`)
- The `.env` file — list every environment variable needed and what it does (never put real values, use placeholders)
- How to seed the database if needed
- How to run the dev server
- How to run tests

The test: could a brand new developer follow these steps and have the app running in under 20 minutes? If yes, the section is good.

---

**Section 6 — Deployment**

How does code get from a developer's laptop to the live server?

Write:
- Where the app is hosted (Railway, Render, AWS, etc.)
- The deployment process — is it automatic (push to main = auto-deploy) or manual?
- Environment variables that need to be set on the server
- How to check if the deployment succeeded
- How to rollback if something breaks

Even if your deployment is simple right now, document it. Six months later you will have completely forgotten how you set it up.

---

**Section 7 — Known Issues & Decisions Log**

This is the section most teams skip and then regret. It has two parts.

**Known issues** — things that are broken, incomplete, or hacky. Be honest. Write "the CV parser sometimes misclassifies soft skills as hard skills — we are not fixing this in v1" or "the notification system has no rate limiting yet". This saves future-you from spending an hour debugging something that was already a known limitation.

**Decision log** — why did you make certain choices? Write entries like:
- "Chose MongoDB over PostgreSQL because the skill and roadmap data is highly variable in structure"
- "Chose JWT over sessions because the frontend is a separate React app"
- "OnboardingProfile is a separate collection from User because it is only written once and never updated"

These feel unnecessary now. In six months when someone asks "why did you do it this way?" you will be very glad you wrote them down.

---

**The Notion Template Structure**

Set it up exactly like this in Notion:

```
RootUP — Technical Documentation
│
├── 1. Project Overview
├── 2. System Architecture
│     └── [Excalidraw diagram embedded]
├── 3. Database Schema
│     ├── ERD Diagram
│     └── Collections (one page per collection)
├── 4. API Reference Summary
│     └── Business logic notes per feature
├── 5. Local Setup Guide
├── 6. Deployment
└── 7. Known Issues & Decisions Log
```

Each top-level item is a Notion page. The sub-items are either sub-pages or just sections within the page depending on how much content they have.

---

**One rule above everything else**

Write the documentation *as you build*, not after. Every time you finish a feature, spend 15 minutes updating the relevant section. A document written in one sitting at the end of a project is always incomplete and half-wrong. A document updated incrementally is accurate and actually useful.
