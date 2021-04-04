import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import sendConfirmationEmail from "../config/nodemailer.config.js";
import { generateToken, generateConfirmation } from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import express from "express";

const router = express.Router();

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

  // res.send({
  //   message: "User was registered successfully! Please check your email",
  // });

  // sendConfirmationEmail(user.name, user.email, user.confirmationCode);
  // res.redirect("/");

  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Email: ${req.body.email}</li>
    </ul>
    <a href=http://localhost:8081/confirm/${user.confirmationCode}> Click here</a>
    </h3>`;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.user, // generated ethereal user
      pass: process.env.password, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Nodemailer Contact" rijpythondeveloper@email.com', // sender address
    to: email, // list of receivers
    subject: "Node Contact Request", // Subject line
    text: "Hello world?", // plain text body
    html: output, // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  });

  if (user) {
    const newUser = await user.save();
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      token: generateToken(user._id),
      confirmationCode: generateConfirmation(user.email),
    });
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
  console.log(req);
  console.log(req.user);

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

// @desc Get all the users
// @route GET /api/users
// @access Private/Admin

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  if (users.length > 0) {
    res.json(users);
  } else {
    res.status(404);
    throw new Error("No users found");
  }
});

// @desc delete user
// @route GET /api/users/:id
// @access Private/Admin

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("No user found");
  }
});

// @desc Get users by id
// @route GET /api/users/:id
// @access Private/Admin

const getUsersById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.eamil || user.name;

    if (user.password) {
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
  getUsers,
  deleteUser,
  getUsersById,
};
