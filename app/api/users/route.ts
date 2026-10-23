import { handleApiError, jsonOk } from "@/lib/api-response";
import { storeListCustomers } from "@/server/store";

export async function GET() {
  try {
    return jsonOk(storeListCustomers());
  } catch (error) {
    return handleApiError(error);
  }
}
