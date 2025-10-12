import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
 
export async function middleware(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: request.headers
	})
 
	if(!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Get user role
	const userDetails = await db
		.select()
		.from(userTable)
		.where(eq(userTable.id, session.user.id))
		.limit(1);

	if (userDetails.length === 0) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	const userRole = userDetails[0].role || 'admin';
	const pathname = request.nextUrl.pathname;

	// Role-based access control
	if (userRole === 'agent') {
		// Agents can only access dashboard (filtered to their emails)
		if (pathname !== '/dashboard') {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	if (userRole === 'manager') {
		// Managers cannot access settings
		if (pathname === '/settings') {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	// Admin can access everything
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard", "/inbox", "/analytics", "/team", "/settings"],
};