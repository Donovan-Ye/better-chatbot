FROM metac-registry.cn-hangzhou.cr.aliyuncs.com/metac/node:23-alpine AS builder

ARG DOCKER_BUILD="1"
WORKDIR /app

COPY . . 

# Install pnpm
RUN corepack enable pnpm

RUN pnpm install --frozen-lockfile

# Makes the next output standalone
# https://github.com/vercel/next.js/discussions/65511
ENV NEXT_STANDALONE_OUTPUT="true"

RUN pnpm build

FROM metac-registry.cn-hangzhou.cr.aliyuncs.com/metac/node:23-alpine AS runner
ARG MODULE_NAME
ARG GIT_COMMIT_ID
#构建时传git commit号
LABEL git.commit.id=${GIT_COMMIT_ID:-"git_commit_id"}
# 指定运行时的系统环境变量,如下请替换appName为自己应用名称
ENV APP_NAME=${MODULE_NAME:-"app_name"}
WORKDIR /app

ENV NODE_ENV=production
# disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy migrations content
COPY --from=builder /app/src/lib/db/migrations ./src/lib/db/migrations

USER nextjs

ENV PORT=80
ENV HOSTNAME="0.0.0.0"

EXPOSE 80

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
CMD ["node", "server.js"]
