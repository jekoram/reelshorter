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

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: "instagram_business_basic,instagram_business_content_publish,pages_show_list,pages_read_engagement",
    response_type: "code",
    state: session.user.id,
  })

  return NextResponse.redirect(
    `https://www.facebook.com/${GRAPH_API_VERSION}/dialog/oauth?${params}`
  )
}
