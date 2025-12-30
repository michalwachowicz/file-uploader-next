import express, { Request, Response } from "express";
import { config } from "@/lib/config";
import apiRouter from "@/routes/api";

const app = express();

app.use(express.json());

app.use("/api", apiRouter);

app.use((_: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
