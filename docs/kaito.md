Generating repository documentation...
Fetching repository context for kaito-http/kaito@v4...
Generating documentation using Gemini AI...

--- Repository Documentation ---

```markdown
# Kaito HTTP Framework Documentation

## Introduction

Kaito is a fast and intuitive HTTP server framework for TypeScript.
It is built for modern runtimes like Bun, Node.js, Deno, and Cloudflare Workers.
Kaito uses the Fetch API and offers end-to-end type safety.

**Key Features:**

*   Works with any validation library (Zod recommended).
*   Strong TypeScript support for type safety.
*   High performance.
*   Intuitive API.
*   Small package size.
*   Streaming support with Server-Sent Events (SSE).
*   Optional client library with full type safety.

## Quick Start

Install Kaito core:

```bash
bun i @kaito-http/core
```

Create a simple server in `index.ts`:

```typescript
import { createUtilities, createKaitoHandler } from '@kaito-http/core';

const { router, getContext } = createUtilities(async () => {
    return { uptime: Date.now() };
});

const app = router().get('/', async ({ ctx }) => {
    return { uptime: ctx.uptime };
});

const handle = createKaitoHandler({
    getContext,
    router: app,
    onError: async (error) => {
        console.error(error);
        return { status: 500, message: 'Internal Server Error' };
    },
});

Bun.serve({
    port: 3000,
    fetch: handle,
});

console.log('Server listening on port 3000');
```

Run the server:

```bash
bun index.ts
```

Access the server at `http://localhost:3000`.

## Core Concepts

Kaito revolves around three main concepts:

*   **Routes**:  Represent individual HTTP endpoints with request handlers and optional input validation.
*   **Routers**: Collections of routes. Routers can be merged and prefixed for organization.
*   **Context**:  Request-specific data shared across all routes, created on each request.

### Routes

Routes handle specific HTTP requests.
They can define input schemas for query parameters and request bodies using Zod.
Route handlers can return JSON serializable values or `Response` objects.

### Routers

Routers organize routes and define metadata.
Routers are immutable and chainable.
Use `.merge()` to combine routers with path prefixes.
Use `.through()` to modify the context for a group of routes.

### Context

Context provides shared information to all routes within an application.
It is generated per request.
Context can include request details, database connections, or user sessions.
Use `createUtilities` to define a typed context.

## Packages

Kaito is divided into multiple packages:

*   `@kaito-http/core`: Core functionalities like routing, context, and request handling.
*   `@kaito-http/client`:  Type-safe HTTP client for Kaito servers.
*   `@kaito-http/uws`:  HTTP server implementation for Node.js using uWebSockets.js.

---

## `@kaito-http/core` Package

### Summary

`@kaito-http/core` is the foundation of the Kaito framework.
It provides core functionalities for building HTTP servers.
This includes routing, context management, request and response handling, and error handling.

### Installation

```bash
bun i @kaito-http/core
```

### API Documentation

#### `createUtilities`

```typescript
import { createUtilities } from '@kaito-http/core';

const { router, getContext } = createUtilities(async (req, res) => {
  // ... context creation logic ...
  return { /* context object */ };
});
```

`createUtilities` is a helper function to create a typed `router` and `getContext` function.
It takes a function that defines how to create the context for each request.
It returns an object with `router` and `getContext` properties.

#### `getContext`

The `getContext` function, created by `createUtilities`, is responsible for generating the context object for each incoming request.
It receives the `KaitoRequest` and `KaitoHead` objects.
It should return a Promise resolving to the context object.

#### `router`

The `router` function, created by `createUtilities`, is used to create new routers.
Routers are used to define and organize routes.
It returns a new `Router` instance.

#### `createKaitoHandler`

```typescript
import { createKaitoHandler } from '@kaito-http/core';

const handler = createKaitoHandler({
  router: appRouter,
  getContext: myGetContext,
  onError: async ({ error, req }) => { /* ... error handling ... */ },
  before: async (req) => { /* ... request preprocessing ... */ },
  transform: async (req, res) => { /* ... response transformation ... */ },
});
```

`createKaitoHandler` creates a request handler function.
It takes a configuration object with:

*   `router`: The root `Router` instance for the application.
*   `getContext`: The context creation function.
*   `onError`:  An asynchronous function to handle errors thrown in routes (excluding `KaitoError`). It should return an object with `status` and `message`.
*   `before?`: An optional asynchronous function that runs before routing. It can return a `Response` to bypass routing.
*   `transform?`: An optional asynchronous function to transform every response before sending.

#### `Router` Class

The `Router` class manages routes and context transformations.

