import { errorResponse, handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/auth";
import { getClientById } from "@/lib/dynamodb";
import { calculateEligibility, ELIGIBILITY_WINDOW_DAYS } from "@/lib/eligibility";
import { validateClientIdParam } from "@/lib/validation";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    clientId: string;
  }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    await requireSession();

    const { clientId: rawClientId } = await context.params;
    const clientId = validateClientIdParam(rawClientId);
    const client = await getClientById(clientId);

    if (!client) {
      return errorResponse("Client not found.", 404);
    }

    const data = calculateEligibility(client.lastHelpedDate, ELIGIBILITY_WINDOW_DAYS);

    return successResponse(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
