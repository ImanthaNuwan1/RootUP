# RootUP — Database Documentation

> **Tech Stack:** Node.js + Express · MongoDB Atlas · Mongoose  
> **Database Name:** `rootup`  
> **Cluster:** `RootUP-Cluster` (AWS · ap-south-1 Mumbai / ap-southeast-1 Singapore)  
> **Status:** ✅ All 20 collections and 58 indexes live on Atlas  
> **Last Updated:** May 2026

---

## Table of Contents

1. [What We Have Done So Far](#1-what-we-have-done-so-far)
2. [How MongoDB Works — Key Concepts](#2-how-mongodb-works--key-concepts)
3. [NoSQL Design Principles Followed](#3-nosql-design-principles-followed)
4. [Architecture Overview](#4-architecture-overview)
5. [Collection Categories](#5-collection-categories)
6. [Full Collection Reference](#6-full-collection-reference)
   - [Core Identity](#core-identity)
   - [Job Seeker](#job-seeker)
   - [Employer](#employer)
   - [Gamification](#gamification)
   - [Community](#community)
   - [System / Utility](#system--utility)
7. [Index Reference](#7-index-reference)
8. [Entity Relationship Diagram](#8-entity-relationship-diagram)
9. [How to Re-run the Init Script](#9-how-to-re-run-the-init-script)
10. [Next Steps for Developers](#10-next-steps-for-developers)

---

## 1. What We Have Done So Far

### Phase 1 — Schema Design
Designed all 20 MongoDB collections from scratch by:
- Analysing the 5-step onboarding wizard UI
- Walking through all authenticated pages (Dashboard, Career Audit, Roadmap, Courses, Careers, Community)
- Cross-referencing the original project proposal
- Identifying which data is owned (embed) vs shared (reference)

### ⚠️ Schema Correction — v2 (Important, read this)

During review it was identified that 7 seeker-only fields were incorrectly placed in the `users` collection:

| Field | Was in | Moved to | Reason |
|---|---|---|---|
| `roleReadinessScore` | `users` | `seeker_profiles` | Employers have no readiness score |
| `currentSkills` | `users` | `seeker_profiles` | Employers don't upload CVs |
| `missingSkills` | `users` | `seeker_profiles` | Gap analysis is seeker-only |
| `softSkillScores` | `users` | `seeker_profiles` | Assessment results are seeker-only |
| `points` | `users` | `seeker_profiles` | Gamification is seeker-only |
| `streakDays` | `users` | `seeker_profiles` | Study streaks are seeker-only |
| `podId` | `users` | `seeker_profiles` | Accountability pods are seeker-only |

`onboarding_profiles` was also **renamed to `seeker_profiles`** to better reflect its expanded role as the complete seeker identity collection (not just onboarding data).

**Result:** `users` is now a clean 11-field auth layer shared by both roles. `seeker_profiles` holds all seeker-specific data. `employers` holds all employer-specific data. No cross-role field contamination.

> Since the Atlas collections were empty at the time of this correction, `initDB.ts` was updated and re-run. No data migration was needed.

### Phase 2 — Atlas Setup
| Step | What Was Done |
|---|---|
| Created MongoDB Atlas account | Free tier (M0) |
| Created Project | Named `RootUP` |
| Created Cluster | `RootUP-Cluster` on AWS |
| Created database user | `rootup_admin` with strong password |
| Set network access | `0.0.0.0/0` for development (restrict in production) |
| Added connection string to `.env` | `MONGO_URI=mongodb+srv://...` |

### Phase 3 — Collection + Index Initialisation
Ran `src/scripts/initDB.ts` which created all collections and indexes in one shot.

**Output confirmed:**
```
✅  Connected to database: "rootup"
📦  Created collection: users               └─ 4 index(es) ensured
📦  Created collection: seeker_profiles     └─ 2 index(es) ensured
📦  Created collection: cvs                 └─ 2 index(es) ensured
📦  Created collection: learning_roadmaps   └─ 2 index(es) ensured
📦  Created collection: courses             └─ 4 index(es) ensured
📦  Created collection: course_progress     └─ 3 index(es) ensured
📦  Created collection: jobs                └─ 7 index(es) ensured
📦  Created collection: job_applications    └─ 3 index(es) ensured
📦  Created collection: soft_skill_assessments └─ 3 index(es) ensured
📦  Created collection: employers           └─ 3 index(es) ensured
📦  Created collection: job_posts           └─ 4 index(es) ensured
📦  Created collection: skill_thresholds    └─ 2 index(es) ensured
📦  Created collection: profile_views       └─ 3 index(es) ensured
📦  Created collection: focus_sessions      └─ 2 index(es) ensured
📦  Created collection: forests             └─ 1 index(es) ensured
📦  Created collection: badges              └─ 3 index(es) ensured
📦  Created collection: accountability_pods └─ 2 index(es) ensured
📦  Created collection: blog_posts          └─ 4 index(es) ensured
📦  Created collection: notifications       └─ 2 index(es) ensured
📦  Created collection: job_market_trends   └─ 3 index(es) ensured

🎉  All collections and indexes are ready!
    Database:     rootup
    Collections:  20
    Total indexes: 58
```

### Phase 4 — Team Reference UI
Built `RootUpDBDesign.tsx` — a React + TypeScript component with 3 tabs (Collections, Relationships, NoSQL Practices) available at `/db-design` route for all developers to reference during development.

---

## 2. How MongoDB Works — Key Concepts

If you are coming from a SQL background, here is how the concepts map:

| SQL Concept | MongoDB Equivalent | Notes |
|---|---|---|
| Database Server | Cluster | The cloud "machine" running MongoDB |
| Database | Database (`rootup`) | A named container of collections |
| Table | Collection | e.g. `users`, `jobs` |
| Row | Document | A single JSON object |
| Column | Field | A key inside a JSON object |
| Primary Key | `_id` (ObjectId) | Auto-generated, always unique |
| Foreign Key | ObjectId reference | Stored manually, no enforced constraint |
| JOIN | `$lookup` aggregation | Done in queries, not schema |
| Schema | None enforced by default | Fields are defined in your Mongoose model |
| Index | Index | Works the same way |

### Important: MongoDB is Schemaless

MongoDB does **not** enforce fields at the database level. You can insert a document with any fields you want. The fields listed in this document are enforced by your **Mongoose models** in code, not by Atlas.

This means:
- You can add new fields to a document at any time without a migration
- Two documents in the same collection can technically have different fields
- Mongoose `required: true` is your schema enforcement layer

---

## 3. NoSQL Design Principles Followed

These are the 8 design decisions made during schema design and why they matter.

### 1. Embed sub-documents for owned, always-loaded data
Phase sub-docs live **inside** `learning_roadmaps`. Tree sub-docs live **inside** `forests`. They are never queried independently — embedding avoids extra round-trips and keeps reads atomic.

**Example:** When you load a user's roadmap, you always need all 4 phases. Embedding means one query instead of five.

### 2. Reference for independently-queried, shared entities
`CourseProgress` references `Course` (does not embed it) because `Course` is a shared catalogue reused across all users. Duplicating course data inside every user's roadmap would waste storage and break single-source-of-truth — if a Udemy URL changes, you'd have to update thousands of documents.

### 3. Separate high-growth arrays into own collections
`FocusSession`, `Notification`, and `JobApplication` are **not** arrays inside the `User` document. They grow unboundedly over a user's lifetime. MongoDB documents have a **16 MB hard cap** — keeping these inside `User` would eventually hit it and crash writes.

### 4. Index every foreign-key field used in queries
Every `userId`, `employerId`, `courseId`, `jobId` that appears in a `find()` or `$lookup` has an index. Without indexes, MongoDB does a full collection scan for every query — this is fine at 100 documents, catastrophic at 100,000.

### 5. Clean role separation — no cross-role fields
`users` holds only the 11 fields shared by both roles. The 7 seeker-only fields (`roleReadinessScore`, `currentSkills`, `missingSkills`, `softSkillScores`, `points`, `streakDays`, `podId`) live in `seeker_profiles`. Employer-only data lives in `employers`. No seeker field ever appears on an employer document and vice versa. Both the frontend's separate seeker/employer login pages and the backend's single `/api/auth/login` endpoint work cleanly with this structure — the `role` field in `users` is the discriminator.

### 6. Enum strings over magic numbers
Status fields (`job_applications.status`, `course_progress.status`) use readable string enums (`"in_progress"`, `"completed"`) instead of integers like `1`, `2`, `3`. Self-documenting, easy to extend, and readable in Atlas Data Explorer without a lookup table.

### 7. Always include `createdAt` / `updatedAt`
Every mutable collection carries timestamps. Enables audit trails, soft-delete patterns, and cache-busting without schema changes later.

### 8. Bucket pattern for time-series data
`FocusSession` stores one document per session rather than pushing sessions into an array inside `User`. This makes aggregation queries (weekly study hours, streak calculation) efficient with date-range indexes and avoids unbounded array growth.

### 9. TTL index for auto-expiring data
`job_market_trends` has a TTL index on `fetchedAt` set to 30 days. Atlas automatically deletes stale trend documents — no cron job or manual cleanup needed.

### 10. Unique compound indexes for join collections
`course_progress` has a unique compound index on `{ userId, courseId }`. This enforces at the **database level** that a user cannot have two progress records for the same course. Same pattern applied to `job_applications` on `{ userId, jobId }`.

---

## 4. Architecture Overview

```
MongoDB Atlas (Cloud)
└── Organization: Sachala's Org
    └── Project: RootUP
        └── Cluster: RootUP-Cluster (AWS · Free M0 Tier)
            └── Database: rootup
                ├── [Core]         users, onboarding_profiles
                ├── [Job Seeker]   cvs, learning_roadmaps, courses,
                │                  course_progress, jobs, job_applications,
                │                  soft_skill_assessments
                ├── [Employer]     employers, job_posts, skill_thresholds,
                │                  profile_views
                ├── [Gamification] focus_sessions, forests, badges
                ├── [Community]    accountability_pods, blog_posts
                └── [System]       notifications, job_market_trends
```

### Connection String (in `.env`)
```env
MONGO_URI=mongodb+srv://rootup_admin:<password>@rootup-cluster.xxxxx.mongodb.net/rootup?retryWrites=true&w=majority
```

---

## 5. Collection Categories

| Category | Collections | Purpose |
|---|---|---|
| **Core Identity** | `users`, `onboarding_profiles` | Auth, roles, onboarding wizard data |
| **Job Seeker** | `cvs`, `learning_roadmaps`, `courses`, `course_progress`, `jobs`, `job_applications`, `soft_skill_assessments` | All seeker-facing features |
| **Employer** | `employers`, `job_posts`, `skill_thresholds`, `profile_views` | Employer dashboard and hiring pipeline |
| **Gamification** | `focus_sessions`, `forests`, `badges` | Focus timer, virtual forest, verifiable badges |
| **Community** | `accountability_pods`, `blog_posts` | Pods, leaderboard, community blog |
| **System** | `notifications`, `job_market_trends` | Notifications, AI trend data |

---

## 6. Full Collection Reference

> **Field type legend:**
> - `ObjectId` — MongoDB unique ID (auto-generated for `_id`, manual reference for others)
> - `[String]` — array of strings
> - `[ObjectId]` — array of references to another collection
> - `Object` — embedded JSON object (sub-document)
> - `[Object]` — array of embedded sub-documents

---

### Core Identity

---

#### `users`
> Pure auth + identity layer. Contains **only the 11 fields shared by both seekers and employers**. This is the only collection queried at login — keeping it lean means every auth check is fast. Seeker-only data lives in `seeker_profiles`. Employer-only data lives in `employers`.

| Field | Type | Required | Shared? | Notes |
|---|---|---|---|---|
| `_id` | ObjectId | auto | ✅ Both | Primary key, auto-generated |
| `email` | String | ✅ | ✅ Both | Unique. Single login entry point for both roles |
| `passwordHash` | String | — | ✅ Both | `null` for OAuth (Google) users |
| `authProvider` | String | ✅ | ✅ Both | `"local"` or `"google"` |
| `role` | String | ✅ | ✅ Both | `"seeker"` or `"employer"` — set at signup, never changes |
| `fullName` | String | ✅ | ✅ Both | Display name for both roles |
| `profilePicUrl` | String | — | ✅ Both | Both roles have a profile picture |
| `subscriptionTier` | String | ✅ | ✅ Both | `"free"` or `"premium"` — both roles can subscribe |
| `onboardingCompleted` | Boolean | ✅ | ✅ Both | Both roles have an onboarding flow |
| `createdAt` | Date | auto | ✅ Both | Set on document creation |
| `updatedAt` | Date | auto | ✅ Both | Updated on every write |

> ⚠️ **What is NOT here:** `roleReadinessScore`, `currentSkills`, `missingSkills`, `softSkillScores`, `points`, `streakDays`, `podId` — these were seeker-only fields that were moved to `seeker_profiles` in the v2 correction.

**Indexes:** `email` (unique), `role`, `createdAt`

**Relationships:**
- One `users` → One `seeker_profiles` (if `role = "seeker"`)
- One `users` → One `employers` (if `role = "employer"`)
- One `users` → Many `cvs`, `focus_sessions`, `badges`, `notifications`, `job_applications`, `course_progress`, `blog_posts`

---

#### `seeker_profiles`
> The complete seeker identity document. Renamed from `onboarding_profiles` and expanded with 7 fields moved from `users`. This is now the **single source of truth for everything seeker-specific** — gamification state, AI analysis results, and onboarding wizard answers all live here. Employers never read or write this collection.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id`. Unique — one profile per seeker |
| `roleReadinessScore` | Number | — | `0–100`. Computed from CV gap analysis. Shown as "62% ready" in nav. **Moved from users** |
| `currentSkills` | [String] | — | Extracted from latest CV upload. **Moved from users** |
| `missingSkills` | [String] | — | Skills gap identified by AI analysis. **Moved from users** |
| `softSkillScores` | Object | — | `{ communication: Number, leadership: Number, problemSolving: Number }`. **Moved from users** |
| `points` | Number | — | Gamification points total. Default `0`. **Moved from users** |
| `streakDays` | Number | — | Consecutive active days. Default `0`. **Moved from users** |
| `podId` | ObjectId | — | Reference → `accountability_pods._id`. Null if not in a pod. **Moved from users** |
| `dreamRoles` | [String] | ✅ | Step 1 multi-select. Options: Frontend Dev, Backend Dev, Full Stack, Mobile, Data Analyst, Data Scientist, DevOps, Cloud Eng, UI/UX, QA, Cybersecurity, ML Eng, PM, Scrum, Business Analyst, Software Architect, DBA, Systems Eng |
| `inspiringCompanies` | [String] | ✅ | Step 2 multi-select. Google, Microsoft, Amazon, Meta, Apple, WSO2, Virtusa, 99x, IFS, Sysco Labs, hSenid, Calcey, Mitra Innovation, Pearson Lanka, Zone24x7, Cambio, Creative Software, Any startup, Any multinational, Remote global |
| `industries` | [String] | ✅ | Step 3 multi-select. Software Dev, Data & Analytics, Cybersecurity, Cloud Computing, AI & ML, FinTech, EdTech, HealthTech, E-Commerce, Gaming, Telecom, Digital Marketing |
| `careerStage` | String | ✅ | Step 4: `"studying"`, `"fresh_grad"`, `"entry"`, `"mid"`, `"senior"` |
| `monthlyBudget` | String | ✅ | Step 5: `"free"`, `"under_20"`, `"up_to_50"`, `"no_limit"` |
| `weeklyStudyHours` | Number | ✅ | Step 5: `5`, `10`, `15`, `20`, or `30` |
| `careerGoal` | String | — | Step 5: free-text field, optional |
| `onboardingCompletedAt` | Date | auto | Timestamp when wizard was submitted |

**Indexes:** `userId` (unique), `roleReadinessScore` descending (for employer matching queries)

---

### Job Seeker

---

#### `cvs`
> Stores each CV upload and its AI-processed output. Versioned so users can re-upload and compare gap analyses over time. The `parsedData` and `gapAnalysisResult` fields are JSON blobs returned by the AI parser — embedded as objects to avoid a separate AI-results collection and an extra query.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id` |
| `targetRole` | String | ✅ | Selected from Career Audit form. e.g. `"Frontend Developer"` |
| `seniorityLevel` | String | ✅ | `"junior"`, `"mid"`, or `"senior"` |
| `rawFileUrl` | String | ✅ | Cloud storage URL (S3 / GCS). Max file size 10 MB |
| `fileType` | String | ✅ | `"pdf"`, `"doc"`, `"docx"`, or `"txt"` |
| `parsedData` | Object | — | AI-extracted structured data (education, experience, skills). Embedded JSON |
| `extractedSkills` | [String] | — | Flat list of skills identified from the CV |
| `gapAnalysisResult` | Object | — | `{ missingSkills: [], matchPercentage: Number, recommendations: [] }`. Embedded JSON |
| `version` | Number | ✅ | Starts at `1`, increments on each re-upload |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes:** `userId`, compound `{ userId, version }` descending

---

#### `learning_roadmaps`
> One roadmap per user per target role. The four phases are embedded sub-documents because they always load together and never exist independently. `courseIds` inside each phase are references to the shared `courses` catalogue.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id` |
| `targetRole` | String | ✅ | e.g. `"Frontend Developer"` |
| `phases` | [Phase] | ✅ | Embedded array of Phase sub-documents (see below) |
| `status` | String | ✅ | `"active"` or `"completed"` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Phase Sub-document** (embedded inside `phases` array):

| Field | Type | Notes |
|---|---|---|
| `name` | String | `"Foundation"`, `"Build"`, `"Advanced"`, or `"Job-Ready"` |
| `description` | String | Foundation: "HTML, CSS, basic JS" · Build: "React, Git, REST APIs" · Advanced: "System Design, Performance" · Job-Ready: "Interviews, Portfolio" |
| `order` | Number | `1` through `4`. Enforces sequential progression |
| `skills` | [String] | Skills covered in this phase |
| `courseIds` | [ObjectId] | References → `courses._id`. Not embedded — courses are shared |
| `isUnlocked` | Boolean | `false` until previous phase `checkpointPassed = true` |
| `isCompleted` | Boolean | `true` when all courses in phase are completed |
| `checkpointPassed` | Boolean | `true` when assessment at end of phase is passed |

**Indexes:** `userId`, compound `{ userId, status }`

---

#### `courses`
> Shared catalogue of learning resources. A single Course is referenced by many users' roadmaps and progress records. Keeping it as its own collection enforces single-source-of-truth — if a Udemy URL changes, one update propagates everywhere. This collection is populated by admins, not users.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `title` | String | ✅ | Course title |
| `provider` | String | ✅ | e.g. `"YouTube"`, `"freeCodeCamp"`, `"Udemy"`, `"Coursera"`, `"LinkedIn Learning"` |
| `url` | String | ✅ | Direct link to the course |
| `skillsCovered` | [String] | ✅ | Skills this course teaches. Used by recommendation engine |
| `type` | String | ✅ | `"free"` or `"paid"` |
| `estimatedHours` | Number | ✅ | Expected completion time |
| `category` | String | ✅ | `"hard_skill"` or `"soft_skill"` |

**Indexes:** `skillsCovered`, `type`, `category`, full-text on `title`

---

#### `course_progress`
> Join collection between `users` and `courses`. Tracks per-user enrollment status, enabling the "In Progress", "Completed", and "Recommended for Me" tabs. A unique compound index on `{ userId, courseId }` enforces one record per user per course at the database level.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id` |
| `courseId` | ObjectId | ✅ | Reference → `courses._id` |
| `status` | String | ✅ | `"in_progress"` or `"completed"` |
| `startedAt` | Date | auto | Set when user starts the course |
| `completedAt` | Date | — | `null` until course is completed |
| `badgeEarned` | Boolean | — | `true` if completion triggered a badge. Fires `badges` document creation |

**Indexes:** compound `{ userId, status }`, unique compound `{ userId, courseId }`, `courseId`

---

#### `jobs`
> Job listings surfaced on the Matched Jobs page. Sources are either RootUP partner postings (linked to an `employers` document) or AI-discovered external listings. `salaryRange` is an embedded object to keep currency and period together and allow range queries on `min` / `max`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `title` | String | ✅ | e.g. `"Junior Software Engineer (Backend)"`. Text-indexed |
| `company` | String | ✅ | e.g. `"WSO2"` |
| `location` | String | ✅ | e.g. `"Colombo, Sri Lanka"` |
| `employmentType` | String | ✅ | `"full-time"`, `"part-time"`, or `"contract"` |
| `seniorityLevel` | String | ✅ | `"junior"`, `"mid"`, or `"senior"` |
| `salaryRange` | Object | — | `{ min: Number, max: Number, currency: String, period: String }` e.g. `{ min: 180000, max: 250000, currency: "LKR", period: "monthly" }` |
| `description` | String | ✅ | Full job description. Text-indexed |
| `requiredSkills` | [String] | ✅ | e.g. `["Java", "Spring Boot", "Microservices", "Git", "Linux"]`. Indexed for AI matching |
| `source` | String | ✅ | `"rootup_partner"`, `"ai_discovered"`, or `"linkedin"` |
| `sourceUrl` | String | — | External deep-link. Null for RootUP partner jobs |
| `isRecommended` | Boolean | — | Set to `true` by the AI matching engine |
| `postedAt` | Date | ✅ | Indexed descending for recency sort |
| `employerId` | ObjectId | — | Reference → `employers._id`. Null for AI-discovered jobs |

**Indexes:** `seniorityLevel`, `source`, `isRecommended`, `requiredSkills`, `postedAt` desc, `employerId`, full-text on `title + description`

---

#### `job_applications`
> Tracks a seeker's application pipeline. Each document represents one user–job pair. A unique compound index on `{ userId, jobId }` prevents duplicate applications. `notes` lets users annotate interviews or offers like a lightweight personal CRM.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id` |
| `jobId` | ObjectId | ✅ | Reference → `jobs._id` |
| `status` | String | ✅ | `"saved"`, `"applied"`, `"interviewing"`, `"offered"`, or `"rejected"` |
| `appliedAt` | Date | auto | Set when status moves from `"saved"` to `"applied"` |
| `notes` | String | — | Free-text seeker annotations (interview tips, contact name, etc.) |
| `updatedAt` | Date | auto | |

**Indexes:** compound `{ userId, status }`, unique compound `{ userId, jobId }`, `jobId`

---

#### `soft_skill_assessments`
> Records each soft-skill quiz attempt with score and AI recommendations. Stored separately from `users` so the system can show attempt history and trend charts without modifying the User document.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id` |
| `assessmentType` | String | ✅ | `"communication"`, `"leadership"`, or `"problem_solving"` |
| `score` | Number | ✅ | `0–100` |
| `recommendations` | [String] | — | AI-generated improvement suggestions |
| `takenAt` | Date | auto | |

**Indexes:** `userId`, compound `{ userId, assessmentType }`, `takenAt` descending

---

### Employer

---

#### `employers`
> Employer profile — linked 1-to-1 with a `users` document where `role = "employer"`. Holds company-specific data seekers never need to see. A unique index on `userId` enforces the 1-to-1 relationship at the database level.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id`. Unique index |
| `companyName` | String | ✅ | Indexed for search |
| `industry` | String | ✅ | e.g. `"FinTech"`, `"EdTech"` |
| `companySize` | String | — | `"1-10"`, `"11-50"`, `"51-200"`, or `"200+"` |
| `cultureProfile` | Object | — | Employer-defined flexible metadata about company culture |
| `logoUrl` | String | — | URL to company logo |
| `description` | String | — | Company description shown to seekers |
| `createdAt` | Date | auto | |

**Indexes:** `userId` (unique), `companyName`, `industry`

---

#### `job_posts`
> Employer-authored job postings (draft state). Separated from `jobs` so employer-specific fields (department, workSetup, autoSortlist) do not pollute the seeker-facing `jobs` collection. When an employer publishes a post, a corresponding `jobs` document is created and `publishedJobId` is set.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `employerId` | ObjectId | ✅ | Reference → `employers._id` |
| `jobTitle` | String | ✅ | |
| `department` | String | — | |
| `employmentType` | String | ✅ | `"full-time"`, `"part-time"`, or `"contract"` |
| `workSetup` | String | ✅ | `"remote"`, `"onsite"`, or `"hybrid"` |
| `location` | String | ✅ | `"global"` or `"local"` |
| `seniority` | String | ✅ | `"junior"`, `"mid"`, or `"senior"` |
| `mandatorySkills` | [String] | ✅ | Must-have skills |
| `niceToHaveSkills` | [String] | — | Optional skills |
| `jobDescription` | String | ✅ | |
| `minMatchScore` | Number | — | Minimum readiness % for applicants to be shown this job |
| `educationPriority` | String | — | `"edu"`, `"skills"`, or `"exp"` |
| `autoSortlist` | Boolean | — | If `true`, applicants above `minMatchScore` are auto-screened |
| `sendInitialAssessment` | Boolean | — | If `true`, triggers soft-skill quiz on apply |
| `status` | String | ✅ | `"draft"`, `"published"`, or `"closed"` |
| `publishedJobId` | ObjectId | — | Reference → `jobs._id`. Set when employer publishes |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes:** `employerId`, compound `{ employerId, status }`, `status`, `publishedJobId`

---

#### `skill_thresholds`
> The employer's promise: a named role with minimum readiness score and required skills. The matching engine compares `users.roleReadinessScore` against this threshold to surface qualified seekers and vice versa.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `employerId` | ObjectId | ✅ | Reference → `employers._id` |
| `roleName` | String | ✅ | e.g. `"Backend Engineer"` |
| `requiredSkills` | [String] | ✅ | |
| `minimumReadinessScore` | Number | ✅ | Threshold percentage (e.g. `70`) |
| `softSkillFilters` | Object | — | `{ communication: Number, leadership: Number }` minimum scores |
| `isActive` | Boolean | ✅ | `false` = paused, won't surface candidates |
| `createdAt` | Date | auto | |

**Indexes:** `employerId`, compound `{ employerId, isActive }`

---

#### `profile_views`
> Append-only audit log of employer actions on seeker profiles. Never updated after creation (except `rejectionFeedback`). Powers the "Your profile was viewed" notification and the employer's talent pipeline view.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `employerId` | ObjectId | ✅ | Reference → `employers._id` |
| `userId` | ObjectId | ✅ | Reference → `users._id` (the seeker being viewed) |
| `thresholdId` | ObjectId | — | Reference → `skill_thresholds._id` |
| `action` | String | ✅ | `"viewed"`, `"invited"`, or `"passed"` |
| `rejectionFeedback` | String | — | Structured message sent to seeker when `action = "passed"` |
| `viewedAt` | Date | auto | |

**Indexes:** `employerId`, `userId`, `viewedAt` descending

---

### Gamification

---

#### `focus_sessions`
> Records each Pomodoro / focus timer session. One document per session (bucket pattern). Separated from `users` because sessions are write-heavy and grow unboundedly. The compound index on `{ userId, startTime }` makes weekly aggregation queries fast.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id` |
| `startTime` | Date | ✅ | When the timer started |
| `endTime` | Date | ✅ | When the timer ended |
| `durationMinutes` | Number | ✅ | Calculated from `endTime - startTime` |
| `courseId` | ObjectId | — | Reference → `courses._id`. The course being studied (optional) |
| `treesEarned` | Number | — | Calculated from `durationMinutes`. Used to grow `forests` |

**Indexes:** compound `{ userId, startTime }` descending, `courseId`

---

#### `forests`
> The user's virtual forest. One forest per user (unique index). Trees are embedded sub-documents because the entire forest is always rendered together. `realTreesPlanted` tracks milestone-triggered real-world tree donations. `totalTrees` is a denormalised count for fast dashboard display.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id`. Unique — one forest per user |
| `totalTrees` | Number | — | Denormalised count. Increment on each session. Default `0` |
| `trees` | [Tree] | — | Embedded array of Tree sub-documents (see below) |
| `realTreesPlanted` | Number | — | Counter triggered at milestones. Default `0` |

**Tree Sub-document** (embedded inside `trees` array):

| Field | Type | Notes |
|---|---|---|
| `plantedAt` | Date | Timestamp of the focus session |
| `growthStage` | String | `"seed"`, `"sapling"`, or `"mature"` |
| `linkedSessionId` | ObjectId | Reference → `focus_sessions._id` |

**Indexes:** `userId` (unique)

---

#### `badges`
> Verifiable credentials earned by completing roadmap phases or course milestones. One document per badge. The cryptographic `signature` field enables LinkedIn-shareable links that third parties can verify. The unique index on `signature` prevents duplicate badge issuance.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id` |
| `name` | String | ✅ | e.g. `"Foundation Complete"` |
| `skillName` | String | ✅ | The specific skill this badge certifies |
| `phase` | String | ✅ | `"foundation"`, `"build"`, `"advanced"`, or `"job_ready"` |
| `issuedAt` | Date | auto | |
| `signature` | String | ✅ | SHA-256 cryptographic hash. Unique index — no duplicates possible |
| `linkedInShareUrl` | String | — | Pre-built LinkedIn share URL |

**Indexes:** `userId`, compound `{ userId, phase }`, `signature` (unique)

---

### Community

---

#### `accountability_pods`
> Groups of 3–5 seekers with similar target roles who hold each other accountable. `leaderboard` and `members` are embedded arrays because they are bounded (max 5 members) and always read together. Pod check-in data drives the weekly streak system.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `members` | [ObjectId] | ✅ | References → `users._id`. Array of 3–5 user IDs. Indexed |
| `targetRole` | String | ✅ | The shared career goal of pod members |
| `communalForestId` | ObjectId | — | Reference → `forests._id`. The pod's shared virtual forest |
| `weeklyCheckInDay` | String | ✅ | e.g. `"Friday"` (from UI: "Check-in due Friday") |
| `leaderboard` | [Object] | — | Embedded array: `[{ userId: ObjectId, points: Number, rank: Number }]` |
| `createdAt` | Date | auto | |

**Indexes:** `members`, `targetRole`

---

#### `blog_posts`
> Community-authored stories and guides from the Community Blog. `tags` array enables topic filtering. `publishedAt = null` means the post is a draft. Full-text index on `title + content` enables search.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `authorId` | ObjectId | ✅ | Reference → `users._id` |
| `title` | String | ✅ | Text-indexed for search |
| `content` | String | ✅ | Markdown or HTML |
| `tags` | [String] | — | e.g. `["react", "career", "internship"]`. Indexed for filtering |
| `publishedAt` | Date | — | `null` = draft, set to timestamp on publish |

**Indexes:** `authorId`, `publishedAt` descending, `tags`, full-text on `title + content`

---

### System / Utility

---

#### `notifications`
> Fan-out notification store. One document per notification per user. The `isRead` boolean powers the red dot counter in the nav. The `type` enum lets the frontend render the correct icon and deep-link without parsing message text. Append-only — never update existing notifications.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `userId` | ObjectId | ✅ | Reference → `users._id` |
| `type` | String | ✅ | `"profile_viewed"`, `"threshold_met"`, `"badge_earned"`, `"pod_checkin"`, or `"job_match"` |
| `message` | String | ✅ | Human-readable notification text |
| `isRead` | Boolean | ✅ | `false` by default. Drives red dot counter |
| `createdAt` | Date | auto | |

**Indexes:** compound `{ userId, isRead }` (powers unread count query), `createdAt` descending

---

#### `job_market_trends`
> Periodically-fetched aggregated data about trending skills per role and region. Populated by a background cron job. A TTL index on `fetchedAt` automatically deletes documents older than 30 days — no manual cleanup needed. Used by the recommendation engine to adjust roadmaps.

| Field | Type | Required | Notes |
|---|---|---|---|
| `_id` | ObjectId | auto | Primary key |
| `role` | String | ✅ | e.g. `"Frontend Developer"`. Indexed |
| `trendingSkills` | [String] | ✅ | Top trending skills for this role |
| `region` | String | ✅ | `"LK"` (Sri Lanka) or `"global"` |
| `source` | String | ✅ | e.g. `"LinkedIn"`, `"Stack Overflow Survey"` |
| `fetchedAt` | Date | auto | TTL index — documents auto-deleted after 30 days |

**Indexes:** `role`, `region`, TTL on `fetchedAt` (expireAfterSeconds: 2592000)

---

## 7. Index Reference

All 58 indexes created on Atlas. Run `src/scripts/initDB.ts` to recreate if needed.

| Collection | Index | Type | Purpose |
|---|---|---|---|
| `users` | `email` | Unique | Login lookup |
| `users` | `role` | Standard | Filter seekers vs employers |
| `users` | `podId` | Standard | Find user's pod |
| `users` | `roleReadinessScore` desc | Standard | Employer pipeline sorting |
| `onboarding_profiles` | `userId` | Unique | One profile per user |
| `cvs` | `userId` | Standard | Get user's CVs |
| `cvs` | `{ userId, version }` | Compound | Get latest CV version |
| `learning_roadmaps` | `userId` | Standard | Get user's roadmap |
| `learning_roadmaps` | `{ userId, status }` | Compound | Filter active roadmaps |
| `courses` | `skillsCovered` | Standard | Recommendation queries |
| `courses` | `type` | Standard | Filter free vs paid |
| `courses` | `category` | Standard | Filter hard vs soft skills |
| `courses` | `title` | Text | Course search |
| `course_progress` | `{ userId, status }` | Compound | In Progress / Completed tabs |
| `course_progress` | `{ userId, courseId }` | Unique Compound | One record per user per course |
| `course_progress` | `courseId` | Standard | Course analytics |
| `jobs` | `seniorityLevel` | Standard | Junior / Mid / Senior filter |
| `jobs` | `source` | Standard | RootUP / AI Discovered filter |
| `jobs` | `isRecommended` | Standard | Recommended tab |
| `jobs` | `requiredSkills` | Standard | AI skill matching |
| `jobs` | `postedAt` desc | Standard | Recency sort |
| `jobs` | `employerId` | Standard | Employer's own jobs |
| `jobs` | `{ title, description }` | Text | Job search |
| `job_applications` | `{ userId, status }` | Compound | Application Tracker filter |
| `job_applications` | `{ userId, jobId }` | Unique Compound | One application per user per job |
| `job_applications` | `jobId` | Standard | Application analytics |
| `soft_skill_assessments` | `userId` | Standard | Get user's assessments |
| `soft_skill_assessments` | `{ userId, assessmentType }` | Compound | Get latest score by type |
| `soft_skill_assessments` | `takenAt` desc | Standard | History sorting |
| `employers` | `userId` | Unique | One employer profile per user |
| `employers` | `companyName` | Standard | Company search |
| `employers` | `industry` | Standard | Industry filter |
| `job_posts` | `employerId` | Standard | Employer's own posts |
| `job_posts` | `{ employerId, status }` | Compound | Filter draft / published posts |
| `job_posts` | `status` | Standard | Admin view |
| `job_posts` | `publishedJobId` | Standard | Link to published job |
| `skill_thresholds` | `employerId` | Standard | Employer's thresholds |
| `skill_thresholds` | `{ employerId, isActive }` | Compound | Active threshold matching |
| `profile_views` | `employerId` | Standard | Employer's pipeline |
| `profile_views` | `userId` | Standard | "Your profile was viewed" |
| `profile_views` | `viewedAt` desc | Standard | Recency sort |
| `focus_sessions` | `{ userId, startTime }` desc | Compound | Streak / weekly hours query |
| `focus_sessions` | `courseId` | Standard | Session analytics by course |
| `forests` | `userId` | Unique | One forest per user |
| `badges` | `userId` | Standard | Get user's badges |
| `badges` | `{ userId, phase }` | Compound | Badges by roadmap phase |
| `badges` | `signature` | Unique | Prevent duplicate badge issuance |
| `accountability_pods` | `members` | Standard | Find user's pod |
| `accountability_pods` | `targetRole` | Standard | Match pods by role |
| `blog_posts` | `authorId` | Standard | Author's own posts |
| `blog_posts` | `publishedAt` desc | Standard | Chronological feed |
| `blog_posts` | `tags` | Standard | Topic filtering |
| `blog_posts` | `{ title, content }` | Text | Blog search |
| `notifications` | `{ userId, isRead }` | Compound | Unread count (red dot) |
| `notifications` | `createdAt` desc | Standard | Notification feed |
| `job_market_trends` | `role` | Standard | Trend lookup by role |
| `job_market_trends` | `region` | Standard | LK vs global filter |
| `job_market_trends` | `fetchedAt` | TTL (30 days) | Auto-delete stale trends |

---

## 8. Entity Relationship Diagram

```
users (11 fields — auth only, SHARED by both roles)
  │
  ├──(1:1 if seeker)──► seeker_profiles ──(via podId)──► accountability_pods
  │     └── roleReadinessScore, currentSkills, missingSkills,
  │         softSkillScores, points, streakDays, podId,
  │         dreamRoles, industries, careerStage, budget, goal
  │
  ├──(1:1 if employer)──► employers ──(1:N)──► job_posts ──(1:1)──► jobs
  │                           │
  │                           ├──(1:N)──► skill_thresholds
  │                           └──(1:N)──► profile_views ──(N:1)──► users
  │
  ├──(1:N)──► cvs
  ├──(1:1)──► learning_roadmaps ──(N:M via phases)──► courses
  ├──(1:N)──► course_progress ──(N:1)──► courses
  ├──(1:N)──► job_applications ──(N:1)──► jobs
  ├──(1:N)──► soft_skill_assessments
  ├──(1:N)──► focus_sessions ──(N:1)──► forests
  ├──(1:1)──► forests
  ├──(1:N)──► badges
  ├──(1:N)──► blog_posts
  └──(1:N)──► notifications
```

---

## 9. How to Re-run the Init Script

The `initDB.ts` script is **idempotent** — safe to run multiple times. It checks if each collection already exists before creating it, and `createIndex` with the same name is a no-op if the index already exists.

```bash
# From the project root
npx ts-node src/scripts/initDB.ts
```

**When to re-run:**
- A new developer clones the repo and sets up their own Atlas cluster
- You add a new collection to `initDB.ts`
- You add a new index to an existing collection

---

## 10. Next Steps for Developers

Now that the database is live, the next step is to build **Mongoose models** for each collection. Each model is a TypeScript interface + Mongoose schema that enforces the fields documented above.

### Suggested build order

Build in this order — each layer depends on the one above it:

```
1. users model              ← everything depends on this
2. onboarding_profiles model
3. employers model
4. courses model            ← referenced by roadmaps and progress
5. learning_roadmaps model
6. course_progress model
7. cvs model
8. jobs model
9. job_applications model
10. job_posts model
11. skill_thresholds model
12. profile_views model
13. focus_sessions model
14. forests model
15. badges model
16. soft_skill_assessments model
17. accountability_pods model
18. blog_posts model
19. notifications model
20. job_market_trends model
```

### File structure convention

```
src/
├── models/
│   ├── user.model.ts
│   ├── onboardingProfile.model.ts
│   ├── employer.model.ts
│   ├── course.model.ts
│   └── ... (one file per collection)
├── routes/
├── controllers/
├── services/
├── scripts/
│   └── initDB.ts          ← already done ✅
└── config/
    └── db.ts              ← already done ✅
```

### Example model pattern to follow

```typescript
// src/models/user.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  authProvider: "local" | "google";
  role: "seeker" | "employer";
  fullName: string;
  profilePicUrl?: string;
  roleReadinessScore?: number;
  currentSkills?: string[];
  missingSkills?: string[];
  softSkillScores?: {
    communication?: number;
    leadership?: number;
    problemSolving?: number;
  };
  subscriptionTier: "free" | "premium";
  points?: number;
  streakDays?: number;
  podId?: mongoose.Types.ObjectId;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email:               { type: String, required: true, unique: true, lowercase: true },
    passwordHash:        { type: String },
    authProvider:        { type: String, enum: ["local", "google"], required: true },
    role:                { type: String, enum: ["seeker", "employer"], required: true },
    fullName:            { type: String, required: true },
    profilePicUrl:       { type: String },
    roleReadinessScore:  { type: Number, min: 0, max: 100, default: 0 },
    currentSkills:       [{ type: String }],
    missingSkills:       [{ type: String }],
    softSkillScores: {
      communication:  { type: Number },
      leadership:     { type: Number },
      problemSolving: { type: Number },
    },
    subscriptionTier:    { type: String, enum: ["free", "premium"], default: "free" },
    points:              { type: Number, default: 0 },
    streakDays:          { type: Number, default: 0 },
    podId:               { type: Schema.Types.ObjectId, ref: "AccountabilityPod" },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true } // auto-manages createdAt and updatedAt
);

export default mongoose.model<IUser>("User", UserSchema, "users");
//                                                         ↑
//                              explicitly set collection name to match initDB.ts
```

> **Important:** Always pass the exact collection name as the third argument to `mongoose.model()` to match what `initDB.ts` created. e.g. `"users"`, `"job_applications"`, `"course_progress"`. If you omit it, Mongoose auto-pluralises the model name which may not match.