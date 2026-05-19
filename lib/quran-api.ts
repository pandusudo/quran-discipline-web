const TOKEN_TTL_MS = 3500 * 1000;

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

const getQuranAccessToken = async (): Promise<string | null> => {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const clientId = process.env.QURAN_CLIENT_ID || "";
  const clientSecret = process.env.QURAN_CLIENT_SECRET || "";

  if (!clientId || !clientSecret) {
    console.error("Missing Quran API credentials");
    return null;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(
      `${process.env.QURAN_OAUTH_URL}/oauth2/token`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=content",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    const token: string = data.access_token;

    if (!token) {
      console.error("Quran OAuth response missing access_token");
      return null;
    }

    tokenCache = { token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return token;
  } catch (error) {
    console.error("Error getting Quran access token:", error);
    tokenCache = null;
    return null;
  }
};

export const fetchQuranApi = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  fetchOptions?: Pick<RequestInit, "cache" | "next">,
): Promise<T | null> => {
  try {
    const token = await getQuranAccessToken();

    if (!token) {
      throw new Error("Failed to obtain access token");
    }

    const defaultCacheOptions: Pick<RequestInit, "next"> =
      method === "GET" ? { next: { revalidate: 86400 } } : {};

    const response = await fetch(
      `${process.env.QURAN_API_URL}/content/api/v4${path}`,
      {
        method,
        headers: {
          "x-auth-token": token,
          "x-client-id": process.env.QURAN_CLIENT_ID || "",
        },
        ...defaultCacheOptions,
        ...fetchOptions,
      },
    );

    if (!response.ok) {
      throw new Error(`Quran API request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching Quran API:", error);
    return null;
  }
};
