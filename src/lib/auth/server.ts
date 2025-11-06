import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { pgDb } from "lib/db/pg/db.pg";
import { headers } from "next/headers";
import { toast } from "sonner";
import {
  AccountSchema,
  SessionSchema,
  UserSchema,
  VerificationSchema,
} from "lib/db/pg/schema.pg";
import { genericOAuth, GenericOAuthConfig } from "better-auth/plugins";
import { getAuthConfig } from "./config";
import { BASE_URL } from "lib/const";

import logger from "logger";
import { redirect } from "next/navigation";
import type { IDMUserInfo } from "app-types/authentication";

const {
  emailAndPasswordEnabled,
  signUpEnabled,
  socialAuthenticationProviders,
} = getAuthConfig();

const idmConfig: GenericOAuthConfig = {
  providerId: "idm",
  clientId: process.env.IDM_CLIENT_ID!,
  clientSecret: process.env.IDM_CLIENT_SECRET!,
  authorizationUrl: process.env.IDM_BASE_URL,
  tokenUrl: `${process.env.IDM_BASE_URL}/${process.env.IDM_TOKEN_URL}`,
  // userInfoUrl: `${process.env.IDM_BASE_URL}/${process.env.IDM_USER_INFO_URL}`,
  // redirectURI: `${process.env.BETTER_AUTH_TRUSTED_ORIGINS}/api/auth/callback/idm`,
  getUserInfo: async (accessToken) => {
    const response = await fetch(
      `${process.env.IDM_BASE_URL}/${process.env.IDM_USER_INFO_URL}`,
      {
        headers: {
          Authorization: accessToken.accessToken!,
        },
      },
    );

    const res = await response.json();
    const userInfo = (res?.data ?? {}) as IDMUserInfo;
    return {
      id: String(userInfo.id),
      // 使用username作为登录账号。
      email: userInfo.username ?? "",
      emailVerified: Boolean(userInfo.username),
      name: userInfo.name ?? "",
      image: userInfo.picture ?? null,
      balance: "15",
      createdAt: userInfo.createTime
        ? new Date(userInfo.createTime)
        : new Date(),
      updatedAt: userInfo.updateTime
        ? new Date(userInfo.updateTime)
        : new Date(),
    };
  },
  scopes: ["all"],
};

export const auth = betterAuth({
  plugins: [
    nextCookies(),
    genericOAuth({
      config: [idmConfig],
    }),
  ],
  baseURL: BASE_URL,
  user: {
    additionalFields: {
      balance: {
        type: "number",
        required: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              balance: 15,
            },
          };
        },
      },
    },
  },
  database: drizzleAdapter(pgDb, {
    provider: "pg",
    schema: {
      user: UserSchema,
      session: SessionSchema,
      account: AccountSchema,
      verification: VerificationSchema,
    },
  }),
  emailAndPassword: {
    enabled: emailAndPasswordEnabled,
    disableSignUp: !signUpEnabled,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },

  advanced: {
    useSecureCookies:
      process.env.NO_HTTPS == "1"
        ? false
        : process.env.NODE_ENV === "production",
    database: {
      generateId: false,
    },
  },
  account: {
    accountLinking: {
      trustedProviders: [
        idmConfig.providerId,
        ...(
          Object.keys(
            socialAuthenticationProviders,
          ) as (keyof typeof socialAuthenticationProviders)[]
        ).filter((key) => socialAuthenticationProviders[key]),
      ],
    },
  },
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error("Too many requests. Please try again later.");
      }
    },
  },
  socialProviders: socialAuthenticationProviders,
});

export const getSession = async () => {
  "use server";
  const session = await auth.api
    .getSession({
      headers: await headers(),
    })
    .catch((e) => {
      logger.error(e);
      return null;
    });
  if (!session) {
    logger.error("No session found");
    redirect("/sign-in");
  }
  return session!;
};
