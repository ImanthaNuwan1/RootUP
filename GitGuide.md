# RootUP — Git Version Control Guide

This guide covers everything the team needs to work on the same codebase without conflicts.

---

## Branch Strategy

<img width="1446" height="1040" alt="image" src="https://github.com/user-attachments/assets/bb06544a-f967-42fb-b2c6-703cc2b96018" />


We use **3 levels** of branches:

```
main              ← production only. never commit directly here.
└── dev           ← shared base. all features merge into here.
    ├── feature/auth         ← Person 1 (Lead)
    ├── feature/roadmaps     ← Person 2
    └── feature/employers    ← Person 3
```

**Rule:** You only ever work on your own `feature/` branch. When your feature is done, you open a Pull Request into `dev`. The lead reviews and merges. When `dev` is stable, lead merges `dev` into `main`.

---

## First Time Setup (Do This Once)

### Step 1 — Lead creates the repo on GitHub

1. Go to [github.com](https://github.com) → New Repository
2. Name it `rootup-backend`
3. Set it to **Private**
4. Do NOT add a README (we'll push our own code)
5. Click **Create repository**

### Step 2 — Lead pushes the existing code

Run these commands inside your project folder:

```bash
# Initialize git in your project
git init

# Create a .gitignore so we never push secrets or node_modules
echo "node_modules/\n.env\ndist/" > .gitignore

# Stage all files
git add .

# First commit
git commit -m "initial commit: project setup and auth module"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rootup-backend.git

# Push to main
git branch -M main
git push -u origin main
```

### Step 3 — Create the dev branch

```bash
# Create dev branch from main and push it
git checkout -b dev
git push -u origin dev
```

### Step 4 — Invite teammates on GitHub

Go to your repo → **Settings** → **Collaborators** → Add their GitHub usernames.

---

## Teammate Setup (Each Person Does This Once)

```bash
# Clone the repo to your computer
git clone https://github.com/YOUR_USERNAME/rootup-backend.git

# Go into the project folder
cd rootup-backend

# Install dependencies
npm install

# Create your .env file (ask lead for the MONGO_URI and JWT_SECRET)
cp .env.example .env

# Switch to dev branch first
git checkout dev

# Create YOUR feature branch from dev
# Person 2:
git checkout -b feature/roadmaps

# Person 3:
git checkout -b feature/employers

# Push your branch to GitHub
git push -u origin feature/roadmaps   # or feature/employers
```

---

## Daily Workflow (Every Day You Code)

### 1. Before you start — sync with dev

Always pull the latest changes from `dev` before starting work. This prevents falling behind.

```bash
# Make sure you're on your feature branch
git checkout feature/roadmaps   # or your branch name

# Pull latest changes from dev into your branch
git pull origin dev
```

### 2. While coding — commit often

Small, frequent commits are better than one giant commit at the end.

```bash
# See what files you've changed
git status

# Stage specific files (recommended — be deliberate)
git add src/models/Roadmap.ts
git add src/controllers/roadmapController.ts

# Or stage everything you changed
git add .

# Commit with a clear message
git commit -m "feat: add Roadmap model with phase schema"
```

### 3. Push your work to GitHub

```bash
git push origin feature/roadmaps   # or your branch name
```

---

## Commit Message Format

Use this format so the team knows what changed at a glance:

```
type: short description
```

| Type | When to use |
|------|-------------|
| `feat` | Adding a new feature |
| `fix` | Fixing a bug |
| `chore` | Config, package installs, cleanup |
| `docs` | Updating documentation |
| `refactor` | Restructuring code without changing behaviour |

**Examples:**
```bash
git commit -m "feat: add Skill model and GET /skills route"
git commit -m "fix: correct password hash field name in login"
git commit -m "chore: install mongoose and update package.json"
git commit -m "docs: update README with setup instructions"
```

---

## Opening a Pull Request (When Your Feature Is Ready)

1. Push your latest code: `git push origin feature/roadmaps`
2. Go to the GitHub repo in your browser
3. Click **"Compare & pull request"** (GitHub shows this automatically)
4. Set base branch to `dev` (not main)
5. Write a short description of what you built
6. Assign the **Lead** as reviewer
7. Click **Create pull request**

The lead will review, leave comments if needed, and merge it into `dev`.

---

## Lead Merging dev into main (When Ready to Release)

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

---

## Handling Merge Conflicts

A conflict happens when two people edited the same line of the same file. Git can't decide which version to keep, so it asks you.

```bash
# After pulling, if you see "CONFLICT":
# Open the conflicted file in VS Code
# You'll see markers like this:

<<<<<<< HEAD
  your version of the code
=======
  teammate's version of the code
>>>>>>> dev

# Delete the markers and keep the correct version (or combine both)
# Then:
git add src/the-conflicted-file.ts
git commit -m "fix: resolve merge conflict in User model"
```

**Prevention:** The branch ownership rules in this project mean conflicts should be rare. Person 1 owns auth files, Person 2 owns roadmap files, Person 3 owns employer files. Nobody touches another person's files.

---

## Quick Reference Card

```bash
# Check which branch you're on
git branch

# Switch to a branch
git checkout feature/roadmaps

# See what's changed
git status

# Pull latest from dev
git pull origin dev

# Stage + commit
git add .
git commit -m "feat: your message here"

# Push to GitHub
git push origin feature/roadmaps

# See commit history
git log --oneline
```

---

## .gitignore (Already Created — Do Not Remove These)

```
node_modules/
.env
dist/
```

- `node_modules/` — 200MB+ of packages. Everyone installs their own with `npm install`
- `.env` — contains your MONGO_URI and JWT_SECRET. **Never push this to GitHub**
- `dist/` — compiled JavaScript output, not needed in the repo
