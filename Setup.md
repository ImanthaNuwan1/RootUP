Scalable Folder Structure
```
Scalable folder structure

/src
  ├── /config       # Database connection & env variables
  ├── /controllers  # Logic for handling requests
  ├── /models       # Mongoose schemas & TypeScript interfaces
  ├── /routes       # API endpoint definitions
  ├── /middleware   # Auth, error handling, and logging
  ├── index.ts      # Main entry point
/.env               # Secrets (Port, Mongo URI)
```


##

Backend TypeScript Configuration


Create a tsconfig.json at the root using npx tsc --init. To keep the project clean, use a separate source and build structure. 
```
json

{
  "compilerOptions": {
    "target": "ES2020",         /* Modern JavaScript features */
    "module": "CommonJS",       /* Standard for Node.js */
    "rootDir": "./src",         /* Where your .ts files live */
    "outDir": "./dist",         /* Where compiled .js goes */
    "strict": true,             /* Enable all strict type-checking */
    "esModuleInterop": true,    /* Better compatibility with older libraries */
    "skipLibCheck": true        /* Speeds up compilation */
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```