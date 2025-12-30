import { Router, Request, Response } from "express";

const router = Router();

router.get("/health", (_: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// TODO: Add authentication routes here
// router.post("/register", ...)
// router.post("/login", ...)

export default router;
