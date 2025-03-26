import jwt from "jsonwebtoken"
import User from "../models/User.js"

// const response = await fetch(`http://localhost:3000/api/books`,{
//     method:"POST",
//     body:JSON.stringify({
//         title,
//         caption
//     }),
//     headers : {Authorization:`Bearer ${token}`},
// })

export const protectRoute = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        // Extract token safely
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Attach user to request
        req.user = await User.findById(decoded.userId).select("-password");

        if (!req.user) {
            return res.status(404).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};