import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";

const router = Router();

router.get("/health", (_: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

router.use("/auth", authRoutes);

export default router;
