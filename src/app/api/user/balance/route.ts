import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { userRepository } from "lib/db/repository";
import { z } from "zod";

// 获取用户余额
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await userRepository.getBalance(session.user.id);

    return NextResponse.json({
      balance,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Error getting user balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 更新用户余额的请求体schema
const UpdateBalanceSchema = z.object({
  balance: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid balance format"),
});

const AddBalanceSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
});

// 设置用户余额（管理员功能）
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { balance } = UpdateBalanceSchema.parse(body);

    const updatedUser = await userRepository.updateBalance(
      session.user.id,
      balance,
    );

    return NextResponse.json({
      balance: updatedUser.balance,
      userId: session.user.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error updating user balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// 增加用户余额
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount } = AddBalanceSchema.parse(body);

    const updatedUser = await userRepository.addBalance(
      session.user.id,
      amount,
    );

    return NextResponse.json({
      balance: updatedUser.balance,
      userId: session.user.id,
      message: `Successfully added ${amount} to balance`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error adding to user balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