*   **`Router.create<Context>()`**:  Static method to create a new, empty router with a specific context type.
*   **`.get(path, route)`**:  Adds a GET route. `route` can be a route handler function or a route object.
*   **`.post(path, route)`**: Adds a POST route.
*   **`.put(path, route)`**: Adds a PUT route.
*   **`.patch(path, route)`**: Adds a PATCH route.
*   **`.delete(path, route)`**: Adds a DELETE route.
*   **`.head(path, route)`**: Adds a HEAD route.
*   **`.options(path, route)`**: Adds an OPTIONS route.
*   **`.merge(pathPrefix, otherRouter)`**: Merges routes from `otherRouter` under a path prefix.
*   **`.through(throughFunction)`**: Creates a new router with a context transformation function. `throughFunction` receives the current context and returns a new context.
*   **`.freeze(serverConfig)`**:  Freezes the router and prepares it for use with `createKaitoHandler`.

#### `KaitoError` Class

```typescript
import { KaitoError } from '@kaito-http/core';

throw new KaitoError(404, 'User not found');
```

`KaitoError` is a built-in error class to throw in routes for client-facing errors.
Throwing `KaitoError` bypasses the `.onError` handler.
It takes a status code and a message as arguments.

#### `sse` function

```typescript
import { sse } from '@kaito-http/core/stream';

const streamRoute = router().get('/stream', async () => {
    return sse(async function* () {
        yield { data: 'Hello', event: 'message' };
        await new Promise(resolve => setTimeout(resolve, 100));
        yield { data: 'World', event: 'message' };
    });
});
```

`sse` function is used to create Server-Sent Events (SSE) responses.
It takes an async generator or an `SSESource` object.
It returns a `KaitoSSEResponse` object.

#### `sseFromAnyReadable` function

```typescript
import { sseFromAnyReadable } from '@kaito-http/core/stream';

const readableStream = new ReadableStream({ /* ... */ });
const sseResponse = sseFromAnyReadable(readableStream, (chunk) => ({ data: chunk.toString(), event: 'message' }));
```

`sseFromAnyReadable` converts any `ReadableStream` into an SSE stream.
It takes a `ReadableStream` and a transform function.
The transform function converts chunks from the stream into SSE events.

#### `experimental_createCORSTransform` function

```typescript
import { experimental_createCORSTransform } from '@kaito-http/core/cors';

const cors = experimental_createCORSTransform(['http://localhost:3000', 'https://example.com']);

const handler = createKaitoHandler({
    // ...
    transform: async (request, response) => {
        cors(request, response);
    }
});
```

`experimental_createCORSTransform` is an experimental function to create a CORS transform for the `transform` option in `createKaitoHandler`.
It takes an array of allowed origins.
It returns a function that sets CORS headers on the response.

### Dependencies

*   **Zod**:  For schema validation (recommended).

### Usage Examples

Refer to the `apps/docs/src/pages/documentation` and `apps/docs/src/pages/recipes` files in the repository for detailed usage examples of core features like:

*   Creating routes and routers.
*   Defining and using context.
*   Handling errors.
*   Implementing SSE streaming.
*   Applying CORS.

---

## `@kaito-http/client` Package

### Summary

`@kaito-http/client` is a type-safe HTTP client for Kaito servers.
It allows for end-to-end type safety in Kaito applications.
The client automatically validates inputs, constructs URLs, and provides TypeScript types for responses.

### Installation

```bash
bun i @kaito-http/client
```

### API Documentation

#### `createKaitoHTTPClient`

```typescript
import { createKaitoHTTPClient } from '@kaito-http/client';
import type { App } from '../api/index.ts'; // Assuming server's app type is exported

const api = createKaitoHTTPClient<App>({
    base: 'http://localhost:3000',
    before: async (url, init) => { /* ... request modification ... */ },
    fetch: async (request) => { /* ... custom fetch implementation ... */ },
});
```

`createKaitoHTTPClient` creates a type-safe Kaito HTTP client.
It takes a configuration object with:

*   `base`: The base URL of the Kaito API.
*   `before?`: An optional asynchronous function to modify requests before sending (e.g., adding headers).
*   `fetch?`: An optional custom `fetch` implementation.

It returns an API client object with methods for each HTTP method (e.g., `api.get`, `api.post`).

#### `KaitoClientHTTPError` Class

```typescript
import { KaitoClientHTTPError, isKaitoClientHTTPError } from '@kaito-http/client';

try {
    const response = await api.get('/v1/users/123');
} catch (error: unknown) {
    if (isKaitoClientHTTPError(error)) {
        console.error('Error:', error.message);
        console.error('Status:', error.response.status);
        console.error('Body:', error.body);
    }
}
```

`KaitoClientHTTPError` is thrown by the client when an HTTP error occurs (non-2xx status code).
It extends `Error` and includes properties:

