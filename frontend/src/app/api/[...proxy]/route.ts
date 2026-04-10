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
  // Remove hop-by-hop and restricted headers that cause Node.js fetch to crash (502 TypeError)
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("transfer-encoding");
  
  // Remove Origin/Referer so Spring Boot doesn't block the server-to-server proxy request with its CORS policy
  headers.delete("origin");
  headers.delete("referer");

  // If user has a valid iron-session access token, append it to Authorization Header
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: headers,
    cache: "no-store", // Proxy should strictly never cache Data Cache, always forward to backend real-time
  };

  // Handle the request body stream safely (requires duplex for streaming bodies, but ONLY for POST/PUT/PATCH)
  if (req.method !== "GET" && req.method !== "HEAD") {
    fetchOptions.body = req.body;
    // @ts-ignore - 'duplex' is required for Node.js fetch with ReadableStream bodies
    fetchOptions.duplex = "half";
  } else {
    // GET requests should not have a content-type
    headers.delete("content-type");
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);

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
