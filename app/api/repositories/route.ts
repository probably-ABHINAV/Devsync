import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const repositories = await prisma.repository.findMany({
      where: { userId: session.user.id },
      include: {
        pullRequests: { take: 5, orderBy: { createdAt: "desc" } },
        issues: { take: 5, orderBy: { createdAt: "desc" } },
      },
    })

    return NextResponse.json(repositories)
  } catch (error) {
    console.error("[Repositories API] Error:", error)
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, fullName, url, description } = await req.json()

    const repository = await prisma.repository.create({
      data: {
        userId: session.user.id,
        name,
        fullName,
        url,
        description,
        webhookSecret: require("crypto").randomBytes(32).toString("hex"),
      },
    })

    return NextResponse.json(repository)
  } catch (error) {
    console.error("[Repositories API] Error:", error)
    return NextResponse.json({ error: "Failed to create repository" }, { status: 500 })
  }
}
