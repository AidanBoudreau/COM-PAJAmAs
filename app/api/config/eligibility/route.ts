import { errorResponse, handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireAdmin } from "@/lib/auth";
import { ELIGIBILITY_WINDOW_DAYS } from "@/lib/eligibility";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return successResponse({ eligibilityWindowDays: ELIGIBILITY_WINDOW_DAYS });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT() {
  try {
    await requireAdmin();
    return errorResponse("Eligibility window is hardcoded and cannot be updated.", 405);
  } catch (error) {
    return handleRouteError(error);
  }
}
