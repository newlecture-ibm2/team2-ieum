import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const BACKEND_URL = process.env.BACKEND_URL || process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function processProxyRequest(req: NextRequest) {
  const session = await getSession();
  const token = session.accessToken;

  // req.nextUrl.pathname example: /api/community/posts
  // We want to proxy it to: http://localhost:8080/api/community/posts
  const targetUrl = `${BACKEND_URL}${req.nextUrl.pathname}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  // Important to override the host so the backend doesn't reject it
  headers.set("host", new URL(BACKEND_URL).host);
  // Remove Origin/Referer so Spring Boot doesn't block the server-to-server proxy request with its CORS policy
  headers.delete("origin");
  headers.delete("referer");

  // If user has a valid iron-session access token, append it to Authorization Header
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Handle the request body stream safely (requires duplex for streaming bodies)
  let requestBody = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    requestBody = req.body;
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: requestBody,
      // @ts-ignore - 'duplex' is required for Node.js fetch with ReadableStream bodies
      duplex: "half",
    });

    const responseHeaders = new Headers(response.headers);
    // Remove content-encoding so Next.js handles it properly
    responseHeaders.delete("content-encoding");

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("BFF Proxy Error:", error);
    return NextResponse.json(
      { success: false, message: "백엔드 서버와 통신할 수 없습니다.", error: "BFF_PROXY_ERROR" },
      { status: 502 }
    );
  }
}

export const GET = processProxyRequest;
export const POST = processProxyRequest;
export const PUT = processProxyRequest;
export const PATCH = processProxyRequest;
export const DELETE = processProxyRequest;
