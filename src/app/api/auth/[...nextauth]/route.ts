import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // ✅ for setting cookies manually in App Router

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt", // we still tell NextAuth to use JWT internally
  },

  callbacks: {
    async signIn({ user }) {
      const client = await pool.connect();
      try {
        const username =
          user.name?.replace(/\s+/g, "").toLowerCase() ||
          user.email?.split("@")[0];

        // Insert or update user in DB
        const result = await client.query(
          `
          INSERT INTO users (username, email)
          VALUES ($1, $2)
          ON CONFLICT (email)
          DO UPDATE SET username = EXCLUDED.username
          RETURNING id, username, email
          `,
          [username, user.email]
        );

        const dbUser = result.rows[0];

        // ✅ Create JWT manually (like your normal login)
        const token = jwt.sign(
          { id: dbUser.id, email: dbUser.email, username: dbUser.username },
          process.env.JWT_SECRET!,
          { expiresIn: "1h" }
        );

        const cookieStore = await cookies(); // 👈 add await
        cookieStore.set("session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60, // 1 hour
        });


        // ✅ Return redirect URL (NextAuth will handle redirection)
        return "/";
      } catch (err) {
        console.error("Google Sign-In Error:", err);
        return false;
      } finally {
        client.release();
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        name: token.name,
        email: token.email,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };