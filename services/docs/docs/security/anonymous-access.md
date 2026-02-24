---
sidebar_position: 3
---

# Anonymous Access

Anonymous access allows unauthenticated users to view resources without logging in. This is useful for public pages, landing pages, or shared content.

## How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Gateway   │────▶│     API     │
│ (No Cookie) │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────────────────────────┐
                    │  1. Try Keycloak auth (pass)    │
                    │  2. No session found            │
                    │  3. Check resource permission   │
                    │  4. If allowed → anonymous user │
                    │  5. If restricted → login       │
                    └─────────────────────────────────┘
```

### Anonymous User Header

When anonymous access is granted, the gateway sets:

```json
{
  "uuid": "anonymous",
  "username": "anonymous",
  "email": null,
  "last_name": null,
  "anonymous": true,
  "roles": []
}
```

## Configuration

### Enable Anonymous Access on Application

This allows all resources in the application to potentially inherit anonymous access:

```bash
curl -X POST "http://localhost/api/resources/application/{appId}/make-anonymous" \
  -H "Content-Type: application/json" \
  -d '{"permission": "read"}'
```

### Enable Anonymous Access on Page

Each page must explicitly enable anonymous access:

```bash
curl -X POST "http://localhost/api/resources/page/{pageId}/make-anonymous" \
  -H "Content-Type: application/json" \
  -d '{"permission": "read"}'
```

### Disable Anonymous Access

```bash
curl -X DELETE "http://localhost/api/resources/page/{pageId}/make-anonymous"
```

## Inheritance Behavior

### Application Level

When an application has anonymous access enabled:
- The application itself is accessible anonymously
- Pages **do not** automatically inherit this setting
- Each page must explicitly enable anonymous access

### Page Level

Pages have three possible states:

| State | Behavior |
|-------|----------|
| **Anonymous Enabled** | Anyone can access without login |
| **Restricted** (default) | Requires authentication, no inheritance |
| **Inheriting** | Not currently supported for pages |

:::tip Why Pages Don't Inherit
This design ensures security by default. A new page added to a public application won't accidentally be exposed. Developers must explicitly enable anonymous access for each page they want to make public.
:::

## UI Configuration

The Access Control panel in the studio provides a visual interface:

### Access Summary States

| Display | Meaning |
|---------|---------|
| "Anyone can access" | Anonymous access enabled |
| "Public with link" | Public access (authenticated users only) |
| "Role-based access" | Only specific roles can access |
| "Restricted" | Only application members can access |

### Toggle Controls

- **Anonymous Access** - Allow unauthenticated users
- **Public with Link** - Allow any authenticated user with the URL

## Testing Anonymous Access

### Using curl (simulates anonymous user)

```bash
# Should return 200 if anonymous access is enabled
curl -s -o /dev/null -w "%{http_code}" \
  "http://localhost/app/preview/{appId}/{pageId}"

# Should return 302 (redirect to login) if restricted
curl -s -o /dev/null -w "%{http_code}" --max-redirs 0 \
  "http://localhost/app/preview/{appId}/{pageId}"
```

### Using Browser

1. Open an incognito/private window
2. Navigate to the preview URL
3. If anonymous access is enabled, the page loads
4. If restricted, you'll be redirected to the login page

## Security Considerations

### Best Practices

1. **Principle of Least Privilege** - Only enable anonymous access when necessary
2. **Review Regularly** - Audit which pages have anonymous access
3. **Sensitive Data** - Never enable anonymous access on pages with sensitive information
4. **API Protection** - Anonymous users have read-only access by default

### What Anonymous Users Can Do

| Action | Allowed |
|--------|---------|
| View page content | Yes (if enabled) |
| Execute read-only components | Yes |
| Submit forms | Depends on component config |
| Access API endpoints | Limited to read operations |
| Modify data | No |

### What Anonymous Users Cannot Do

- Access the studio/editor
- Modify page content
- Access other users' data
- Perform write operations
- Access restricted pages

## Troubleshooting

### Page Shows Login Despite Anonymous Enabled on App

**Cause:** Pages don't inherit anonymous access from applications.

**Solution:** Enable anonymous access directly on the page.

### Anonymous Access Not Working After Enable

**Cause:** Gateway cache or configuration not reloaded.

**Solution:**
```bash
# Reload gateway configuration
docker exec stack-gateway-1 nginx -s reload
```

### API Returns 403 for Anonymous User

**Cause:** The API endpoint requires authentication.

**Solution:** Check that the endpoint supports anonymous access or use the public API endpoints.
