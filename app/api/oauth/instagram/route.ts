import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const GRAPH_API_VERSION = "v21.0"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/oauth/instagram/callback`

  // Facebook Login for Business: config_id 사용 (scope 대신)
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    config_id: process.env.META_CONFIG_ID!,
    response_type: "code",
    state: session.user.id,
    auth_type: "rerequest",
  })

  return NextResponse.redirect(
    `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params}`
  )
}
