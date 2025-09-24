import { Router } from "express";
import { handleTemplate } from "../controllers/template.controller";

const router = Router();

router.post("/", handleTemplate);

export default router;
