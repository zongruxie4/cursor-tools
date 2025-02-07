# Stagehand Integration Research for cursor-tools

## Core APIs and Use Cases

### 1. Act API
- **Purpose**: Execute actions on webpages using natural language instructions
- **Key Features**:
  - Click, type, navigate, scroll actions
  - Form filling and submission
  - Dynamic content interaction
- **CLI Considerations**:
  - Actions must complete or fail definitively (no hanging states)
  - Clear success/failure output
  - Support for --debug flag to show action details

### 2. Extract API
- **Purpose**: Extract structured data from webpages
- **Key Features**:
  - Schema-based extraction using Zod
  - Support for complex data structures
  - Handles dynamic content loading
- **CLI Considerations**:
  - JSON output for piping to other commands
  - Schema validation before extraction
  - Support for both inline and file-based schemas

### 3. Observe API
- **Purpose**: Identify interactive elements and possible actions
- **Key Features**:
  - Element discovery and description
  - Action suggestions
  - State observation
- **CLI Considerations**:
  - Structured output format
  - Filterable results
  - Integration with act command

## CLI-Specific Implementation Patterns

### 1. Command Structure
- Follow existing cursor-tools command patterns
- Subcommands under `browser` command
- Consistent option naming with other commands
- Support for --help on all subcommands

### 2. Error Handling
- Default: Concise, actionable messages
- Debug mode: Detailed information including
  - Page state
  - DOM elements
  - Action attempts
  - Network status
- Exit codes for different error types

### 3. Performance Optimization
- Headless mode by default
- Browser instance cleanup
- Resource usage monitoring
- Timeout handling
- Caching considerations:
  - Schema caching
  - Browser context reuse (when safe)
  - Response caching (where appropriate)

### 4. Security Implementation
- API key management via .env
- Input validation and sanitization
- Secure schema handling
- Browser isolation
- Resource cleanup
- Network request validation

## Integration with cursor-tools Architecture

### 1. Command Implementation
```typescript
// Example command structure
class BrowserCommand extends BaseCommand {
  subcommands = {
    act: ActCommand,
    extract: ExtractCommand,
    observe: ObserveCommand
  };
}

class ActCommand implements Command {
  // Consistent with other cursor-tools commands
  async execute(args: string[], options: CommandOptions): Promise<void> {
    // Implementation
  }
}
```

### 2. Configuration Management
```typescript
// Configuration structure
interface BrowserConfig {
  defaultModel: string;
  headless: boolean;
  timeout: number;
  debug: boolean;
}

// Environment variables
interface BrowserEnv {
  STAGEHAND_API_KEY: string;
}
```

### 3. Output Handling
```typescript
// Structured output format
interface CommandOutput {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    details?: any;
  };
}
```

## Best Practices and Recommendations

### 1. Command Design
- Keep commands atomic and focused
- Provide clear success/failure indicators
- Support piping between commands
- Maintain stateless operation

### 2. Error Handling
- Use exit codes consistently
- Provide actionable error messages
- Include troubleshooting hints
- Support verbose debugging

### 3. Performance
- Clean up resources promptly
- Monitor memory usage
- Handle timeouts gracefully
- Cache appropriately

### 4. Security
- Validate all inputs
- Sanitize outputs
- Manage credentials securely
- Isolate browser instances

### 5. Testing
- Unit tests for command parsing
- Integration tests with mock websites
- Security tests for input validation
- Performance benchmarks

## Known Limitations and Workarounds

### 1. Dynamic Content
- Issue: Limited support for infinite scroll
- Workaround: Use pagination where available
- Alternative: Break into smaller scroll operations

### 2. Authentication
- Issue: No session persistence between commands
- Workaround: Pass credentials/tokens as options
- Alternative: Use API endpoints when available

### 3. Performance
- Issue: Browser startup overhead
- Workaround: Optimize headless mode
- Alternative: Cache responses where appropriate

### 4. Blocking
- Issue: Some sites block automated access
- Workaround: Use appropriate delays
- Alternative: Consider API usage if available

## Integration Examples

### 1. Local Development
```bash
# Test local web app
cursor-tools browser act "test login flow" --url "http://localhost:3000"

# Extract test results
cursor-tools browser extract "get test coverage" --url "http://localhost:3000/coverage"
```

### 2. Data Pipeline
```bash
# Extract and analyze
cursor-tools browser extract "get metrics" --url "https://example.com" |
cursor-tools web "analyze trends"

# Update documentation
cursor-tools browser observe "check UI changes" --url "https://example.com" |
cursor-tools repo "update changelog"
```

### 3. Automation
```bash
# Form submission
cursor-tools browser act "fill signup form" --url "https://example.com/signup"

# Data extraction
cursor-tools browser extract "get user list" --url "https://example.com/users"
```