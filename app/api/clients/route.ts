import { randomUUID } from "crypto";
import { errorResponse, handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/auth";
import { createClient, isConditionalCheckFailed } from "@/lib/dynamodb";
import { validateCreateClientInput } from "@/lib/validation";

export const runtime = "nodejs";

const MAX_CLIENT_ID_RETRIES = 3;

export async function POST(request: Request) {
  try {
    await requireSession();

    const body = await request.json();
    const payload = validateCreateClientInput(body);

    for (let attempt = 0; attempt < MAX_CLIENT_ID_RETRIES; attempt += 1) {
      const clientId = randomUUID();

      try {
        const client = { clientId, ...payload };
        await createClient(client);
        return successResponse(client, 201);
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
