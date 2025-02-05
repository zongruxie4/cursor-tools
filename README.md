# cursor-tools

Enhance your Dev Agent / AI powered IDE with *even more AI*

AI-compatible AI-powered web queries and codebase understanding. `cursor-tools` seamlessly integrates with Cursor (and other agents) to provide intelligent responses using Perplexity AI for web searches and Google Gemini for whole-repository-aware assistance.

cursor-tools is an npm package that you can install in your project and provides a CLI that your AI agent can use to expand its capabilities.

## Examples

Early examples from when the tools were called ask_perplexity and ask_gemini (new example screenshots and videos coming soon)

| web example | repo example |
|-------------------|--------------------------|
| <img src="https://github.com/user-attachments/assets/6af1af2e-ab8d-4b02-915c-3ff5ded14507" width="400"/><br/><img src="https://github.com/user-attachments/assets/f9051238-d14d-4db3-8847-b4acc90edd0a" width="400"/> | <img src="https://github.com/user-attachments/assets/3cb1a805-bef9-4957-9950-cd37d2bef8d3" width="400"/> |

## Installation

Run the interactive setup:
```bash
npx cursor-tools install .
```

This command will:

1. Add `cursor-tools` as a dev dependency in your package.json
2. Guide you through API key configuration
3. Update your `.cursorrules` file for Cursor integration

## Cursor Usage

Use cursor in agent mode with command execution (not sure what this means, see section below on Cursor Agent configuration)

### Use web search
"Cursor please implement country specific stripe payment pages for the USA, UK, France and Germany. Use cursor-tools web to check the available stripe payment methods in each country."

### Use repo search
"Let's refactor our user class to allow multiple email aliases per user. cursor-tools Gemini for a plan including a list of all files that need to be changed."

## Configuration

### API Keys
`cursor-tools` requires API keys for both Perplexity AI and Google Gemini. These can be configured in two ways:

1. **Interactive Setup**: Run `cursor-tools install` and follow the prompts
2. **Manual Setup**: Create `~/.cursor-tools/.env` in your home directory or `.cursor-tools.env` in your project root:
   ```env
   PERPLEXITY_API_KEY="your-perplexity-api-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

### Default Settings
Customize `cursor-tools` behavior by creating a `cursor-tools.config.json` file:
```json
{
  "perplexity": {
    "model": "sonar-pro", // was "llama-3.1-sonar-large-128k-online",
    "maxTokens": 8000
  },
  "gemini": {
    "model": "gemini-2.0-flash-thinking-exp-01-21",
    "maxTokens": 10000
  }
}
```

## Core Features

### Web Search
Use Perplexity AI to get up-to-date information directly within Cursor:
```bash
cursor-tools web "What's new in TypeScript 5.7?"
```

### Repository Context
Leverage Google Gemini for codebase-aware assistance:
```bash
cursor-tools repo "Explain the authentication flow in this project, which files are involved?"
```

### Documentation Generation
Generate comprehensive documentation for your repository or any GitHub repository:
```bash
# Document local repository
cursor-tools doc "Generate documentation"

# Document remote GitHub repository
cursor-tools doc "Generate documentation" --fromGithub=username/repo-name
cursor-tools doc "Generate documentation" --fromGithub=username/repo-name@branch  # Specify branch
cursor-tools doc "Generate documentation" --fromGithub=https://github.com/username/repo-name@branch  # HTTPS URL format

# Save documentation to file
cursor-tools doc "Generate documentation" --output=docs/README.md
```

### Command Options
All commands support additional flags:
- `--model`: Specify an alternative model
- `--maxTokens`: Control response length
- `--help`: View all available options

Documentation command also supports:
- `--fromGithub`: Generate documentation for a remote GitHub repository (supports @branch syntax)
- `--output`: Save documentation to a file

### Execution Methods
Execute commands in several ways:
```bash
# Global installation
cursor-tools web "query"

# without global installation
npx cursor-tools web "query"
```

## Cursor Integration
`cursor-tools` automatically configures Cursor by updating your `.cursorrules` file during installation. This provides:
- Command suggestions
- Usage examples
- Context-aware assistance

### Cursor Agent configuration:

To get the benefits of cursor-tools you should use Cursor agent in "yolo mode". Ideal settings:

![image](https://github.com/user-attachments/assets/783e26cf-c339-4cae-9629-857da0359cef)

## Troubleshooting

### Common Issues

1. **Command Not Found**
   - Ensure `cursor-tools` is installed (globally or as a dev dependency)
   - Check your PATH if installed globally

2. **API Key Errors**
   - Verify `.cursor-tools.env` exists and contains valid API keys
   - Run `cursor-tools install` to reconfigure API keys

3. **Model Errors**
   - Check your internet connection
   - Verify API key permissions
   - Ensure the specified model is available for your API tier

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.