# just-ask

Enhance your Dev Agent / AI powered IDE with *even more AI*

AI-compatible AI-powered web queries and codebase understanding. `just-ask` seamlessly integrates with Cursor (and other agents) to provide intelligent responses using Perplexity AI for web searches and Google Gemini for whole-repository-aware assistance.

just-ask is an npm package that you can install in your project and provides a CLI that your AI agent can use to expand its capabilities.

## Installation

Run the interactive setup:
```bash
npx just-ask install .
```

This command will:
0. Add `just-ask` as a dev dependency in your package.json
1. Guide you through API key configuration
2. Create necessary configuration files
3. Update your `.cursorrules` file for Cursor integration

## Cursor Usage

Use cursor in agent mode with command execution:

### Use web search
"Cursor please implement country specific stripe payment pages for the USA, UK, France and Germany. Use just-ask web to check the available stripe payment methods in each country."

### Use repo search
"Let's refactor our user class to allow multiple email aliases per user. just-ask Gemini for a plan including a list of all files that need to be changed."

## Configuration

### API Keys
`just-ask` requires API keys for both Perplexity AI and Google Gemini. These can be configured in two ways:

1. **Interactive Setup**: Run `just-ask install` and follow the prompts
2. **Manual Setup**: Create `~/.just-ask/.env` in your home directory or `.just-ask.env` in your project root:
   ```env
   PERPLEXITY_API_KEY="your-perplexity-api-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

### Default Settings
Customize `just-ask` behavior by creating a `just-ask.config.json` file:
```json
{
  "perplexity": {
    "model": "llama-3.1-sonar-large-128k-online",
    "maxTokens": 5000
  },
  "gemini": {
    "model": "gemini-2.0-flash-thinking-exp",
    "maxTokens": 10000
  }
}
```

## Core Features

### Web Search
Use Perplexity AI to get up-to-date information directly within Cursor:
```bash
just-ask web "What's new in TypeScript 5.7?"
```

### Repository Context
Leverage Google Gemini for codebase-aware assistance:
```bash
just-ask repo "Explain the authentication flow in this project, which files are involved?"
```

### Command Options
Both commands support additional flags:
- `--model`: Specify an alternative model
- `--max-tokens`: Control response length
- `--help`: View all available options

### Execution Methods
Execute commands in several ways:
```bash
# Global installation
just-ask web "query"

# without global installation
npx just-ask web "query"
```

## Cursor Integration
`just-ask` automatically configures Cursor by updating your `.cursorrules` file during installation. This provides:
- Command suggestions
- Usage examples
- Context-aware assistance

## Troubleshooting

### Common Issues

1. **Command Not Found**
   - Ensure `just-ask` is installed (globally or as a dev dependency)
   - Check your PATH if installed globally

2. **API Key Errors**
   - Verify `.just-ask.env` exists and contains valid API keys
   - Run `just-ask install` to reconfigure API keys

3. **Model Errors**
   - Check your internet connection
   - Verify API key permissions
   - Ensure the specified model is available for your API tier

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details. 
