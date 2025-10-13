import { User, UserPreferences, UserRepository } from "app-types/user";
import { pgDb as db } from "../db.pg";
import { UserSchema, UserBalanceHistorySchema } from "../schema.pg";
import { eq, sql } from "drizzle-orm";

export const pgUserRepository: UserRepository = {
  existsByEmail: async (email: string): Promise<boolean> => {
    const result = await db
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.email, email));
    return result.length > 0;
  },
  updateUser: async (
    id: string,
    user: Pick<User, "name" | "image">,
  ): Promise<User> => {
    const [result] = await db
      .update(UserSchema)
      .set({
        name: user.name,
        image: user.image,
        updatedAt: new Date(),
      })
      .where(eq(UserSchema.id, id))
      .returning();
    return {
      ...result,
      preferences: result.preferences ?? undefined,
    };
  },
  updatePreferences: async (
    userId: string,
    preferences: UserPreferences,
  ): Promise<User> => {
    const [result] = await db
      .update(UserSchema)
      .set({
        preferences,
        updatedAt: new Date(),
      })
      .where(eq(UserSchema.id, userId))
      .returning();
    return {
      ...result,
      preferences: result.preferences ?? undefined,
    };
  },
  getPreferences: async (userId: string) => {
    const [result] = await db
      .select({ preferences: UserSchema.preferences })
      .from(UserSchema)
      .where(eq(UserSchema.id, userId));
    return result?.preferences ?? null;
  },
  findById: async (userId: string) => {
    const [result] = await db
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.id, userId));
    return (result as User) ?? null;
  },

  // 余额相关方法
  getBalance: async (userId: string): Promise<string> => {
    const [result] = await db
      .select({ balance: UserSchema.balance })
      .from(UserSchema)
      .where(eq(UserSchema.id, userId));
    return result?.balance ?? "0.00";
  },

  updateBalance: async (userId: string, balance: string): Promise<User> => {
    return await db.transaction(async (tx) => {
      // 获取当前余额
      const [currentUser] = await tx
        .select({ balance: UserSchema.balance })
        .from(UserSchema)
        .where(eq(UserSchema.id, userId));

      const balanceBefore = currentUser?.balance ?? "0.00";
      console.log("balanceBefore", balanceBefore);

      // 更新余额
      const [result] = await tx
        .update(UserSchema)
        .set({
          balance,
          updatedAt: new Date(),
        })
        .where(eq(UserSchema.id, userId))
        .returning();
      console.log("result", result);

      // 记录余额变动历史
      await tx.insert(UserBalanceHistorySchema).values({
        userId,
        amount: sql`${balance}::numeric - ${balanceBefore}::numeric`,
        balanceBefore,
        balanceAfter: balance,
        type: "set",
        reason: "Balance updated",
      });

      return {
        ...result,
        preferences: result.preferences ?? undefined,
      };
    });
  },

  addBalance: async (userId: string, amount: string): Promise<User> => {
    return await db.transaction(async (tx) => {
      // 获取当前余额
      const [currentUser] = await tx
        .select({ balance: UserSchema.balance })
        .from(UserSchema)
        .where(eq(UserSchema.id, userId));

      const balanceBefore = currentUser?.balance ?? "0.00";

      // 更新余额
      const [result] = await tx
        .update(UserSchema)
        .set({
          balance: sql`${UserSchema.balance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(UserSchema.id, userId))
        .returning();

      // 记录余额变动历史
      await tx.insert(UserBalanceHistorySchema).values({
        userId,
        amount,
        balanceBefore,
        balanceAfter: result.balance,
        type: "add",
        reason: "Balance added",
      });

      return {
        ...result,
        preferences: result.preferences ?? undefined,
      };
    });
  },

  deductBalance: async (userId: string, amount: string): Promise<User> => {
    return await db.transaction(async (tx) => {
      // 获取当前余额
      const [currentUser] = await tx
        .select({ balance: UserSchema.balance })
        .from(UserSchema)
        .where(eq(UserSchema.id, userId));

      const balanceBefore = currentUser?.balance ?? "0.00";

      // 检查余额是否足够
      const currentBalanceNum = parseFloat(balanceBefore);
      const deductAmountNum = parseFloat(amount);

      if (currentBalanceNum < deductAmountNum) {
        throw new Error(
          `Insufficient balance. Current: ${balanceBefore}, Required: ${amount}`,
        );
      }

      // 更新余额
      const [result] = await tx
        .update(UserSchema)
        .set({
          balance: sql`${UserSchema.balance} - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(UserSchema.id, userId))
        .returning();

      // 记录余额变动历史
      await tx.insert(UserBalanceHistorySchema).values({
        userId,
        amount: sql`-${amount}::numeric`, // 负数表示扣减
        balanceBefore,
        balanceAfter: result.balance,
        type: "deduct",
        reason: "Balance deducted",
      });

      return {
        ...result,
        preferences: result.preferences ?? undefined,
      };
    });
  },
};
