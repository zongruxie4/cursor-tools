Packing repository using repomix...
Querying Gemini AI using gemini-2.0-flash-thinking-exp-01-21...
Okay, sounds great! Integrating Stagehand into `cursor-tools` for browser control is an exciting direction. Stagehand, with its AI-powered APIs, could offer a more intuitive and powerful way to interact with web pages compared to direct Playwright commands, aligning well with the AI-agent focus of `cursor-tools`.

Here's a design proposal for integrating Stagehand into `cursor-tools`, focusing on the aspects you've requested:

## Design Proposal: Stagehand Integration for Browser Control in `cursor-tools`

This proposal outlines how to integrate Stagehand as a backend for the `cursor-tools browser` command, offering AI-powered web automation capabilities.

### 1. Command Structure: `cursor-tools browser act|extract|observe`

We will adopt a subcommand structure under `cursor-tools browser` to directly map to Stagehand's core APIs: `act`, `extract`, and `observe`. This makes the commands intuitive and reflects Stagehand's functionality.

```bash
cursor-tools browser act "<instruction>" [options]
cursor-tools browser extract "<instruction>" [options]
cursor-tools browser observe "<instruction>" [options]
```

**Subcommands:**

*   **`act`**:  Perform actions on a webpage using natural language instructions.  Examples: "Click on the 'Submit' button", "Type 'hello' into the search bar".
*   **`extract`**: Extract structured data from webpages based on natural language instructions and a defined schema.  Example: "Extract product names and prices from this page", "Get the main article content".
*   **`observe`**:  Observe the current webpage and identify relevant interactive elements or information based on instructions. Example: "What are the suggested actions on this page?", "Find the login form".

**General Options (Applicable to all subcommands):**

*   `--url <URL>`: (Optional but highly recommended) The URL to navigate to before performing the Stagehand action. If omitted, Stagehand would operate on the currently loaded page (if a session is maintained - see session management below).
*   `--model <model-name>`: (Optional) Specify the Stagehand/LLM model to use for the AI operations, if configurable by Stagehand.
*   `--save-to <filepath>`: (Optional) Save the output (e.g., extracted data, HTML, screenshots) to a file.
*   `--help`: (Optional) Display help for the specific subcommand.

**`extract` Subcommand Specific Options:**

*   `--schema <schema-definition>`: (Optional, potentially using JSON or a path to a schema file) Define the schema for data extraction. This could leverage Zod schemas if Stagehand supports it, or a simpler JSON schema format.

**Example Usage:**

```bash
cursor-tools browser act "Click on 'Login'" --url "https://example.com"
cursor-tools browser extract "Get product titles and prices" --url "https://example.com/products" --schema product_schema.json --save-to products.json
cursor-tools browser observe "What actions can I take on this page?" --url "https://example.com"
```

### 2. Implementation using `BrowserCommand` Class

We will extend the existing `BrowserCommand` structure to incorporate Stagehand.

*   **`BrowserCommand` (`src/commands/browser/browserCommand.ts`):**
    *   This class will act as the entry point for `cursor-tools browser` commands, similar to how it currently handles `open` and `element`.
    *   It will route execution to specific subcommand handlers (`ActCommand`, `ExtractCommand`, `ObserveCommand`).
    *   It will handle general options like `--url`, `--model`, and `--save-to` and pass them to the subcommand handlers.

*   **Subcommand Handlers (`src/commands/browser/act.ts`, `extract.ts`, `observe.ts`):**
    *   Each subcommand (e.g., `ActCommand`) will be a class implementing the `Command` interface.
    *   These classes will:
        *   Initialize and interact with the Stagehand library.
        *   Take the instruction and subcommand-specific options as input.
        *   Call the corresponding Stagehand API (`stagehand.act()`, `stagehand.extract()`, `stagehand.observe()`).
        *   Process the Stagehand response and format it for output to the user (and optionally save to file).
        *   Handle errors from Stagehand and Playwright gracefully.

*   **Stagehand Initialization (`src/commands/browser/stagehandUtils.ts` or similar):**
    *   A utility module to encapsulate Stagehand initialization and setup.
    *   Handles loading Stagehand configuration (API keys, etc.).
    *   Potentially manages Stagehand session creation and reuse (if session management is desired and feasible within the CLI context).

### 3. Key Features

