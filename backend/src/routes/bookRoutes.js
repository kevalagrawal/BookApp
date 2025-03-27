import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;
        if (!image || !title || !caption || !rating) {
            return res.status(400).json({ message: "Please provide all fields" });
        }

        if (typeof rating !== "number" || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
        }

        // Upload the image to Cloudinary
        let imageUrl;
        try {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        } catch (error) {
            return res.status(500).json({ message: "Image upload failed", error: error.message });
        }

        // Save to the database
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        });

        await newBook.save();

        res.status(201).json(newBook);
    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get("/", protectRoute, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 2;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 }) // Descending order
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");

        const total = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks: total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.log("Error in get all books route", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        //delete the image from the cloudinary
        if(book.image && book.image.includes("cloudinary")){
            try {
                const publicId = book.image.split("/").pop().split(".")[0];

                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting the image from the cloudinary", deleteError);
            }
        }


        await book.deleteOne();
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log("Error deleting the book", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get("/user",protectRoute, async(req,res)=>{
    try {
        const books = await Book.find({user:req.user._id}).sort({createdAt : -1});

        res.json(books);
    } catch (error) {
        console.log("Get user books error: ",error.message);
        res.status(500).json({message:"Server Error"});
    }
})

export default router;