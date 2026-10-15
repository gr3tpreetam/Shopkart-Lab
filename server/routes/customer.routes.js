import express from "express";

import {
    registerCustomer,
    loginCustomer,
    getCustomer,
    logoutCustomer,
    updateCustomer,
} from "../controllers/customer.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

router.get("/me", authMiddleware, getCustomer);

router.post("/logout", authMiddleware, logoutCustomer);

router.put("/settings", authMiddleware, updateCustomer);

export default router;