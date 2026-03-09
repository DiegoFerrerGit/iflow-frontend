# IFlow Error Management System

## Architectural Overview
The IFlow frontend utilizes a centralized Error Management System designed to handle errors predictably derived from the backend's core `IFlowError` contract, as well as unpredictable errors (Network, local Javascript errors). 

This system enforces a strict pattern avoiding duplicate `catchError` logic inside components and services.

## Directory Structure (`src/app/core/errors/`)
- **`models/`**: Defines the `IFlowError` contract, constants, internal Normalized types, Context maps, and Error codes.
- **`guards/`**: Contains type guards like `isIFlowErrorResponse` to validate backend payloads.
- **`normalizers/`**: Class (`ErrorNormalizer`) that adapts unknown/diverse errors into a unified `NormalizedError`.
- **`resolvers/`**: Class (`ErrorMessageResolver`) that decides the final text string to show based on prioritization.
- **`presenters/`**: Class (`ErrorToastPresenter`) that specifically triggers the UI toast notification.
- **`error.manager.ts`**: The main Injectable Facade and single entry point `ErrorsManager`.

## The Backend IFlowError Contract
The Angular system expects the backend to return JSON formatted exactly like this when an HTTP error status (4xx, 5xx) occurs:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid password provided",
    "category": "auth",
    "status": 401
  }
}
```

## How It Works

1. **Normalization**: `ErrorsManager.handle(error)` is called. The `ErrorNormalizer` receives the unknown payload, detects if it matches `IFlowError` (via guards), or if it's a generic HTTP/Network/JS error, and creates a standard `NormalizedError`.
2. **Context-based Resolution**: The `ErrorMessageResolver` takes the normalized data and seeks a user-facing string. It prioritizes:
   - Specific Context + Code overrides (from `error-messages.constants.ts`)
   - The literal backend message (if it is a valid IFlow platform error)
   - General code fallbacks (e.g., all `NOT_FOUND` errors)
   - The default generic error message.
3. **Presentation**: The `ErrorToastPresenter` takes the string and triggers the visual application Toast. No business logic occurs here.

## How to use `ErrorsManager`

### 1. In an API Service (HTTP Calls)
Always handle HTTP errors directly inside the `ApiService` using RxJS `catchError`. Do not delegate error parsing to the components.

```typescript
import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErrorsManager } from 'src/app/core/errors/error.manager';
import { ERROR_CONTEXTS } from 'src/app/core/errors/models/constants/error-contexts.constants';

export class ExampleService {
  private http = inject(HttpClient);
  private errorsManager = inject(ErrorsManager);

  public login() {
    return this.http.post('/api/login', {}).pipe(
      catchError((error: HttpErrorResponse) => {
        // Send to manager, assign an optional context
        this.errorsManager.handle(error, ERROR_CONTEXTS.AUTH_LOGIN);
        
        // Re-throw so components can stop loaders or proceed with failure logic
        return throwError(() => error); 
      })
    );
  }
}
```

### 2. Manual/Local Usage
If you want to manually trigger an error toast from a component due to a local validation or state issue:

```typescript
this.errorsManager.handle(new Error('Invalid local state'), ERROR_CONTEXTS.GENERAL);
```

## Extending the System

### Adding new Error Codes
Add them to `ERROR_CODES` in `src/app/core/errors/models/constants/error-codes.constants.ts`.

### Adding new Contexts
Add the domain context to `ERROR_CONTEXTS` in `src/app/core/errors/models/constants/error-contexts.constants.ts`.

### Adding specific UI Messages
Modify `src/app/core/errors/models/constants/error-messages.constants.ts`.
- **`FALLBACK_MESSAGES`**: General translations mapping directly to a code.
- **`CONTEXTUAL_MESSAGES`**: highly specific overrides. The key **must** follow the pattern `` `${ERROR_CONTEXTS.YOUR_CONTEXT}::${ERROR_CODES.YOUR_CODE}` ``.
