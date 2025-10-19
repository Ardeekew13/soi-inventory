import jwt, { JwtPayload } from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface DecodedUser extends JwtPayload {
  id: string;
  username: string;
  role: string;
}

export function generateToken(user: {
  _id: string;
  username: string;
  role: string;
}): string {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

export function verifyToken(token: string): DecodedUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedUser;
  } catch (err) {
    return null;
  }
}
