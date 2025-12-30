import { Router } from "express";
import * as authController from "@/controllers/authController";
import { validateRequest } from "@/middleware/validateRequest";
import { registerSchema, loginSchema } from "@file-uploader/shared";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register
);
router.post("/login", validateRequest(loginSchema), authController.login);

export default router;
