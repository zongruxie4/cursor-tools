
--- Repository Documentation ---

```markdown
# Cursor-Tools: AI-Powered CLI for Enhanced Agent Capabilities

## 1. Repository Purpose and Summary

Cursor-tools is a versatile command-line interface (CLI) tool designed to empower AI agents with a suite of powerful capabilities. It acts as an "AI team" in your terminal, providing access to various AI models and specialized tools to enhance coding, research, planning, and automation workflows, particularly within the Cursor editor.

**Key Features:**

- **AI Team Integration:**  Harness the power of multiple AI providers like Perplexity, Gemini, OpenAI, and Anthropic as teammates for different tasks.
- **Specialized Skills:** Equip your AI agents with specific skills for web search, repository analysis, documentation generation, GitHub interaction, browser automation, Xcode management, ClickUp task management, and more.
- **Cursor Integration:** Seamlessly integrates with Cursor editor, providing command suggestions and context-aware assistance.
- **Extensible Command Set:** Offers a wide range of commands covering various development and research needs.
- **Configurable and Flexible:** Highly customizable through configuration files and command-line options, allowing users to tailor the tool to their specific requirements.

## 2. Quick Start: Installation and Basic Usage

### Installation

1. **Install Node.js and npm:** Ensure you have Node.js (version 18 or later) and npm installed on your system.
2. **Install cursor-tools globally:** Open your terminal and run:

   ```bash
   npm install -g cursor-tools
   ```

3. **Run interactive setup:** After installation, run the setup command in your project directory:

   ```bash
   cursor-tools install .
   ```

   This command will guide you through API key configuration and set up Cursor integration.

### Basic Usage

To start using `cursor-tools`, open your terminal and run the `cursor-tools` command followed by the desired command and query. For example, to perform a web search:

```bash
cursor-tools web "What is the capital of France?"
```

This will use the default Perplexity AI provider to search the web and provide you with the answer.

## 3. Configuration Options

`cursor-tools` can be configured using a JSON configuration file and environment variables.

### Configuration File (`cursor-tools.config.json`)

Create a `cursor-tools.config.json` file in your project root or `~/.cursor-tools/config.json` in your home directory to customize default settings.

```json
{
  "perplexity": {
    "model": "sonar-pro"
  },
  "gemini": {
    "model": "gemini-2.0-flash-thinking-exp"
  },
  "plan": {
    "fileProvider": "gemini",
    "thinkingProvider": "openai"
  },
  "repo": {
    "provider": "gemini"
  },
  "doc": {
    "provider": "gemini"
  }
}
```

See [CONFIGURATION.md](CONFIGURATION.md) for detailed configuration options.

### Environment Variables (`.cursor-tools.env`)

Create a `.cursor-tools.env` file in your project root or `~/.cursor-tools/.env` in your home directory to store API keys and other environment-specific settings.

```env
PERPLEXITY_API_KEY="your-perplexity-api-key"
GEMINI_API_KEY="your-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GITHUB_TOKEN="your-github-token"
```

See [CONFIGURATION.md](CONFIGURATION.md) for a complete list of environment variables.

## 5. Packages Documentation

This repository provides a single command-line tool, `cursor-tools`, which acts as the main package. It does not have multiple installable packages but is structured internally into modules, each handling a specific command or feature.

### 5.1. `cursor-tools` Package Summary

The `cursor-tools` package is a JavaScript utility library that provides a command-line interface for interacting with various AI models and tools. It offers a range of commands for web search, repository analysis, documentation generation, browser automation, and more, designed to enhance the capabilities of AI agents, especially within the Cursor editor.

**Installation:**

The `cursor-tools` package is installed globally using npm:

```bash
npm install -g cursor-tools
```

**Import:**

As a CLI tool, `cursor-tools` is not imported into other JavaScript code. It is used directly from the command line.

### 5.2. Detailed Documentation of Public Features / API / Interface

`cursor-tools` provides the following top-level commands, each with its own set of options and functionalities:

#### 5.2.1. `ask` Command

**Summary:**

The `ask` command allows users to directly query any configured AI model from the command line. It is designed for simple, direct questions where repository context is not needed.

**Usage:**

```bash
cursor-tools ask "<your question>" --provider <provider> --model <model> [options]
```

**Options:**

- `--provider <provider>`: (Required) Specifies the AI provider to use. Available providers are: `openai`, `anthropic`, `perplexity`, `gemini`, `openrouter`, `modelbox`.
- `--model <model>`: (Required) Specifies the AI model to use from the chosen provider. Model names depend on the provider.
- `--max-tokens <number>`: (Optional) Limits the maximum number of tokens in the response.

**Example:**

```bash
cursor-tools ask "What is the capital of Japan?" --provider openai --model gpt-4o
```

#### 5.2.2. `web` Command

**Summary:**

The `web` command enables web search functionality, allowing users to query the internet for information using AI models that support web access.

**Usage:**

```bash
cursor-tools web "<your question>" [options]
```

**Options:**

- `--provider <provider>`: (Optional) Specifies the AI provider to use for web search. Available providers: `perplexity`, `gemini`, `openrouter`, `modelbox`. If not specified, the default provider is `perplexity`.
- `--model <model>`: (Optional) Specifies the AI model to use for web search. Model names depend on the provider.
- `--max-tokens <number>`: (Optional) Limits the maximum number of tokens in the response.
- `--save-to <file path>`: (Optional) Saves the command output to a file.
- `--quiet`: (Optional) Suppresses output to stdout, only saves to file if `--save-to` is provided.
- `--debug`: (Optional) Enables debug logging for the command.

**Example:**

```bash
cursor-tools web "latest advancements in AI" --provider perplexity
```

#### 5.2.3. `repo` Command

**Summary:**

The `repo` command provides context-aware answers about the current repository using Google Gemini, leveraging its large context window to understand the entire codebase.

**Usage:**

```bash
cursor-tools repo "<your question>" [options]
```

**Options:**

- `--provider <provider>`: (Optional) Specifies the AI provider to use for repository analysis. Available providers: `gemini`, `openai`, `openrouter`, `perplexity`, `modelbox`. Default is `gemini`.
- `--model <model>`: (Optional) Specifies the AI model to use for repository analysis.
- `--max-tokens <number>`: (Optional) Limits the maximum number of tokens in the response.
- `--save-to <file path>`: (Optional) Saves the command output to a file.
- `--quiet`: (Optional) Suppresses output to stdout, only saves to file if `--save-to` is provided.
- `--debug`: (Optional) Enables debug logging for the command.

**Example:**

```bash
cursor-tools repo "Explain the authentication flow in this repository"
```

#### 5.2.4. `plan` Command

**Summary:**

The `plan` command generates implementation plans for software development tasks, utilizing AI to identify relevant files and create step-by-step plans.

**Usage:**

```bash
cursor-tools plan "<query>" [options]
```

**Options:**

- `--fileProvider <provider>`: (Optional) Specifies the AI provider for file identification. Available providers: `gemini`, `openai`, `anthropic`, `perplexity`, `modelbox`, `openrouter`. Default is `gemini`.
- `--thinkingProvider <provider>`: (Optional) Specifies the AI provider for plan generation. Available providers: `openai`, `anthropic`, `perplexity`, `modelbox`, `openrouter`, `gemini`. Default is `openai`.
- `--fileModel <model>`: (Optional) Specifies the AI model for file identification.
- `--thinkingModel <model>`: (Optional) Specifies the AI model for plan generation.
- `--fileMaxTokens <number>`: (Optional) Limits the maximum tokens for file identification.
- `--thinkingMaxTokens <number>`: (Optional) Limits the maximum tokens for plan generation.
- `--save-to <file path>`: (Optional) Saves the command output to a file.
- `--quiet`: (Optional) Suppresses output to stdout, only saves to file if `--save-to` is provided.
- `--debug`: (Optional) Enables debug logging for the command.

**Example:**

```bash
cursor-tools plan "Add user authentication to the login page"
```

#### 5.2.5. `doc` Command

**Summary:**

The `doc` command generates comprehensive documentation for a local repository or a remote GitHub repository.

**Usage:**

```bash
cursor-tools doc [options]
```

**Options:**

- `--from-github <GitHub username>/<repository name>[@<branch>]`: (Optional) Generate documentation for a remote GitHub repository.
- `--provider <provider>`: (Optional) Specifies the AI provider to use for documentation generation. Available providers: `gemini`, `openai`, `openrouter`, `perplexity`, `modelbox`, `anthropic`. Default is `gemini`.
- `--model <model>`: (Optional) Specifies the AI model to use for documentation generation.
- `--max-tokens <number>`: (Optional) Limits the maximum number of tokens in the response.
- `--save-to <file path>`: (Optional) Saves the command output to a file.
- `--quiet`: (Optional) Suppresses output to stdout, only saves to file if `--save-to` is provided.
- `--debug`: (Optional) Enables debug logging for the command.
- `--hint <string>`: (Optional) Provides a hint to the AI for documentation generation, focusing on specific aspects.

**Example:**

```bash
cursor-tools doc --save-to docs.md
cursor-tools doc --from-github=username/repo-name --save-to remote-docs.md
```

#### 5.2.6. `github` Command

**Summary:**

The `github` command provides access to GitHub information, allowing users to list and view pull requests and issues.

**Usage:**

```bash
cursor-tools github <subcommand> [options]
```

**Subcommands:**

- `pr [number]`: Lists recent pull requests or shows details for a specific PR number.
  - `[number]`: (Optional) PR number to view details for. If omitted, lists recent PRs.
- `issue [number]`: Lists recent issues or shows details for a specific issue number.
  - `[number]`: (Optional) Issue number to view details for. If omitted, lists recent issues.

**Options:**

- `--from-github <GitHub username>/<repository name>[@<branch>]`: (Optional) Specifies a remote GitHub repository to access PRs/issues from.
- `--save-to <file path>`: (Optional) Saves the command output to a file.
- `--quiet`: (Optional) Suppresses output to stdout, only saves to file if `--save-to` is provided.
- `--debug`: (Optional) Enables debug logging for the command.

**Example:**

```bash
cursor-tools github pr             # List recent PRs in the current repository
cursor-tools github pr 123         # View details for PR #123
cursor-tools github issue --from-github=facebook/react # List recent issues in react repo
```

#### 5.2.7. `browser` Command

**Summary:**

The `browser` command provides browser automation capabilities, allowing users to interact with web pages programmatically.

**Usage:**

```bash
cursor-tools browser <subcommand> [options]
```

**Subcommands:**

- `open <url> [options]`: Opens a URL in a browser and captures page content, console logs, and network activity.
- `act "<instruction>" --url <url | 'current'> [options]`: Executes actions on a webpage using natural language instructions.
- `observe "<instruction>" --url <url> [options]`: Observes interactive elements on a webpage and suggests possible actions.
- `extract "<instruction>" --url <url> [options]`: Extracts data from a webpage based on natural language instructions.

**Options:**

Shared options for all browser subcommands:

- `--console`: Capture browser console logs (enabled by default, use `--no-console` to disable)
- `--html`: Capture page HTML content (disabled by default)
- `--network`: Capture network activity (enabled by default, use `--no-network` to disable)
- `--screenshot <file path>`: Save a screenshot of the page
- `--timeout <milliseconds>`: Set navigation timeout (default: 120000ms for Stagehand operations, 30000ms for navigation)
- `--viewport <width>x<height>`: Set viewport size (e.g., 1280x720)
- `--headless`: Run browser in headless mode (default: true)
- `--no-headless`: Show browser UI for debugging
- `--connect-to <port>`: Connect to existing Chrome instance. Special values: `current` (use existing page), `reload-current` (refresh existing page)
- `--wait <time:duration or selector:css-selector>`: Wait after page load
- `--video <directory>`: Save a video recording (1280x720 resolution, timestamped subdirectory)
- `--url <url>`: Required for `act`, `observe`, and `extract` commands
- `--evaluate <string>`: JavaScript code to execute in the browser before the main command

**Example:**

```bash
cursor-tools browser open "https://example.com" --html
cursor-tools browser act "Click 'Login' button" --url "https://example.com/login"
cursor-tools browser observe "Find all interactive elements" --url "https://example.com"
cursor-tools browser extract "Get product names" --url "https://example.com/products"
```

#### 5.2.8. `mcp` Command

**Summary:**

The `mcp` command facilitates interaction with Model Context Protocol (MCP) servers, enabling users to search for and run tools from MCP servers.

**Usage:**

```bash
cursor-tools mcp <subcommand> "<query>" [options]
```

**Subcommands:**

- `search "<query>"`: Searches the MCP Marketplace for servers matching the query.
- `run "<query>"`: Executes MCP server tools using natural language queries.

**Options:**

- `--save-to <file path>`: (Optional) Saves the command output to a file.
- `--quiet`: (Optional) Suppresses output to stdout, only saves to file if `--save-to` is provided.
- `--debug`: (Optional) Enables debug logging for the command.

**Example:**

```bash
cursor-tools mcp search "git repository management"
cursor-tools mcp run "using mcp-server-git clone repository https://github.com/example/repo.git"
```

#### 5.2.9. `xcode` Command

**Summary:**

The `xcode` command provides tools for building, running, and linting Xcode projects, simplifying iOS development tasks.

**Usage:**

```bash
cursor-tools xcode <subcommand> [options]
```

**Subcommands:**

- `build [options]`: Builds the Xcode project and reports errors.
- `run [options]`: Builds and runs the Xcode project on a simulator.
- `lint`: Runs static analysis on the Xcode project to find and fix issues.

**Options:**

- `buildPath <path>`: (Optional for `build` subcommand) Specifies a custom directory for derived build data.
- `destination <destination>`: (Optional for `build` and `run` subcommands) Specifies the destination for building or running the app (e.g., 'platform=iOS Simulator,name=iPhone 16 Pro').

**Example:**

```bash
cursor-tools xcode build
cursor-tools xcode run iphone
cursor-tools xcode lint
```

#### 5.2.10. `clickup` Command

**Summary:**

The `clickup` command allows users to interact with ClickUp tasks, providing functionalities to retrieve task details.

**Usage:**

```bash
cursor-tools clickup <subcommand> [options]
```

**Subcommands:**

- `task <task_id>`: Retrieves detailed information about a ClickUp task.

**Options:**

- `--save-to <file path>`: (Optional) Saves the command output to a file.
- `--quiet`: (Optional) Suppresses output to stdout, only saves to file if `--save-to` is provided.
- `--debug`: (Optional) Enables debug logging for the command.

**Example:**

```bash
cursor-tools clickup task "your_task_id"
```

#### 5.2.11. `test` Command

**Summary:**

The `test` command executes feature behavior tests defined in Markdown files, enabling automated testing of cursor-tools functionalities.

**Usage:**

```bash
cursor-tools test <feature-behavior-file.md> [options]
```

**Options:**

- `--output <directory>`: (Optional) Specifies the directory to store test reports. Default is `tests/reports`.
- `--parallel <number>`: (Optional) Specifies the number of parallel tests to run. Default is `CPU cores - 1`.
- `--branch <branch-name>`: (Optional) Specifies the branch name to include in report filenames. Default is the current git branch.
- `--compare-with <path-to-report>`: (Optional) Compares the current test report with a previous report at the specified path.
- `--timeout <seconds>`: (Optional) Specifies the timeout for test execution in seconds. Default is 300 seconds (5 minutes).
- `--retries <number>`: (Optional) Specifies the number of retries for failed tests. Default is 3 retries.
- `--tag <tag1,tag2>`: (Optional) Specifies tags to filter test scenarios to run. Only scenarios with the specified tags will be executed.
- `--save-to <file path>`: (Optional) Saves the command output to a file.
- `--quiet`: (Optional) Suppresses output to stdout, only saves to file if `--save-to` is provided.
- `--debug`: (Optional) Enables debug logging for the command.

**Example:**

```bash
cursor-tools test tests/feature-behaviors/ask/ask-command.md --output tests/reports
```

### 5.3. Dependencies and Requirements

- Node.js (>= 18.0.0)
- npm or pnpm package manager
- API keys for Perplexity, Gemini, OpenAI, and Anthropic (depending on the features used)
- Playwright (peer dependency, install separately for browser commands)

### 5.4. Advanced Usage Examples

#### 5.4.1. Combining Web Search and Repository Analysis

```bash
cursor-tools web "latest research on react server components" --save-to react-research.md
cursor-tools repo "Based on the web search results in react-research.md, plan how to integrate React Server Components into our codebase"
```

This example demonstrates how to use the `web` command to gather information and then pipe that information into the `repo` command to generate a plan based on external research and repository context.

#### 5.4.2. Automated Documentation Generation and GitHub Integration

```bash
cursor-tools doc --from-github=owner/repo --save-to remote-repo-docs.md
cursor-tools github pr --from-github=owner/repo --save-to repo-prs.md
cursor-tools github issue --from-github=owner/repo --save-to repo-issues.md
```

This demonstrates batch documentation and GitHub information gathering, saving reports to separate files for further analysis or integration into documentation systems.

#### 5.4.3. Browser-Based Web Application Testing

```bash
cursor-tools browser open http://localhost:3000 --no-headless --screenshot landing-page.png
cursor-tools browser act "Click 'Login' | Type 'testuser' into username | Type 'password123' into password | Click 'Submit'" --url http://localhost:3000/login --video=./recordings
cursor-tools browser extract "Get error messages" --url current --save-to errors.json
cursor-tools browser observe "Check interactive elements" --url current --save-to interactive-elements.json
```

This example shows a multi-step workflow using browser automation for testing a web application, including opening the page, performing actions, extracting data, and observing page elements.

This comprehensive documentation should enable AI systems to effectively understand and utilize the `cursor-tools` library.
```

--- End of Documentation ---
