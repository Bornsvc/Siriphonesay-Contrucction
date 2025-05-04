import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
  try {
    const JWTSECRET = process.env.JWTSECRET; 
    if (!JWTSECRET) {
      throw new Error("JWTSECRET is not defined in .env file");
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, JWTSECRET) as { role: string; id: string };
    console.log('Token is valid:', decodedToken);

    return NextResponse.json({
      authenticated: true,
      role: decodedToken.role,
      userId: decodedToken.id
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // Token has expired
      console.error('Token has expired');
      // Handle token expiration, e.g., redirect to login or refresh token
    } else if(error instanceof Error){
      // Other errors, e.g., invalid signature
      console.error('Token verification error:', error.message);
    }

    return NextResponse.json({ error: "Token verification error" }, { status: 401 });
  }
}
