import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Instagram OAuth — Coming Soon" }, { status: 501 })
}
