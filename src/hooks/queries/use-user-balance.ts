"use client";

import useSWR, { SWRConfiguration } from "swr";
import { fetcher } from "lib/utils";

interface UserBalanceResponse {
  balance: string;
  userId: string;
}

export function useUserBalance(options?: SWRConfiguration) {
  return useSWR<UserBalanceResponse>("/api/user/balance", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 1000 * 60 * 5, // Refresh every 5 minutes
    errorRetryCount: 1,
    fallbackData: { balance: "0.00", userId: "" },
    ...options,
  });
}
