import { Router } from "express";
import { handleSession } from "../controllers/session.controller";

const router = Router();

router.get("/", handleSession);

export default router;
