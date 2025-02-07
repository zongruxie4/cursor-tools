# cursor-tools Browser Command with Stagehand

The `cursor-tools browser` command now includes AI-powered browser automation capabilities using Stagehand. This integration enables natural language-based web interactions through the command line.

## Command Design

### Stateless Operation
Each browser command operates independently and maintains no state between invocations. This means:
- Every command starts with a fresh browser instance
- No session data is preserved between commands
- Each command must include all necessary information (URL, selectors, etc.)
- Browser resources are fully cleaned up after each command completes

This stateless design ensures reliability and predictability in CLI usage, though it may require more explicit parameters for each command.

For example, to perform multiple actions on a page, you would need separate commands:
```bash
# Each command starts fresh - URL must be provided each time
cursor-tools browser act "Click login" --url "https://example.com/login"
cursor-tools browser act "Type 'user@example.com' into email field" --url "https://example.com/login"
cursor-tools browser act "Click submit" --url "https://example.com/login"
```

## Commands

```bash
# Perform actions on a webpage using natural language
cursor-tools browser act "<instruction>" --url <url> [options]

# Extract structured data from webpages
cursor-tools browser extract "<instruction>" --url <url> [options]

# Observe webpage elements and possible actions
cursor-tools browser observe "<instruction>" --url <url> [options]
```

## Options

- `--url <url>`: The webpage URL to interact with (required)
- `--schema <path|json>`: JSON schema for data extraction (optional - defaults to extracting human-readable text)
- `--model <model>`: Specify an alternative AI model (optional)
- `--debug`: Enable verbose debug output (optional)
- `--save-to <path>`: Save command output to a file (optional)
- `--headless`: Run browser in headless mode (default: true)

## Examples

```bash
# Extract data with default text schema
cursor-tools browser extract "Get the main article content" --url "https://example.com/blog"

# Extract structured data with custom schema
cursor-tools browser extract "Get all product names and prices" --url "https://example.com/products" --schema product-schema.json

# Extract and save to file (uses default text schema)
cursor-tools browser extract "Get article titles" --url "https://example.com/blog" --save-to blog-titles.txt

# Extract structured data and save as JSON
cursor-tools browser extract "Get article titles and authors" --url "https://example.com/blog" --schema article-schema.json --save-to blog-data.json
```

## Schema Examples

For the `extract` command, you can optionally specify schemas either inline or in a file. If no schema is provided, the command will extract data as human-readable text.

```json
// product-schema.json
{
  "type": "object",
  "properties": {
    "products": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "price": { "type": "number" },
          "description": { "type": "string" }
        },
        "required": ["name", "price"]
      }
    }
  }
}
```

## Integration with Other cursor-tools Commands

The browser command can be combined with other cursor-tools commands for powerful workflows:

```bash
# Extract data and process with web command
cursor-tools browser extract "Get repository stats" --url "https://github.com/user/repo" --schema stats.json | cursor-tools web "Analyze these GitHub stats"

# Use with repo command for local development
cursor-tools browser act "Test the login flow" --url "http://localhost:3000" && cursor-tools repo "Update the test results in our documentation"
```

## Dependencies

The browser command requires the following dependencies:

- Stagehand: Installed automatically as a dependency of cursor-tools
- Playwright: Already a peer dependency of cursor-tools
- Zod: Used for schema validation (installed with Stagehand)

## Configuration

Browser command settings can be configured in `cursor-tools.config.json`:

```json
{
  "browser": {
    "defaultModel": "gpt-4",
    "headless": true,
    "timeout": 30000,
    "debug": false
  }
}
```

API keys should be set in `.cursor-tools.env`:

```env
STAGEHAND_API_KEY=your_api_key_here
```

## Error Handling

The browser command provides concise error messages by default. Use the `--debug` flag for detailed error information:

```bash
# Default error output
cursor-tools browser act "Click submit" --url "https://example.com"
Error: Could not find element matching "submit" on the page

# Debug error output
cursor-tools browser act "Click submit" --url "https://example.com" --debug
Error: Could not find element matching "submit" on the page
Debug info:
- Page loaded: true
- Visible elements: 3
- Similar elements found: ["Submit Order", "Submit Form"]
- DOM snapshot: [...]
```

## Security Considerations

1. API keys are stored securely in `.cursor-tools.env`
2. Headless mode is enabled by default for security
3. Input validation is performed on all commands
4. Schema validation ensures safe data extraction
5. Browser sessions are isolated and cleaned up after each command

## Known Limitations

1. Stateless Design Implications:
   - Each command starts a new browser session
   - No automatic state preservation between commands
   - Must provide full context (URL, etc.) for each command
   - May be slower for multiple operations on the same page
2. Limited support for infinite scroll and dynamic content
3. Some websites may block automated browser access

## Best Practices

1. Use specific, clear instructions in natural language
2. Provide complete schemas for data extraction
3. Enable debug mode when troubleshooting
4. Use headless mode unless visual inspection is needed
5. Handle errors appropriately in scripts
6. Clean up resources by properly terminating commands

## Output Format

Each command provides output in a clear, human-readable format with sections:

### Act Command Output
```
Results from act command:

Action performed: Clicked the 'Submit' button

--- Actions Taken ---
• navigated to page
• clicked button
--- End of Actions ---
```

### Extract Command Output
Without schema:
```
Results from extract command:

--- Extracted Content ---
The main article discusses the benefits of AI-powered automation. 
Key points include improved efficiency, reduced errors, and better 
user experience. The article concludes with future predictions 
about AI adoption in various industries.
--- End of Extracted Content ---
```

With schema:
```
Results from extract command:

--- Extracted Data ---
products:
  1. name: Example Product
     price: 99.99
     description: A great product for your needs
  2. name: Another Product
     price: 149.99
     description: Premium features included
--- End of Extracted Data ---
```

### Observe Command Output
```
Results from observe command:

Page Summary: Login page with a form containing username/password fields and a submit button

--- Interactive Elements Found ---

BUTTON - Login button in the top right corner
Location: header navigation
Possible actions: click, hover

INPUT - Username text field
Location: login form
Possible actions: type, focus

INPUT - Password text field
Location: login form
Possible actions: type, focus
--- End of Interactive Elements ---
```

All commands support the `--debug` flag which adds a debug information section to the output:
```
--- Debug Information ---
{
  "pageTitle": "Login Page",
  "elementCount": 15,
  "loadTime": "1.2s"
}
--- End of Debug Information ---
```
