"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password) {
    return { success: false, error: "이메일과 비밀번호를 입력해주세요." }
  }

  if (password.length < 8) {
    return { success: false, error: "비밀번호는 8자 이상이어야 합니다." }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: "이미 가입된 이메일입니다." }
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { email, password: hashedPassword, name },
  })

  return { success: true }
}
