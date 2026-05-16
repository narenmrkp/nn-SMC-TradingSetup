import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { SMCEngine } from "./src/lib/smc-engine.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
  });

  app.get("/api/signals", (req, res) => {
    try {
      console.log(`[${new Date().toISOString()}] Incoming request: ${req.url}`);
      const candles = SMCEngine.generateMockData(300);
      const analysis = SMCEngine.analyze(candles);
      res.json(analysis);
    } catch (error) {
      console.error("CRITICAL ERROR in /api/signals handler:", error);
      res.status(500).json({ 
        error: "Internal Server Error", 
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Error handle middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Handler:", err);
    res.status(500).json({ error: "Global Server Error", message: err.message });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
