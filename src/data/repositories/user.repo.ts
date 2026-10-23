import { apiFetch } from "@/lib/api-client";
import type { UpdateUserInput } from "@/schemas";
import {
  storeGetCustomerById,
  storeListCustomers,
  storeUpdateCustomer,
} from "@/server/store";
import type { CustomerContract } from "@/shared/contracts";
import type { User } from "@/types/user";

export async function getCurrentUser(): Promise<User | null> {
  return apiFetch<User | null>("/api/users/me", {
    fallback: () => storeGetCustomerById("u-demo"),
  });
}

export async function updateCurrentUser(
  patch: UpdateUserInput,
): Promise<User | null> {
  return apiFetch<User | null>("/api/users/me", {
    method: "PATCH",
    body: patch,
    fallback: () => storeUpdateCustomer("u-demo", patch),
  });
}

export async function getUserById(id: string): Promise<CustomerContract | null> {
  return apiFetch<CustomerContract | null>(
    `/api/users/${encodeURIComponent(id)}`,
    {
      fallback: () => storeGetCustomerById(id),
    },
  );
}

export async function listCustomers(): Promise<CustomerContract[]> {
  return apiFetch<CustomerContract[]>("/api/users", {
    fallback: () => storeListCustomers(),
  });
}
