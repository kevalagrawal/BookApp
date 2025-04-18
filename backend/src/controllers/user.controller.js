import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import User from "../models/User.js"

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d"
    })
}

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must of the length 6" });
        }
        if (username.length < 3) {
            return res.status(400).json({ message: "Username must of the length 3" });
        }

        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ message: "Username already exists" });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ message: "Email already exists" });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        const user = new User({
            username,
            email,
            password: hashedPassword,
            profileImage
        })

        await user.save();

        const token = generateToken(user._id);

        res.status(201).json(
            { message: "User registered successfully",
             token, 
             user: { 
                id: user._id, 
                username: user.username, 
                email: user.email, 
                profileImage: user.profileImage,
                createdAt : user.createdAt } });
    } catch (error) {
        console.log("Error in the register controller");
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const login = async (req, res) => {
    try {
        const {email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        };

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User does not exists"});
        }

        const isPasswordCorrect = await bcrypt.compare(password,user.password);

        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid Credentials"});
        }

        const token = generateToken(user._id);
        return res.status(200).json(
            { message: "User logged in successfully",
             token, 
             user: { 
                id: user._id, 
                username: user.username, 
                email: user.email, 
                profileImage: user.profileImage,
                createdAt: user.createdAt } });

    } catch (error) {
        console.log("Error in login controller");
        return res.status(500).json({message:"Internal server error"});
    }
}