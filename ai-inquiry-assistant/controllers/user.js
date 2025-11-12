import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.models";

// inngest client
import inngest from "../inngest/client.js";
import User from "../models/user.models";

export const signUp = async (req, res) => {
  const { email, password, specialities = [] } = await req.body;

  // hashpassword
  const hashedPassword = bcrypt.hash(password, 10);
  try {
    //create user
    const user = await User.create({
      email,
      password: hashedPassword,
      specialities,
    });

    // fire inngest event defined in on-signup.js
    await inngest.send({
      name: "user/signup",
      data: {
        email,
      },
    });

    // sign in user /create jwt
    const token = await jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};

export const signIn = async (req, res) => {
  const { email, password } = await req.body;

  // hashpassword
  try {
    //find user
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({ error: "User not found!" });
    }
    // compare passwords

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Invalid credentials: wrong password" });
    }

    // sign in user /create jwt
    const token = await jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // clearing token

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized user" });
    }

    // verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Unauthorized user" });
    });

    res.status(200).json({ message: "Logged out successfuly!" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", details: error.message });
  }
};
