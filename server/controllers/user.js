const {
  signUpSchema,
  signInSchema,
  updateUserSchema,
  userIdValidation,
} = require("../lib/validation/user");
const { z } = require("zod");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { setTokenCookie } = require("../lib/utills");
const user = require("../models/user");

const signUp = async (req, res) => {
  try {
    const { fullName, username, email, password } = signUpSchema.parse(req.body);

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    const newUser = await user.save();

    if (!newUser) {
      return res.status(400).json({ message: "Failed to create user" });
    }

    setTokenCookie(res, newUser, process.env.JWT_SECRET);

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const signIn = async (req, res) => {
  try {
    const { username, password } = signInSchema.parse(req.body);

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    setTokenCookie(res, user, process.env.JWT_SECRET);

    return res.status(200).json({ message: "User signed in succesfuly" });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const logOut = async (req, res) => {
  try {
    

    res.clearCookie("token");
    return res.status(200).json({ message: "User signed out succefully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.user._id !== req.params.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = userIdValidation.parse(req.params.userId);

    const { fullName, username, email, password } = updateUserSchema.parse(req.body);

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    if (password) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        return res
          .status(400)
          .json({ message: "New password must be different than last password" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    user.fullName = fullName ?? user.fullName;
    user.username = username ?? user.username;
    user.email = email ?? user.email;

    const updatedUser = await user.save();

    if (!updatedUser) {
      return res.status(400).json({ message: "Failed to update user" });
    }

    //setTokenCookie(res, updatedUser, process.env.JWT_SECRET);

    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

const me = async (req, res) => {
  try {
    const { createdAt, email, fullName, username, _id, exp } = req.user;
    const user = {
      createdAt,
      email,
      fullName,
      username,
      id: _id,
      tokenExpired: exp,
    };
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "internal server error" });
  }
};

module.exports = {
  signUp,
  signIn,
  logOut,
  me,
};
