import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable, subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isUserPremium } from "@/lib/subscription-helpers";

// Define premium routes that require active subscription
const PREMIUM_ROUTES = ["/analytics", "/team", "/settings"];
const AGENT_RESTRICTED_ROUTES = ["/analytics", "/team", "/settings"];
const MANAGER_RESTRICTED_ROUTES = ["/settings"];

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

	const user = userDetails[0];
	const userRole = user.role || 'admin';
	const pathname = request.nextUrl.pathname;

	// Check if user needs to complete onboarding
	if (!user.onboardingCompleted && pathname !== '/onboarding') {
		return NextResponse.redirect(new URL("/onboarding", request.url));
	}

	// Don't apply premium checks if user hasn't completed onboarding
	if (!user.onboardingCompleted) {
		return NextResponse.next();
	}

	// Check if user has active subscription for premium features
	const isPremium = await isUserPremium(user.id);

	// Premium route checks
	if (PREMIUM_ROUTES.some(route => pathname.startsWith(route))) {
		if (!isPremium) {
			// Redirect to pricing page with upgrade message
			const url = new URL("/#pricing", request.url);
			url.searchParams.set("upgrade", "true");
			return NextResponse.redirect(url);
		}
	}

	// Role-based access control
	if (userRole === 'agent') {
		// Agents can only access dashboard and inbox
		if (AGENT_RESTRICTED_ROUTES.some(route => pathname.startsWith(route))) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	if (userRole === 'manager') {
		// Managers cannot access settings
		if (MANAGER_RESTRICTED_ROUTES.some(route => pathname.startsWith(route))) {
			return NextResponse.redirect(new URL("/dashboard", request.url));
		}
	}

	// Admin can access everything
 
	return NextResponse.next();
}
 
export const config = {
  runtime: "nodejs",
  matcher: ["/dashboard/:path*", "/inbox/:path*", "/analytics/:path*", "/team/:path*", "/settings/:path*", "/onboarding"],
};