import { handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/auth";
import { getClientById, searchClientsByLastNameAndDob } from "@/lib/dynamodb";
import { validateSearchInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();

    const searchParams = new URL(request.url).searchParams;
    const searchInput = validateSearchInput(searchParams);

    if (searchInput.mode === "clientId") {
      const client = await getClientById(searchInput.clientId);
      return successResponse(client ? [client] : []);
    }

    const results = await searchClientsByLastNameAndDob(searchInput.lastName, searchInput.dob);
    return successResponse(results);
  } catch (error) {
    return handleRouteError(error);
  }
}
