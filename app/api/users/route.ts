import { handleRouteError, successResponse } from "@/lib/apiResponse";
import { requireAdmin } from "@/lib/auth";
import { createManagedUser, listManagedUsers } from "@/lib/authUsers";
import { validateCreateUserInput } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    const users = await listManagedUsers();
    return successResponse(users);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const payload = validateCreateUserInput(body);
    const user = await createManagedUser(payload);
    return successResponse(user, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
