import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { userRepository } from "lib/db/repository";
import { z } from "zod";

const DeductBalanceSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  reason: z.string().optional(), // 扣费原因（可选）
});

// 扣减用户余额
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, reason } = DeductBalanceSchema.parse(body);

    // 先检查余额是否足够
    const currentBalance = await userRepository.getBalance(session.user.id);
    const currentBalanceNum = parseFloat(currentBalance);
    const deductAmountNum = parseFloat(amount);

    if (currentBalanceNum < deductAmountNum) {
      return NextResponse.json(
        {
          error: "Insufficient balance",
          currentBalance,
          requestedAmount: amount,
        },
        { status: 400 },
      );
    }

    const updatedUser = await userRepository.deductBalance(
      session.user.id,
      amount,
    );

    return NextResponse.json({
      balance: updatedUser.balance,
      userId: session.user.id,
      deductedAmount: amount,
      reason,
      message: `Successfully deducted ${amount} from balance${reason ? ` for ${reason}` : ""}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Error deducting from user balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
