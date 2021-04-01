import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import sendConfirmationEmail from "../config/nodemailer.config.js";
import { generateToken, generateConfirmation } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// @desc Login in get token
// @route POST /api/users/login
// @access Public

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user.status === "Active") {
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
        confirmationCode: generateConfirmation(user.email),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } else {
    res.status(401);
    throw new Error("Please varify your email first");
  }
});

// @desc Register a new user
// @route POST /api/users
// @access Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await new User({
    name,
    email,
    password,
    confirmationCode: generateConfirmation(email),
  });

  if (user) {
    const newUser = await user.save();
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      confirmationCode: generateConfirmation(user.email),
    });

    res.send({
      message: "User was registered successfully! Please check your email",
    });

    sendConfirmationEmail(user.name, user.email, user.confirmationCode);
    res.redirect("/");
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Confirm the email
// @route POST /api/users/confirm/:confirmationCode
// @access Public

const verifyUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    confirmationCode: req.params.confirmationCode,
  });

  if (user) {
    if (user.status !== "Active") {
      console.log(user);
      user.status = "Active";
      const varifiedUser = await user.save();
      res.json({
        _id: varifiedUser._id,
        name: varifiedUser.name,
        email: varifiedUser.email,
        isAdmin: varifiedUser.isAdmin,
        status: varifiedUser.status,
      });
    } else {
      res.status(400);
      throw new Error("The user already confirm email");
    }
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Get user profile
// @route GET /api/users/profile
// @access Private

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc Get user profile
// @route PUT /api/users/profile
// @access Private

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    (user.name = req.body.name || user.name),
      (user.email = req.body.email || user.email);
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  verifyUser,
};
