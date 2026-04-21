Backend (Node + Express) Coding Rules

### Layered Backend Rule (VERY IMPORTANT)

Backend must follow:

```
Route → Controller → Service → Model
```

#### Responsibilities:

* **Route:** URL mapping
* **Controller:** Request/response
* **Service:** Business logic
* **Model:** Database schema

---

### ❌ Forbidden Backend Practices

* Writing logic inside routes
* Accessing DB inside controllers
* Mixing validation with business logic

---

### ✔ Correct Example

```js
// routes/userRoutes.js
router.post("/login", loginUser);
```

```js
// controllers/userController.js
export const loginUser = async (req, res) => {
  const token = await userService.login(req.body);
  res.json({ token });
};
```

```js
// services/userService.js
export const login = async (data) => {
  // business logic here
};
```

---

## 🔐 Authentication Rules

* JWT for auth
* Token stored in HTTP headers
* Backend validates token
* Frontend never trusts itself

---

## 🧪 Error Handling Rules

* No console.log in production
* Central error handler middleware
* Meaningful error messages
