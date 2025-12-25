import { Body, Controller, Post, Route, Tags } from "tsoa";
import { injectable } from "tsyringe";
import { AuthorizationService, IUser } from "../../auth/services/authorization.service";

interface HasPermissionRequest {
  userId: string;
  permissionType: string; // Full format: "function:read", "page:write", etc.
  resourceType: string;
  resourceId: string;
  applicationId?: string;
  granteeType?: string;
  anonymous?: boolean;
}

interface HasPermissionResponse {
  hasPermission: boolean;
}

@Route('/api/permissions')
@Tags('Permissions')
@injectable()
export class PermissionController extends Controller {
  constructor(
    private readonly authorizationService: AuthorizationService
  ) {
    super();
  }

  /**
   * Check if a user has a specific permission on a resource.
   * This endpoint is used by backend services to verify permissions.
   *
   * Checks both:
   * - Direct resource permissions (user, public, anonymous)
   * - Application membership role permissions
   *
   * permissionType format: "function:read", "page:write", etc.
   *
   * Returns:
   * - 200: Permission granted (hasPermission: true)
   * - 403: Permission denied (hasPermission: false)
   */
  @Post('has')
  public async hasPermission(
    @Body() body: HasPermissionRequest
  ): Promise<HasPermissionResponse> {
    const { userId, permissionType, resourceType, resourceId, applicationId, anonymous } = body;

    // Build user object for authorization check
    const user: IUser = {
      uuid: userId || '',
      anonymous: anonymous ?? false,
    };

    // Use AuthorizationService which checks both resource permissions AND application membership
    const hasAccess = await this.authorizationService.canAccess(
      user,
      resourceId,
      resourceType,
      permissionType,
      applicationId
    );

    // Return 403 status if permission denied (for compatibility with shared library)
    if (!hasAccess) {
      this.setStatus(403);
    }

    return { hasPermission: hasAccess };
  }
}
