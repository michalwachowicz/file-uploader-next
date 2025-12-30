# @file-uploader/shared

Shared validation schemas and types for the file-uploader application.

## Usage

### In Backend

```typescript
import { registerSchema, RegisterInput } from "@file-uploader/shared";
import { validateRequest } from "@/middleware/validateRequest";

router.post("/register", validateRequest(registerSchema), handler);
```

### In Frontend

```typescript
import { registerSchema, RegisterInput } from "@file-uploader/shared";

// Validate form data
const result = registerSchema.safeParse(formData);
if (!result.success) {
  // Handle validation errors
}
```

## Development

Build the package:
```bash
npm run build
```

Watch mode:
```bash
npm run dev
```

