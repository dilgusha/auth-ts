import { RegisterDto, LoginDto, CreateUserDto } from "../types/auth";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateAccessToken, generateRefreshToken, Role, saveRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { query } from "../config/connection";
import { generateOTP } from "../utils/otp";
import { sendOtpEmail, sendVerificationEmail, sendWelcomeEmail } from "../utils/mailer";

export class AuthService {

  async getProfile(userId: string) {
    const result = await query(
      `SELECT id, name, email, role, is_verified
    FROM users
    WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  }

  async register(data: RegisterDto) {
    const existing = await query("SELECT * FROM users WHERE email = $1", [data.email]);
    if (existing.rows.length > 0) throw new Error("Email already registered");

    const hashed = await hashPassword(data.password);

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const result = await query(
      `INSERT INTO users 
     (name, email, password,email_verification_code, email_verification_expires)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name`,
      [data.name, data.email, hashed, otp, expires]
    );

    const created = result.rows[0];
    await sendVerificationEmail(data.email, otp);
    // const accessToken = generateAccessToken({ id: String(created.id), email: created.email, role: Role.USER });
    // const refreshToken = generateRefreshToken();

    // await saveRefreshToken(String(created.id), refreshToken);

    // const { password, ...userNoPass } = created;
    // return { user: userNoPass, accessToken, refreshToken };

    return {
      message: "Registration successful. Verification code sent to email.",
      user: created,
    };
  }


  async verifyEmail(email: string, code: string) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) throw new Error("User not found");

    const user = result.rows[0];

    if (user.is_verified) {
      throw new Error("Email already verified");
    }

    if (!user.email_verification_code) {
      throw new Error("Verification code not found");
    }

    if (user.email_verification_code !== code) {
      throw new Error("Invalid verification code");
    }

    if (user.email_verification_expires < new Date()) {
      throw new Error("Verification code expired");
    }


    // const result = await query(  //sorgularin hamisi duz olmalidir where, and,and
    //   `SELECT 1 FROM users
    //  WHERE email = $1
    //    AND email_verification_code = $2
    //    AND email_verification_expires > NOW()`,
    //   [email, code]
    // );

    // if (!result.rows[0]) throw new Error("Invalid or expired code");

    await query(
      `UPDATE users
     SET is_verified = true,
         email_verification_code = NULL,
         email_verification_expires = NULL
     WHERE email = $1`,
      [email]
    );

    return { message: "Email verified successfully" };
  }



  async login(data: LoginDto) {
    const result = await query("SELECT * FROM users WHERE email = $1", [data.email]);
    const user = result.rows[0];
    if (!user || !user.password) throw new Error("Invalid credentials");

    if (!user.is_verified) {
      throw new Error("Please verify your email first");
    }

    const ok = await comparePassword(data.password, user.password);
    if (!ok) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken({ id: String(user.id), email: user.email, role: Role.USER });
    const refreshToken = generateRefreshToken();

    await saveRefreshToken(String(user.id), refreshToken);

    const { password, email_verification_code, email_verification_expires, reset_password_code, reset_password_expires, role, ...userNoPass } = user;
    return { user: userNoPass, accessToken, refreshToken };
  }


  async forgotPass(email: string) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);  // 10 deq

    await query(
      "UPDATE users SET reset_password_code = $1, reset_password_expires = $2 WHERE email = $3",
      [otp, expires, email]
    );

    await sendOtpEmail(email, otp);
    return { message: "Password reset code sent to email" };
  }

  async resetPass(email: string, code: string, newPassword: string) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) throw new Error("User not found");

    if (!user.reset_password_code) {
      throw new Error("Password reset code not found");
    }
    if (user.reset_password_code !== code) {
      throw new Error("Invalid password reset code");
    }
    if (user.reset_password_expires < new Date()) {
      throw new Error("Password reset code expired");
    }
    const hashed = await hashPassword(newPassword);

    await query(
      "UPDATE users SET password = $1,  reset_password_code = NULL, reset_password_expires = NULL WHERE email = $2",
      [hashed, email]
    );

    return { message: "Password reset successful" };

  }


  async changePass(userId: string, oldPassword: string, newPassword: string) {
    const result = await query("SELECT password FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];

    if (!user || !user.password) throw new Error("User not found");

    const ok = await comparePassword(oldPassword, user.password);
    if (!ok) throw new Error("Old password is incorrect");

    const same = await comparePassword(newPassword, user.password);
    if (same) throw new Error("New password must be different from old password");

    const hashed = await hashPassword(newPassword);

    await query("UPDATE users SET password = $1 WHERE id = $2", [hashed, userId]);

    await query("UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1", [userId]);

    return { message: "Password changed successfully" };
  }


  // async sendVerifyCode(email: string) {
  //   const result = await query("SELECT * FROM users WHERE email = $1", [email]);
  //   const user = result.rows[0];

  //   if (!user) throw new Error("User not found");
  //   if (user.is_verified) {
  //     throw new Error("Email already verified");
  //   }

  //   const code = generateOTP();
  //   const expires = new Date(Date.now() + 5 * 60 * 1000);  // 5 deq 

  //   await query(
  //     "UPDATE users SET email_verification_code = $1, email_verification_expires = $2 WHERE email = $3",
  //     [code, expires, email]
  //   );

  //   await sendVerificationEmail(email, code);

  //   return { message: "Verification code sent" };
  // }
  async refreshToken(token: string) {

    if (!token) {
      throw new Error("No token provided");
    }
    const result = await verifyRefreshToken(token);

    if (!result) {
      throw new Error("Invalid or expired refresh token");
    }

    const accessToken = generateAccessToken({
      id: String(result.user_id),
      email: result.email,
      role: Role.USER
    });

    return { accessToken };
  }

  async logout(refreshToken: string, hardDelete: boolean = false) {
    if (!refreshToken && !hardDelete) throw new Error("No token provided");

    if (hardDelete) {
      const result = await query(
        "DELETE FROM refresh_tokens WHERE token = $1 RETURNING *",
        [refreshToken]
      );

      if (!result.rows[0]) throw new Error("Token not found");
      return { message: "Logout successful (hard delete)" };

    } else {

      const result = await query(
        "UPDATE refresh_tokens SET is_revoked = true WHERE token = $1 RETURNING *",
        [refreshToken]
      );

      if (!result.rows[0]) throw new Error("Token not found");
      return { message: "Logout successful (soft delete)" };
    }
  }


  async createUser(data: CreateUserDto) {
    const existing = await query("SELECT * FROM users WHERE email = $1", [data.email]);
    if (existing.rows.length > 0) throw new Error("Email already registered");

    const hashed = await hashPassword(data.password);
    const result = await query(
      "INSERT INTO users (name, email, password,role) VALUES ($1, $2, $3,$4) RETURNING *",
      [data.name, data.email, hashed, data.role]
    );

    const created = result.rows[0];
    const accessToken = generateAccessToken({ id: String(created.id), email: created.email, role: created.role });
    const refreshToken = generateRefreshToken();

    await saveRefreshToken(String(created.id), refreshToken);

    const { password, ...userNoPass } = created;
    return { user: userNoPass, accessToken, refreshToken };


  }




}
