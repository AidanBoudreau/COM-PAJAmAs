import { errorResponse, handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/auth";
import { getClientById, updateClientById } from "@/lib/dynamodb";
import { validateClientIdParam, validateUpdateClientInput } from "@/lib/validation";

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

    return successResponse(client);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireSession();

    const { clientId: rawClientId } = await context.params;
    const clientId = validateClientIdParam(rawClientId);
    const body = await request.json();
    const updates = validateUpdateClientInput(body);
    const updatedClient = await updateClientById(clientId, updates);

    if (!updatedClient) {
      return errorResponse("Client not found.", 404);
    }

    return successResponse(updatedClient);
  } catch (error) {
    return handleRouteError(error);
  }
}
