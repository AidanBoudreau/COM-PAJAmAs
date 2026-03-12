import { errorResponse, handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireAdmin } from "@/lib/auth";
import { deleteManagedUser } from "@/lib/authUsers";
import { validateUserIdParam } from "@/lib/validation";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const currentUser = await requireAdmin();
    const { userId: rawUserId } = await context.params;
    const userId = validateUserIdParam(rawUserId);

    if (currentUser.userId === userId) {
      return errorResponse("Admin users cannot delete their own account.", 400);
    }

    const deleted = await deleteManagedUser(userId);
    if (!deleted) {
      return errorResponse("User not found.", 404);
    }

    return successResponse({ userId, deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