*   **AI-Powered Browser Automation:** Leverage Stagehand's AI capabilities to perform actions, extract data, and understand web pages using natural language instructions. This offers a higher level of abstraction and potentially greater resilience to website changes compared to selector-based automation.
*   **Session Management (Optional but Recommended):** If Stagehand provides session management capabilities, we should consider implementing it. This could allow for:
    *   Maintaining browser state across multiple `cursor-tools browser` commands.
    *   More efficient interactions with websites that require session persistence (login, navigation history).
    *   Potentially using a `--session-id <id>` option to resume existing sessions or `--start-session` to initiate a new one.
    *   **Note:** CLI tools are typically stateless. Session management might add complexity but could be beneficial for certain workflows. We need to evaluate if it aligns with the core purpose of `cursor-tools` as a CLI tool.
*   **Schema Validation for `extract`:**  For the `extract` subcommand, integrating schema validation is crucial for ensuring structured and reliable data extraction. We can explore:
    *   Supporting Zod schemas directly if Stagehand is built with Zod.
    *   Using JSON Schema and validating extracted data against it.
    *   Providing clear error messages if extracted data does not conform to the schema.
*   **Error Handling and Informative Output:**  Comprehensive error handling is essential. We need to:
    *   Catch errors from Stagehand APIs, Playwright (if Stagehand uses it under the hood), and network requests.
    *   Provide user-friendly error messages that indicate the cause of the problem (e.g., invalid URL, Stagehand API error, selector not found, schema validation failure).
    *   Log detailed error information for debugging purposes.

### 4. Configuration

*   **Stagehand API Keys:** Stagehand will likely require API keys. We need to:
    *   Determine how Stagehand expects API keys to be configured (environment variables, config files, etc.).
    *   Integrate Stagehand API key configuration into `cursor-tools`'s existing configuration mechanism (`.cursor-tools.env` and `cursor-tools.config.json`).
    *   Potentially add a section in `cursor-tools.config.json` specifically for Stagehand configuration (e.g., `stagehand: { apiKey: "...", model: "..." }`).
*   **Stagehand Model Selection:** If Stagehand allows model selection, expose a `--model` option in the `browser` subcommands and allow configuration in `cursor-tools.config.json`.

### 5. Review Aspects

**a) Architecture:**

*   **Integration Point:** Stagehand will be integrated as a backend for the `cursor-tools browser` command, specifically for the `act`, `extract`, and `observe` subcommands. The existing `BrowserCommand` class will be extended to manage these new subcommands.
*   **Modularity:**  Subcommand handlers will be modular classes, promoting code organization and maintainability. Stagehand initialization will be encapsulated in a separate utility module.
*   **Loose Coupling:** Ideally, the integration should be loosely coupled. `cursor-tools` should interact with Stagehand through well-defined interfaces, minimizing dependencies on Stagehand's internal implementation details.
*   **Extensibility:** This design allows for adding more Stagehand-powered subcommands in the future if Stagehand's API expands.

**b) Error Handling:**

*   **Granular Error Catching:**  Error handling will be implemented at multiple levels:
    *   Within subcommand handlers to catch Stagehand API errors.
    *   Potentially at the Stagehand initialization level.
    *   Higher-level error handling in `BrowserCommand` to catch routing or general command errors.
*   **Informative Error Messages:** Error messages will be designed to be user-friendly and informative, guiding users on how to resolve issues.
    *   **Logging:**  Detailed error logs (potentially with debug flags) can be added for developers to diagnose problems.
    *   **Retry Mechanisms (Optional):** For certain transient errors (e.g., network issues, Stagehand API rate limits), we could consider adding basic retry mechanisms within the subcommand handlers.

**c) Performance:**

*   **Stagehand Performance:** Performance will largely depend on Stagehand's efficiency and the LLM models it uses. We need to be mindful of potential latency associated with AI operations.
*   **Resource Usage:** Stagehand might be resource-intensive (browser instances, LLM computations). We should document any resource requirements and consider if there are configuration options to optimize resource usage (e.g., headless mode, model selection).
*   **CLI Responsiveness:**  As `cursor-tools` commands are expected to be short-lived, we need to ensure that Stagehand operations complete within a reasonable timeframe and don't make the CLI unresponsive. We might need to set timeouts for Stagehand API calls.
*   **Caching (If Stagehand Supports):** If Stagehand offers caching mechanisms, we should explore leveraging them to improve performance for repeated or similar requests.

**d) Security:**

