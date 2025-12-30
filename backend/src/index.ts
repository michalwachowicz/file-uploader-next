import express, { Request, Response } from "express";
import { config } from "@/lib/config";

const app = express();

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
