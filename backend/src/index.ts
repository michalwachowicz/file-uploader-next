import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "@/lib/config";
import apiRouter from "@/routes/api";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api", apiRouter);

app.use((_: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
