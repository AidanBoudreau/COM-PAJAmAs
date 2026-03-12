import { errorResponse, handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/auth";
import { updateClientById } from "@/lib/dynamodb";
import { validateClientIdParam, validateHelpInput } from "@/lib/validation";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    clientId: string;
  }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireSession();

    const { clientId: rawClientId } = await context.params;
    const clientId = validateClientIdParam(rawClientId);
    const body = await request.json();
    const payload = validateHelpInput(body);
    const updatedClient = await updateClientById(clientId, payload);

    if (!updatedClient) {
      return errorResponse("Client not found.", 404);
    }

    return successResponse(updatedClient);
  } catch (error) {
    return handleRouteError(error);
  }
}
