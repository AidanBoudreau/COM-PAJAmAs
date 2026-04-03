import { handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireSession } from "@/lib/auth";
import { scanClientsByDateRange } from "@/lib/dynamodb";
import { validateDateRangeInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();

    const searchParams = new URL(request.url).searchParams;
    const { start, end } = validateDateRangeInput(searchParams);

    const clients = await scanClientsByDateRange(start, end);
    return successResponse(clients);
  } catch (error) {
    return handleRouteError(error);
  }
}