*   **API Key Security:**  Securely handling Stagehand API keys is paramount. We will follow `cursor-tools`'s existing approach of using environment variables and configuration files, ensuring keys are not hardcoded in the code and are not exposed in logs (unless explicitly enabled for debugging).
*   **Data Privacy:**  Consider the data privacy implications of sending webpage content and instructions to Stagehand's AI services.  Users should be aware of what data is being sent and processed by Stagehand. Document Stagehand's data privacy policies if available.
*   **Code Injection Risks:** Be mindful of potential code injection risks if Stagehand allows executing arbitrary JavaScript or interacting with webpage elements in a way that could be exploited.  Input sanitization and output validation might be necessary, depending on Stagehand's security model.
*   **Dependency Security:** Ensure that Stagehand and its dependencies are secure and regularly updated to mitigate known vulnerabilities.

**e) Integration:**

*   **`cursor-tools` Ecosystem:**  Stagehand integration should feel seamless within the `cursor-tools` ecosystem. Configuration, command structure, and output formatting should be consistent with existing commands.
*   **.cursorrules Integration:** Update `.cursorrules` to include documentation and usage examples for the new `browser` subcommands.
*   **Cursor IDE Integration:** The Stagehand-powered `browser` commands will be available to Cursor IDE users in the same way as other `cursor-tools` commands, enhancing the agent's web interaction capabilities.
*   **Peer Dependency:** Stagehand itself might have dependencies (like Playwright). We need to clarify the dependency situation.  If Stagehand depends on Playwright, it might make sense to keep Playwright as a peer dependency of `cursor-tools` to avoid version conflicts and allow users to manage their Playwright installation.

### Conclusion

Integrating Stagehand into `cursor-tools` has the potential to significantly enhance its browser automation capabilities, bringing AI-powered web interaction to the toolset. This design proposal provides a structured approach to implementation, addressing key aspects like architecture, error handling, performance, security, and integration.

Before proceeding with implementation, it's crucial to:

1.  **Thoroughly evaluate Stagehand's API and documentation.** Understand its capabilities, limitations, configuration options, error handling, and security model.
2.  **Clarify Stagehand's dependencies and licensing.**
3.  **Consider the complexity of session management.** Evaluate if session management is truly necessary and feasible for a CLI tool in this context.
4.  **Start with implementing the core `act`, `extract`, and `observe` subcommands** and iterate based on user feedback and testing.

Let me know if you'd like me to elaborate on any specific aspect of this proposal or make adjustments based on your feedback!

# Stagehand Integration Design for cursor-tools

## Overview

This document outlines the design for integrating Stagehand's AI-powered browser automation into cursor-tools as part of the `browser` command. The implementation focuses on simplicity, reliability, and CLI-appropriate patterns.

## Core Design Principles

### Stateless Command Design
The browser commands are designed to be completely stateless, following CLI best practices:

1. **Independent Operations**
   - Each command invocation is self-contained
   - No state is preserved between commands
   - Fresh browser instance for each command
   - Complete cleanup after command completion

2. **Explicit Parameters**
   - All necessary context must be provided in each command
   - No reliance on previous command state
   - URL required for each command
   - Clear documentation of required parameters

3. **Resource Management**
   - Browser instances created and destroyed per command
   - No persistent connections or sessions
   - Automatic cleanup of all resources
   - Timeout handling for long-running operations

This stateless design provides several benefits:
- Predictable behavior
- Easier testing and debugging
- No resource leaks
- CLI-appropriate usage patterns

## Command Structure

### Base Command
```typescript
// src/commands/browser/browserCommand.ts
export class BrowserCommand extends BaseCommand {
  static description = 'AI-powered browser automation';
  
  subcommands = {
    act: ActCommand,
    extract: ExtractCommand,
    observe: ObserveCommand,
    // Existing commands remain unchanged
    open: OpenCommand,
    element: ElementCommand,
  };
}
```

### Subcommands

