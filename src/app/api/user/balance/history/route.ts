import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { pgDb as db } from "lib/db/pg/db.pg";
import { UserBalanceHistorySchema } from "lib/db/pg/schema.pg";
import { eq, desc } from "drizzle-orm";

// 获取用户余额变动历史
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const history = await db
      .select()
      .from(UserBalanceHistorySchema)
      .where(eq(UserBalanceHistorySchema.userId, session.user.id))
      .orderBy(desc(UserBalanceHistorySchema.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      history,
      userId: session.user.id,
      pagination: {
        limit,
        offset,
        total: history.length,
      },
    });
  } catch (error) {
    console.error("Error getting balance history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
