import { Router } from "express";
import * as authController from "@/controllers/authController";
import { validateRequest } from "@/middleware/validateRequest";
import { registerApiSchema, loginSchema } from "@file-uploader/shared";

const router = Router();

router.post(
  "/register",
  validateRequest(registerApiSchema),
  authController.register
);
router.post("/login", validateRequest(loginSchema), authController.login);

export default router;
