# Contributing Guide

This document defines the **mandatory coding rules, standards, and workflows** for this project.  
All contributors **must follow these rules** to maintain code quality and professionalism.

> ⚠️ These rules are **non-negotiable**. Pull Requests that do not comply will not be merged.

---

## 1. General Engineering Rules (Non-Negotiable)

- **No direct commits to the `main` branch**
- All changes must go through **Pull Requests**
- **One task per branch**
- **One feature per Pull Request**
- Code **must build successfully** before merge
- **Unreviewed code is never considered done**

### ❌ Incorrect Branching
```txt
main
 └── navbar-footer-home-changes
```
### ✅ Correct Branching
```txt
main
 └── development
         └── UI/UX
               └── feature/navbar
               └── fix/button
               └── feature/login
               └── fix/animation
         └── backend
```
## 2. Git & Branching Rules
- Branch names
```txt
ex: feature/xyz
    fix/xyz
```
- Commit message must reference Jira ticket IDs
```txt
"LMS-12 add responsive navbar"
```
- Avoid meaningless branch names

## 3. Project structure Rules
- app/ folder only handles routing
- components/ folder for reusable UI components
- No business logic inside UI components
- Pages assemble components only
### ❌ Bad Example
```txt
// components/CourseCard.jsx ❌
export default function CourseCard() {
  const courses = [
    { name: "Maths", price: 2000 },
    { name: "Physics", price: 2500 }
  ];

  return courses.map(course => (
    <div>{course.name}</div>
  ));
}
```
❌ Problem:
- Component controls data
- Hard to reuse
- Breaks separation of concerns

### ✅ Correct Way
Page decides what
```txt
// app/courses/page.jsx
import CourseCard from "@/components/CourseCard";

export default function CoursesPage() {
  const courses = [
    { name: "Maths", price: 2000 },
    { name: "Physics", price: 2500 }
  ];

  return courses.map(course => (
    <CourseCard key={course.name} course={course} />
  ));
}

```
Component decides HOW
```txt
// components/CourseCard.jsx
export default function CourseCard({ course }) {
  return <div>{course.name}</div>;
}

```
```
Pages = data + decisions
Components = display only
```

## 4. React & Next.js Rules
- One component = one responsibility
- File name must match component name
  `Ex: Navbar.jsx -> Navbar()`
- Hooks must be at top level level
- Use `use client` only when required
- Destruct props
  ### ❌ Bad Example
```txt
function Hero(props) {
  return <h1>{props.title}</h1>;
}

```
### ✅ Correct way
```txt
//With a single prop
function Hero({ title }) {
  return <h1>{title}</h1>;
}

//With multiple props
function Hero({ title, subtitle, ctaText }) {
  return (
    <>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </>
  );
}

```

## 5. Styling Rules (Tailwind CSS)
- Use Tailwind utility classes only
- Avoid inline styles
- Follow consistent class ordering
  `Ex: layout → spacing → typography → color → effects`
```bash
<div class="flex items-center p-4 text-lg text-white bg-blue-600 rounded-lg">
```
## 6. Code Quality Rules
- No console.log in final code
- No unused imports
- No commented-out code
- Avoid hardcoded values

## 7. Readability Rules
- Functions should be under 30 lines
- Use meaningful variable names
- Avoid magic numbers
### ❌ Incorrect Way
```txt
if (password.length > 7) {
  allowAccess();
}
```
### ✅ Correct Way
```txt
const MIN_PASSWORD_LENGTH = 8;

if (password.length >= MIN_PASSWORD_LENGTH) {
  allowAccess();
}
```
- Prefer early returns
### ❌ Incorrect Way
```txt
function Dashboard({ user }) {
  if (user) {
    if (user.isActive) {
      return <h1>Welcome</h1>;
    } else {
      return <h1>Inactive</h1>;
    }
  } else {
    return <h1>Please login</h1>;
  }
}
```
### ✅ Correct Way
```txt
function Dashboard({ user }) {
  if (!user) return <h1>Please login</h1>;
  if (!user.isActive) return <h1>Inactive</h1>;

  return <h1>Welcome</h1>;
}
```
## 8. Before Merge Checklist
- Code builds successfully
- Responsive on mobile
- Matches UI design
- Follows coding standards
- Clear commit history

## 9. Documentation Rules
- Update README when structure changes
- Comments explain why, not what
- Avoid obvious comments

## 10. Strictly Forbidden
- Pushing broken code
- Large Pull Requests
- Mixing refactors with features
- Adding out-of-scope features
- Blind copy-paste code

## 11. Naming rules
- Component names must use PascalCase naming convention.
```bash
Navbar.jsx
CourseCard.jsx
UserProfile.jsx
```
- Variables should follow the Camelcase (camelCase) naming convention.
- Always use meaningful variable names
- Booleans must sound like yes/no question
```bash
isLoading
hasAccess
canEdit
```
- Functions must describe what they do using verbs.
```bash
getUserData()
calculateTotalPrice()
fetchCourses()
```
- Event handlers must start with ”handle” and follow camelCase
```bash
handleSubmit()
handleClick()
handleLogin()
```

- Constants naming must be UPPER_SNAKE_CASE
```bash
const MAX_LOGIN_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;
```
- Avoid abbreviations
