import { Request, Response } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // res.status(201).json(result);
    res.status(201).json({ user: result.user, accessToken: result.accessToken });

  } catch (err: any) {
    res.status(400).json({ message: err.message || "Registration failed" });
  }
}


export async function createUser(req: Request, res: Response) {
  try {
    const result = await authService.createUser(req.body);

    // res.status(201).json(result);
    res.status(201).json({ user: result.user, accessToken: result.accessToken });

  } catch (err: any) {
    res.status(400).json({ message: err.message || "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    return res.json({ user: result.user, accessToken: result.accessToken });

  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Login failed" });
  }
}


// export async function refreshToken(req: Request, res: Response) {
//   try {
//     const { token } = req.body;

//     if (!token) {
//       return res.status(400).json({ message: "Refresh token is required" });
//     }

//     const result = await authService.refreshToken(token);

//     return res.json(result);
//   } catch (err: any) {
//     return res.status(401).json({ message: err.message || "Could not refresh access token" });
//   }

// }

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const result = await authService.refreshToken(token);

    return res.json(result);
  } catch (err: any) {
    return res.status(401).json({ message: err.message || "Could not refresh access token" });
  }
}


export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}



export async function sendVerifyCode(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const result = await authService.sendVerifyCode(email);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
  
}
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyEmail(email, code);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}