#### Act Command
```typescript
// src/commands/browser/act.ts
export class ActCommand implements Command {
  static description = 'Perform actions on a webpage using natural language';
  static args = [{
    name: 'instruction',
    description: 'Natural language instruction for the action to perform',
    required: true
  }];
  static options = {
    url: Flags.string({
      char: 'u',
      description: 'URL to navigate to',
      required: true
    }),
    debug: Flags.boolean({
      description: 'Enable verbose debug output',
      default: false
    }),
    // ... other options
  };

  async execute(args: string[], options: CommandOptions): Promise<void> {
    const browser = await initializeBrowser(options);
    try {
      const result = await browser.act(args[0]);
      outputResult(result, options);
    } finally {
      await cleanupBrowser(browser);
    }
  }
}

#### Extract Command
```typescript
// src/commands/browser/extract.ts
export class ExtractCommand implements Command {
  static description = 'Extract structured data from a webpage';
  static args = [{
    name: 'instruction',
    description: 'Natural language instruction for data to extract',
    required: true
  }];
  static options = {
    url: Flags.string({
      char: 'u',
      description: 'URL to navigate to',
      required: true
    }),
    schema: Flags.string({
      description: 'Path to schema file or inline JSON schema. If not provided, extracts data as human-readable text.',
      required: false
    }),
    // ... other options
  };

  // Default schema when none is provided
  private defaultSchema = {
    type: "string",
    description: "the extracted information in a human friendly style"
  };

  async execute(args: string[], options: CommandOptions): Promise<void> {
    const browser = await initializeBrowser(options);
    const schema = options.schema ? await loadSchema(options.schema) : this.defaultSchema;
    try {
      const result = await browser.extract(args[0], schema);
      outputResult(result, options);
    } finally {
      await cleanupBrowser(browser);
    }
  }
}

#### Observe Command
```typescript
// src/commands/browser/observe.ts
export class ObserveCommand implements Command {
  static description = 'Identify interactive elements on a webpage';
  static args = [{
    name: 'instruction',
    description: 'Natural language instruction for what to observe',
    required: true
  }];
  static options = {
    url: Flags.string({
      char: 'u',
      description: 'URL to navigate to',
      required: true
    }),
    // ... other options
  };

  async execute(args: string[], options: CommandOptions): Promise<void> {
    const browser = await initializeBrowser(options);
    try {
      const result = await browser.observe(args[0]);
      outputResult(result, options);
    } finally {
      await cleanupBrowser(browser);
    }
  }
}
```

## Core Utilities

### Browser Management
```typescript
// src/commands/browser/utils.ts
export async function initializeBrowser(options: CommandOptions): Promise<StagehandBrowser> {
  const config = loadBrowserConfig();
  // Create a fresh browser instance for each command
  const browser = new StagehandBrowser({
    headless: options.headless ?? config.headless,
    timeout: options.timeout ?? config.timeout,
    debug: options.debug ?? config.debug,
    model: options.model ?? config.defaultModel,
  });
  await browser.init();
  return browser;
}

export async function cleanupBrowser(browser: StagehandBrowser): Promise<void> {
  try {
    // Ensure complete cleanup of browser resources
    await browser.close();
  } catch (error) {
    console.error('Error cleaning up browser:', error);
    // Even if cleanup fails, don't throw - the process will clean up resources
  }
}
```

### Schema Handling
```typescript
// src/commands/browser/schema.ts
export async function loadSchema(schemaPath: string): Promise<z.ZodSchema> {
  if (schemaPath.startsWith('{')) {
    return parseInlineSchema(schemaPath);
  }
  return loadSchemaFile(schemaPath);
}

export function getDefaultSchema(): z.ZodSchema {
  // Convert our simple JSON schema to Zod schema
  return z.string().describe('the extracted information in a human friendly style');
}

export function validateSchema(data: unknown, schema: z.ZodSchema): boolean {
  const result = schema.safeParse(data);
  return result.success;
}
```

