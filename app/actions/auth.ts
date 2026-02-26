"use server"

import { cookies } from "next/headers"

export async function loginAction() {
  const cookieStore = await cookies()
  cookieStore.set("babylos-auth-token", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("babylos-auth-token")
}
