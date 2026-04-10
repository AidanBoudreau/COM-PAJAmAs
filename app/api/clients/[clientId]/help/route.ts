import { randomUUID } from "crypto";
import { errorResponse, handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/auth";
import {
  createClient,
  getClientById,
  isConditionalCheckFailed,
} from "@/lib/dynamodb";
import { validateClientIdParam, validateHelpInput } from "@/lib/validation";

export const runtime = "nodejs";
const MAX_CLIENT_ID_RETRIES = 3;

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
    const existingClient = await getClientById(clientId);

    if (!existingClient) {
      return errorResponse("Client not found.", 404);
    }

    for (let attempt = 0; attempt < MAX_CLIENT_ID_RETRIES; attempt += 1) {
      const newClient = {
        clientId: randomUUID(),
        firstName: existingClient.firstName,
        lastName: existingClient.lastName,
        dob: existingClient.dob,
        amount: payload.amount ?? existingClient.amount,
        purpose: payload.purpose ?? existingClient.purpose,
        lastHelpedDate: payload.lastHelpedDate,
      };

      try {
        await createClient(newClient);
        return successResponse(newClient, 201);
      } catch (error) {
        if (!isConditionalCheckFailed(error)) {
          throw error;
        }
      }
    }

    return errorResponse("Unable to generate a unique clientId after multiple attempts.", 500);
  } catch (error) {
    return handleRouteError(error);
  }
}