### Output Formatting
```typescript
// src/commands/browser/output.ts

// Generator function to yield human-readable output in sections
export async function* formatOutput(command: string, result: any, options: CommandOptions): CommandGenerator {
  // Common header
  yield `Results from ${command} command:\n`;

  if (command === 'act') {
    // Act command output
    yield `Action performed: ${result.message}\n`;
    if (result.actions?.length > 0) {
      yield '\n--- Actions Taken ---\n';
      for (const action of result.actions) {
        yield `• ${action}\n`;
      }
      yield '--- End of Actions ---\n';
    }
  }
  
  else if (command === 'extract') {
    // Extract command output
    if (options.schema) {
      yield '--- Extracted Data ---\n';
      // Format the structured data in a readable way
      yield formatStructuredData(result);
      yield '--- End of Extracted Data ---\n';
    } else {
      yield '--- Extracted Content ---\n';
      yield result.text;
      yield '\n--- End of Extracted Content ---\n';
    }
  }
  
  else if (command === 'observe') {
    // Observe command output
    yield `Page Summary: ${result.summary}\n`;
    
    if (result.elements?.length > 0) {
      yield '\n--- Interactive Elements Found ---\n';
      for (const element of result.elements) {
        yield `\n${element.type.toUpperCase()} - ${element.description}\n`;
        yield `Location: ${element.location}\n`;
        if (element.actions?.length > 0) {
          yield `Possible actions: ${element.actions.join(', ')}\n`;
        }
      }
      yield '--- End of Interactive Elements ---\n';
    }
  }

  // Debug information if requested
  if (options.debug) {
    yield '\n--- Debug Information ---\n';
    yield JSON.stringify(result.debug, null, 2);
    yield '\n--- End of Debug Information ---\n';
  }
}

// Helper function to format structured data in a readable way
function formatStructuredData(data: any, indent = ''): string {
  if (typeof data !== 'object' || data === null) {
    return String(data);
  }

  let output = '';
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      output += `${indent}${key}:\n`;
      value.forEach((item, index) => {
        output += `${indent}  ${index + 1}. ${formatStructuredData(item, indent + '  ')}\n`;
      });
    } else if (typeof value === 'object') {
      output += `${indent}${key}:\n${formatStructuredData(value, indent + '  ')}`;
    } else {
      output += `${indent}${key}: ${value}\n`;
    }
  }
  return output;
}

// Update the command classes to use the generator
export class ActCommand implements Command {
  async *execute(args: string[], options: CommandOptions): CommandGenerator {
    const browser = await initializeBrowser(options);
    try {
      const result = await browser.act(args[0]);
      yield* formatOutput('act', result, options);
    } finally {
      await cleanupBrowser(browser);
    }
  }
}

// Similar updates for ExtractCommand and ObserveCommand
```

## Configuration

### Types
```typescript
// src/types/browser.ts
export interface BrowserConfig {
  defaultModel: string;
  headless: boolean;
  timeout: number;
  debug: boolean;
}

export interface BrowserCommandOptions extends CommandOptions {
  url: string;
  debug?: boolean;
  model?: string;
  headless?: boolean;
  timeout?: number;
  saveTo?: string;
}
```

### Default Configuration
```typescript
// src/config/browser.ts
export const defaultBrowserConfig: BrowserConfig = {
  defaultModel: 'gpt-4',
  headless: true,
  timeout: 30000,
  debug: false,
};
```

## Error Handling

### Error Types
```typescript
// src/errors/browser.ts
export class BrowserError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'BrowserError';
  }
}

export class SchemaError extends Error {
  constructor(message: string, public schema: any) {
    super(message);
    this.name = 'SchemaError';
  }
}
```

### Error Handling Strategy
```typescript
// src/commands/browser/errorHandling.ts
export function handleBrowserError(error: Error, options: CommandOptions): never {
  if (options.debug) {
    console.error('Debug information:');
    console.error(error.stack);
    if (error instanceof BrowserError && error.details) {
      console.error('Error details:', error.details);
    }
  } else {
    console.error(error.message);
  }
  process.exit(1);
}
```

## Testing Strategy

### Unit Tests
```typescript
// tests/commands/browser/act.test.ts
describe('ActCommand', () => {
  it('should execute action successfully', async () => {
    // Test implementation
  });

  it('should handle errors gracefully', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// tests/integration/browser.test.ts
describe('Browser Integration', () => {
  it('should interact with test webpage', async () => {
    // Test implementation
  });

  it('should handle dynamic content', async () => {
    // Test implementation
  });
});
```

## Implementation Plan

### Phase 1: Core Implementation
1. Set up Stagehand integration
2. Implement basic command structure
3. Add error handling
4. Write unit tests

### Phase 2: Enhanced Features
1. Add schema validation
2. Implement debug mode
3. Add output formatting
4. Write integration tests

### Phase 3: Optimization
1. Add performance monitoring
2. Implement caching
3. Add security measures
4. Write documentation

## Security Considerations

1. Input Validation
   - Validate all command arguments
   - Sanitize URLs
   - Validate schemas

2. Resource Management
   - Enforce timeouts
   - Clean up browser instances
   - Monitor memory usage

3. Credential Handling
   - Secure API key storage
   - No credential persistence
   - Sanitize output

4. Browser Security
   - Headless by default
   - Isolated contexts
   - Network request validation