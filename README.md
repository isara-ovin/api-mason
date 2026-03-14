# APIMason

APIMason is an API orchestration tool that allows users to seamlessly import Postman collections and visually build sequential API execution flows using a node-based architecture.

## Features
- **Visual Drag & Drop Interface**: Build flows with API requests, delays, transformations, and branching logic.
- **Deep Slate Premium UI**: Built with a sleek dark mode and modern `lucide-react` icons.
- **Real-Time Execution Logs**: Server-Sent Events (SSE) power live execution updates.
- **Postman Native Integration**: Easily import collections and environments.
- **Persistent Data**: Powered seamlessly by an embedded SQLite database.

## Local Development Requirements
Ensure you are using Node 20 or higher.
```bash
# Terminal 1 - Running the API & Engine (Express.js)
cd server
npm install
npm run dev

# Terminal 2 - Running the UI (Vite / React)
cd client
npm install
npm run dev
```

## Running via Docker
APIMason provides a lightweight, multi-stage, single-container Docker execution mode. The backend server automatically serves the static frontend UI.

```bash
docker-compose up -d --build
```
Once built, navigate to `http://localhost:3001` to use the application. All executions and saves will be persisted locally to the Docker volume inside your `./server/data` director.
