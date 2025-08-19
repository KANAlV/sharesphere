// pages/api/session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

type Data = { user: { id: string; email: string; username: string } | null };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ user: null });
  }

  // Get the raw cookie header
  const rawCookies = req.headers.cookie || "";

  // Extract the 'session' cookie
  const token = rawCookies
    .split("; ")
    .find((row) => row.startsWith("session="))
    ?.split("=")[1];

  if (!token) {
    return res.status(200).json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      username: string;
    };

    return res.status(200).json({ user: decoded });
  } catch (err) {
    return res.status(200).json({ user: null });
  }
}