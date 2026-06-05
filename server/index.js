import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Temporary endpoint just to prove the backend is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GAFFER backend is running" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`GAFFER backend on http://localhost:${PORT}`));