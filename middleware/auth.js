import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const generateToken = (userId, role) =>
    jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: "30d" });

export const protect = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
        return res.status(401).json({ success: false, message: "Not authorized, no token" });

    try {
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(401).json({ success: false, message: "User not found" });
        next();
    } catch {
        res.status(401).json({ success: false, message: "Token invalid or expired" });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin")
        return res.status(403).json({ success: false, message: "Admin access required" });
    next();
};
