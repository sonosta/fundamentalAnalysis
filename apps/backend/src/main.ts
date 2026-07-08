import express from "express";
import cors from "cors";
import { getSecurityHistory } from "./services/moex";

const app = express();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:8080'
}));

app.use(express.json());

app.get("/api/prices/:secid", async (req, res) => {
  try {
    const data = await getSecurityHistory(req.params.secid);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load data from MOEX",
    });
  }
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});