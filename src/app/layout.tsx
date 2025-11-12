import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import "flowbite";
import Navigation from "@/components/navigation";
import Topbar from "@/components/topbar";
import { sql } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Sharesphere',
  icons: {
    icon: '/favicon.svg', // your favicon path
  },
};

// Make the layout async so we can await cookies()
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Await cookies() to access .get()
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  let user: null | { id: string; username: string; email: string } = null;

  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        username: string;
        email: string;
      };
    } catch {
      user = null;
    }
  }  

  //check if user exist in adminDB
  let admin = false;
  const result = await sql`
  SELECT EXISTS(
      SELECT 1 FROM admins WHERE admin_name = ${user?.username} AND admin_id = ${user?.id} AND admin_email = ${user?.email}
  ) AS "exists";
  `;
  
  if (!result[0].exists) {
      admin = true;
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        <Navigation user={user ? { ...user } : null} admin={admin}/>
        <Topbar user={user ? { ...user } : null}/>
        {children}
      </body>
    </html>
  );
}