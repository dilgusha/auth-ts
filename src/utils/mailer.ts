import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});


export const sendWelcomeEmail = async (email: string, name: string) => {
    await transporter.sendMail({
        from: `"Todo App" <${process.env.MAIL_USER}>`, //hardan gedir email mes: sirket email
        to: email,  //hara gedecek mes:istifadeci email
        subject: "Welcome to App",
        html: `
      <h2>Xoş gəlmisiniz, ${name}</h2>
      <p>Qeydiyyatınız uğurla tamamlandı.</p>
      <p>Artıq Todo App-dən istifadə edə bilərsiniz.</p>
    `
    });
};


export const sendVerificationEmail = async (email: string, code: string) => {
    await transporter.sendMail({
        from: `"Todo App" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Verify your email",
        html: `
          <h2>Email Verification</h2>
          <p>Your verification code:</p>
          <h1>${code}</h1>
          <p>This code expires in 5 minutes</p>
        `
    });
};