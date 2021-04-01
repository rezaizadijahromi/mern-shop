import nodemailer from "nodemailer";

const userSender = process.env.user;
const passSender = process.env.password;

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: userSender,
    pass: passSender,
  },
});

const sendConfirmationEmail = (name, email, confirmationCode) => {
  transport
    .sendMail({
      from: userSender,
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
            <h2>Hello ${name}</h2>
            <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
            <a href=http://localhost:8081/confirm/${confirmationCode}> Click here</a>
            </div>`,
    })
    .catch((err) => console.log(err));
};

export default sendConfirmationEmail;
