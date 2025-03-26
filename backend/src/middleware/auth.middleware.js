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

export const protectRoute = async(req,res,next)=>{
    try {
        const{token} = req.header("Authorization").replace("Bearer ","");

        if(!token) {
            return res.status(401).json({ message: "No token provided, authorization denied" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId);

        if (!req.user) {
            return res.status(404).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Token is not valid" });
    }
}