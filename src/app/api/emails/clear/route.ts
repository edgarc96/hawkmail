import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emails } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Delete all emails for this user
    const result = await db
      .delete(emails)
      .where(eq(emails.userId, userId));

    return NextResponse.json({
      success: true,
      message: "All emails deleted successfully. You can now sync again to get emails with content.",
    });
  } catch (error) {
    console.error("Error deleting emails:", error);
    return NextResponse.json(
      { error: "Failed to delete emails" },
      { status: 500 }
    );
  }
}
