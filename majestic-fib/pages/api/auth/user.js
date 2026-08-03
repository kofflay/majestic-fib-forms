import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Путь должен вести в pages, а не app

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.accessToken) {
    return res.status(401).json({ error: "User not authenticated or missing token" });
  }

  const accessToken = session.accessToken;

  try {
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer \${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}));
      console.error("Discord API Error:", errorData);
      return res.status(userResponse.status).json({ 
        error: "Failed to fetch user data from Discord", 
        discordError: errorData 
      });
    }

    const userData = await userResponse.json();
    return res.status(200).json(userData);

  } catch (error) {
    console.error("Fetch error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
