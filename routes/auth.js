import express from "express";
import User from "../models/User.js";
import { generateToken, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ success: false, message: "All fields are required" });

    if (password.length < 6)
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id, user.role);

    res.status(201).json({
        success: true,
        message: "Account created successfully",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
    });
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user._id, user.role);

    res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
    });
});

router.get("/me", protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
});

router.put("/me", protect, async (req, res) => {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, email },
        { new: true, runValidators: true }
    );
    res.json({ success: true, user });
});

export default router;
