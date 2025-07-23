import express, { urlencoded } from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import { renderPage } from "vite-plugin-ssr/server";
import { createServer as createViteServer } from "vite";

// Import your routes
import userRoutes from "./routes/userRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import mailRoutes from "./routes/mailRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import sitemapRoutes from "./routes/sitemapRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

// Setup Express
const app = express();
app.use(compression());
app.use(express.json());
app.use(urlencoded({ extended: true }));

// CORS setup
const allowedOrigins = [
  "http://localhost:5173",
  "https://starlitjournals.com",
  "https://www.starlitjournals.com",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || "*");
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// Route: Root
app.get("/api", (req, res) => {
  res.send("Hello from Starlit Journals API!");
});

// Use Routers
app.use("/", userRoutes);
app.use("/", journalRoutes);
app.use("/", mailRoutes);
app.use("/", subscriptionRoutes);
app.use("/", commentRoutes);
app.use("/api", sitemapRoutes);
app.use("/", feedbackRoutes);

// -- Optional Proxy Image Endpoint (uncomment if needed)
// app.get("/proxy-image", async (req, res) => {
//   const imageUrl = req.query.url;
//   if (!imageUrl) return res.status(400).send("Image URL is required");

//   try {
//     const response = await axios.get(imageUrl, { responseType: "stream" });
//     res.set("Content-Type", response.headers["content-type"]);
//     response.data.pipe(res);
//   } catch (error) {
//     console.error("Error fetching image:", error.message);
//     res.status(500).send("Error fetching image");
//   }
// });

// ------------------ SSR Setup Below ------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";
const root = path.resolve(__dirname, "..");

async function startServer() {
  if (isProd) {
    app.use(express.static(path.join(root, "dist/client")));

    app.get("*", async (req, res, next) => {
      const pageContextInit = { urlOriginal: req.originalUrl };
      const result = await renderPage(pageContextInit);
      if (result.nothingRendered) return next();
      res.status(result.statusCode).send(result.renderedHtml);
    });
  } else {
    const vite = await createViteServer({
      root,
      server: { middlewareMode: "ssr" },
    });

    app.use(vite.middlewares);

    app.get("*", async (req, res, next) => {
      try {
        const pageContextInit = { urlOriginal: req.originalUrl };
        const result = await renderPage(pageContextInit);
        if (result.nothingRendered) return next();
        res.status(result.statusCode).send(result.renderedHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  // Connect to MongoDB and start server
  const mongoURL = "mongodb://localhost:27017/CozyMind";
  mongoose
    .connect(mongoURL)
    .then(() => {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () =>
        console.log(`🚀 Server running at http://localhost:${PORT}`)
      );
    })
    .catch((err) => console.log("MongoDB connection error:", err));
}

startServer();
