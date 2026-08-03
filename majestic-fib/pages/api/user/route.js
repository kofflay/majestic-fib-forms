import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: "User not authenticated or missing token" },
      { status: 401 }
    );
  }

  const accessToken = session.accessToken;

  try {
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        // Строго "Bearer" + пробел + токен
        Authorization: `Bearer \${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}));
      console.error("Discord API Error:", errorData);
      return NextResponse.json(
        { 
          error: "Failed to fetch user data from Discord", 
          discordError: errorData 
        },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    return NextResponse.json(userData);

  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching user data" },
      { status: 500 }
    );
  }
}
