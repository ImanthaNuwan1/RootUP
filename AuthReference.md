### 1. Get logged in user details

This endpoint will give you user details of the logged user. No request body. You have to pass the token in the header.

- API Endpoint
```http://localhost:5000/api/auth/me```

- Request Method - ```GET```

- Token - ```You have to pass the token in the header```

- Request Body ```NONE```
  


-Success Output
```JSON
{
    "success": true,
    "data": {
        "user": {
            "id": "69e97e2a94773a03a087faa7",
            "fullName": "Sachala Indudunu",
            "email": "sacgaka@gmail.com",
            "role": "seeker",
            "createdAt": "2026-04-23T02:04:26.714Z"
        }
    }
}
```


---
### 2. Register New User

- API Endpoint
```http://localhost:5000/api/auth/register```

- Request Method - ```POST```

- Token - ```New token will be generated and send via response body```

- Request Body
  
```JSON
{
  "fullName": "Sachala Indudunu",
  "email": "sacgaka@gmail.com",
  "passwordHash": "sach1234",
  "role": "seeker"
}
```

-Success Output
```JSON
{
    "success": true,
    "message": "Account created successfully.",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZTk3ZTJhOTQ3NzNhMDNhMDg3ZmFhNyIsInJvbGUiOiJzZWVrZXIiLCJpYXQiOjE3NzY5MDk4NjcsImV4cCI6MTc3NzUxNDY2N30.0mFxHJi14HFlHi5DovD9O6kCznQ17EhK3qjxQNXgdeA",
        "user": {
            "id": "69e97e2a94773a03a087faa7",
            "fullName": "Sachala Indudunu",
            "email": "sacgaka@gmail.com",
            "role": "seeker"
        }
    }
}
```


---
### 3. Login User

- API Endpoint
```http://localhost:5000/api/auth/login```

- Request Method - ```POST```

- Token - ```User token is send via response body```

- Request Body
  
```JSON
{
  "email": "sacgaka@gmail.com",
  "password": "sach1234"
}
```

-Success Output
```JSON
{
    "success": true,
    "message": "Logged in successfully.",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZTk3ZTJhOTQ3NzNhMDNhMDg3ZmFhNyIsInJvbGUiOiJzZWVrZXIiLCJpYXQiOjE3NzY5NTg0NjAsImV4cCI6MTc3NzU2MzI2MH0.7J8mXQc5sJFh1a4TiLSOeiW0iG2wh6SqoaqyVKfLOHs",
        "user": {
            "id": "69e97e2a94773a03a087faa7",
            "fullName": "Sachala Indudunu",
            "email": "sacgaka@gmail.com",
            "role": "seeker"
        }
    }
}
```