*   `request`: The original `Request` object.
*   `response`: The `Response` object.
*   `body`: The parsed error response body (if JSON).

#### `isKaitoClientHTTPError` function

```typescript
import { isKaitoClientHTTPError } from '@kaito-http/client';
// ... error handling example above ...
```

`isKaitoClientHTTPError` is a type guard function to check if an error is a `KaitoClientHTTPError` instance.

#### `KaitoSSEStream` Class

```typescript
import { KaitoSSEStream } from '@kaito-http/client';

const stream = await api.get('/v1/sse_stream', { sse: true });

if (stream instanceof KaitoSSEStream) {
    for await (const event of stream) {
        console.log('SSE Event:', event);
    }
}
```

`KaitoSSEStream` represents an SSE stream from a Kaito server.
It implements the `AsyncIterable` interface.
Use `for await...of` to iterate over SSE events.

### Dependencies

*   None explicitly listed (relies on browser/runtime `fetch` API).

### Usage Examples

Refer to `apps/docs/src/pages/documentation/client.mdx` for detailed client usage examples, including:

*   Basic client creation and requests.
*   Handling non-JSON responses.
*   Using Server-Sent Events (SSE).
*   Cancelling requests with `AbortSignal`.
*   Customizing request behavior with `before` and `fetch`.

---

## `@kaito-http/uws` Package

### Summary

`@kaito-http/uws` provides a Kaito HTTP server implementation for Node.js.
It is based on `uWebSockets.js` for high performance.
This package allows running Kaito applications on Node.js with performance close to Bun.

### Installation

```bash
bun i @kaito-http/uws
```

**Note:** `@kaito-http/uws` works with Node.js. Bun is used as a package manager in the command above. You can use `npm` or `yarn` as well.

### API Documentation

#### `KaitoServer.serve`

```typescript
import { KaitoServer } from '@kaito-http/uws';
import { createKaitoHandler } from '@kaito-http/core';
// ... handler creation ...

const server = await KaitoServer.serve({
    port: 3000,
    fetch: handle,
    host: '0.0.0.0', // Optional host
});

console.log(`Server listening at ${server.url}`);
```

`KaitoServer.serve` is an asynchronous function to start a Kaito server on Node.js.
It takes a configuration object with:

*   `port`: The port to listen on.
*   `fetch`: The Kaito request handler function created by `createKaitoHandler`.
*   `host?`:  Optional host address to bind to (default: `0.0.0.0`).

It returns a `KaitoServer` instance.

#### `KaitoServer` Class

*   **`close()`**:  Closes the server.
*   **`address`**:  Property to get the server address (host:port).
*   **`url`**: Property to get the full server URL (`http://host:port`).

#### `getRemoteAddress` function

```typescript
import { getRemoteAddress } from '@kaito-http/uws';
import { createUtilities } from '@kaito-http/core';

const { router, getContext } = createUtilities(async () => {
    const ip = getRemoteAddress();
    return { clientIp: ip };
});
```

`getRemoteAddress` function retrieves the client's IP address.
It can only be called within the `getContext` function or inside a route handler.
It uses `AsyncLocalStorage` internally.
Returns the remote IP address as a string.

### Dependencies

*   `uWebSockets.js`

### Usage Examples

Refer to `apps/docs/src/pages/runtimes.mdx` and `apps/docs/src/pages/recipes/getting-clients-ip.mdx` for usage examples:

*   Running Kaito server on Node.js.
*   Accessing client IP address in Node.js using `getRemoteAddress`.

---

## Configuration

Kaito is configured through options passed to `createKaitoHandler` for server-side and `createKaitoHTTPClient` for client-side.

**Server-side configuration (`createKaitoHandler`):**

*   `getContext`: Defines context creation logic.
*   `onError`:  Customizes error responses.
*   `before`: Request preprocessing (e.g., OPTIONS request handling, early exits).
*   `transform`: Response transformation (e.g., CORS headers).

**Client-side configuration (`createKaitoHTTPClient`):**

*   `base`: Base URL for API requests.
*   `before`: Request modification before sending (e.g., authentication headers).
*   `fetch`: Custom `fetch` implementation.

## Advanced Usage Examples

*   **Router Merging**: Combine routers for modular application structure.
*   **Context Transformation (`.through()`)**:  Implement middleware-like logic to extend context for specific route groups.
*   **Server-Sent Events (SSE)**:  Build real-time features using SSE streams for both GET and POST requests, handling different event types and data structures.
*   **CORS Handling**:  Use `transform` in `createKaitoHandler` and `experimental_createCORSTransform` for fine-grained CORS control.
*   **Custom Client Fetch**:  Override the default `fetch` implementation in `createKaitoHTTPClient` for advanced request interception or custom fetch libraries.
```

--- End of Documentation ---
Documentation generation completed!
