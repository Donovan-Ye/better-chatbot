import { z } from "zod";
import { envBooleanSchema } from "./util";

export const SocialAuthenticationProviderSchema = z.enum([
  "github",
  "google",
  "microsoft",
]);

export type SocialAuthenticationProvider = z.infer<
  typeof SocialAuthenticationProviderSchema
>;

export const GitHubConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
});

export const GoogleConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  prompt: z.literal("select_account").optional(),
});

export const MicrosoftConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  tenantId: z.string().default("common"),
  prompt: z.literal("select_account").optional(),
});

export const SocialAuthenticationConfigSchema = z.object({
  github: GitHubConfigSchema.optional(),
  google: GoogleConfigSchema.optional(),
  microsoft: MicrosoftConfigSchema.optional(),
});

export const AuthConfigSchema = z.object({
  emailAndPasswordEnabled: envBooleanSchema.default(true),
  signUpEnabled: envBooleanSchema.default(true),
  socialAuthenticationProviders: SocialAuthenticationConfigSchema,
});

export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;
export type GoogleConfig = z.infer<typeof GoogleConfigSchema>;
export type MicrosoftConfig = z.infer<typeof MicrosoftConfigSchema>;
export type SocialAuthenticationConfig = z.infer<
  typeof SocialAuthenticationConfigSchema
>;

export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export interface IDMUserInfo {
  id: number | string;
  status?: number | string | null;
  createBy?: string | number | null;
  createTime?: string | null; // e.g. '2025-07-29 13:45:39'
  updateBy?: string | number | null;
  updateTime?: string | null; // e.g. '2025-08-26 17:45:03'
  orgCode?: string | null;
  tenantId?: number | string | null;
  username?: string | null;
  name?: string | null;
  enName?: string | null;
  mobile?: string | null;
  email?: string | null;
  nickName?: string | null;
  gender?: string | number | null;
  picture?: string | null;
  address?: string | null;
  tenantType?: number | string | null;
  employeeNum?: number | string | null;
  orgId?: number | string | null;
  orgName?: string | null;
  sortOrder?: number | string | null;
  preferredLanguage?: string | null; // e.g. 'ZH_CN'
  isLocked?: boolean | number | null;
  userType?: string | null; // e.g. 'UT-001'
  userStatus?: string | null; // e.g. 'RESIDENT'
  remark?: string | null;
  unlockTime?: string | null;
  pwdIsNull?: number | boolean | null;
  lastLoginIp?: string | null;
  userExInf?: unknown | null;
}
