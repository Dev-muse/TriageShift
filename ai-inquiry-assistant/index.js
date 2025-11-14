import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from './routes/user.js'

const PORT = process.env.PORT || 3000;

const app = express()

// Middleware
app.use(cors()); // Enable Cross-Origin requests
app.use(express.json()); // Parse JSON bodies

 
app.get("/", (req, res) => {
  res.send("Ai Inquiry assistant");
});

app.use("/api/auth",userRoutes)


const connectToDb = async () => {
  try {
    const response = await mongoose.connect(process.env.MONGO_URI);
    console.log("connected ", response);

    app.listen(PORT, () => console.log("server at http://localhost:3000"));
  } catch (error) {
    console.log("error connecting to mongodb", error);
  }
};

connectToDb();

