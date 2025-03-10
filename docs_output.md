
--- Repository Documentation ---

```markdown
## Repository Documentation: cursor-tools

### 1. Repository Purpose and "What is it" Summary

**Repository Purpose:**

This repository contains the source code for `cursor-tools`, a versatile command-line interface (CLI) tool designed to enhance the capabilities of AI agents, particularly within the Cursor editor. `cursor-tools` empowers AI agents by providing them with a rich set of commands, effectively acting as an "AI team" with specialized skills and access to various AI models and external services.

**What is it?**

`cursor-tools` is a CLI tool that extends the functionality of AI agents by providing access to:

- **AI Provider Integration**: Seamlessly integrates with multiple AI providers like Perplexity, Gemini, OpenAI, Anthropic, ModelBox and OpenRouter, enabling access to a wide range of AI models.
- **Specialized Commands**: Offers a suite of commands tailored for various tasks:
    - **`ask`**: For direct queries to any AI model.
    - **`repo`**: For context-aware repository analysis using Google Gemini.
    - **`plan`**: For generating implementation plans using AI.
    - **`doc`**: For generating repository documentation.
    - **`web`**: For web search and information retrieval using Perplexity AI.
    - **`github`**: For interacting with GitHub issues and pull requests.
    - **`browser`**: For automating web browser interactions using Stagehand.
    - **`mcp`**: For interacting with Model Context Protocol (MCP) servers and tools.
    - **`xcode`**: For Xcode project build, run, and lint operations.
    - **`clickup`**: For interacting with ClickUp tasks.
    - **`test`**: For feature behavior testing using AI agents.

### 2. Quick Start: Installation and Basic Usage

**Installation:**

To install `cursor-tools` globally, run:

```bash
npm install -g cursor-tools
```

After installation, configure the tool with:

```bash
cursor-tools install .
```

This command interactively sets up API keys and configures Cursor integration.

**Basic Usage:**

To use the core features, you can leverage the following commands:

- **Web Search (Perplexity):**
  ```bash
  cursor-tools web "Search query here"
  ```
  or using the nickname for web search
  ```bash
  Perplexity "Search query here"
  ```

- **Repository Analysis (Gemini):**
  ```bash
  cursor-tools repo "Ask a question about the repository"
  ```
  or using the nickname for repo search
  ```bash
  Gemini "Ask a question about the repository"
  ```

- **Implementation Planning (OpenAI for thinking, Gemini for files):**
  ```bash
  cursor-tools plan "Describe feature to implement"
  ```

For more detailed usage instructions, refer to the documentation for each specific command.

### 3. Configuration Options

`cursor-tools` can be configured via:

- **Environment Variables**: API keys and core settings are managed through environment variables. Create a `.cursor-tools.env` file in your project or `~/.cursor-tools/.env` in your home directory to set these variables.
- **Configuration File**:  A `cursor-tools.config.json` file in your project root or `~/.cursor-tools/config.json` in your home directory allows customization of provider settings, model preferences, and command options.

Refer to `CONFIGURATION.md` for a detailed breakdown of all configurable options and their usage.

### 4. Package Documentation

This repository consists of multiple packages, each located under the `src/commands` directory. Below is the documentation for each package:

#### 4.1. `ask` Package

**Summary:**

The `ask` package provides the `ask` command, enabling direct queries to various AI models across different providers. This command is ideal for simple, direct questions where specific model selection is desired without repository context.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.

**Public Features/API:**

- **`cursor-tools ask "<query>" --provider <provider> --model <model> [options]`**:
  - Executes a direct query to the specified AI model and provider.
  - `<query>`: The question to ask the AI model.
  - `--provider <provider>`: Specifies the AI provider to use (e.g., `openai`, `anthropic`, `gemini`, `perplexity`, `modelbox`, `openrouter`).
  - `--model <model>`: Specifies the AI model to use from the chosen provider (e.g., `gpt-4o`, `claude-3-sonnet-latest`, `gemini-2.0-flash-thinking-exp`).
  - **Options**:
    - `--max-tokens <number>`: Limits the maximum number of tokens in the response.
    - `--debug`: Enables debug mode for detailed output.

**Dependencies and Requirements:**

- Requires API keys for the specified AI provider to be configured in `.cursor-tools.env`.

**Advanced Usage Examples:**

- Compare responses from different models:
  ```bash
  cursor-tools ask "What is the capital of Spain?" --provider openai --model gpt-4o
  cursor-tools ask "What is the capital of Spain?" --provider gemini --model gemini-2.0-pro-exp
  ```
- Query a specific model for code-related questions:
  ```bash
  cursor-tools ask "Explain the concept of decorators in Python" --provider anthropic --model claude-3-7-sonnet-latest
  ```

#### 4.2. `browser` Package

**Summary:**

The `browser` package offers browser automation capabilities through the `browser` command and its subcommands. It leverages Stagehand AI for natural language web interaction, enabling tasks like web testing, data extraction, and debugging.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.
**Peer Dependency**: Requires manual installation of Playwright: `npm install playwright`

**Public Features/API:**

- **`cursor-tools browser open <url> [options]`**: Opens a URL in a browser instance and captures page information.
  - `<url>`: The URL to open.
  - **Options**:
    - `--html`: Captures page HTML content.
    - `--console`: Captures browser console logs.
    - `--network`: Captures network activity.
    - `--screenshot <file path>`: Saves a screenshot of the page.
    - `--timeout <milliseconds>`: Sets navigation timeout.
    - `--viewport <width>x<height>`: Sets viewport size.
    - `--headless`: Runs browser in headless mode.
    - `--no-headless`: Shows browser UI (non-headless mode).
    - `--connect-to <port>`: Connects to an existing Chrome instance.
    - `--wait <duration or selector>`: Waits after page load.
    - `--video <directory>`: Records a video of the browser session.
    - `--evaluate <string>`: Evaluates JavaScript code in the browser before command execution.

- **`cursor-tools browser act "<instruction>" --url=<url | 'current'> [options]`**: Executes actions on a webpage using natural language instructions.
  - `<instruction>`: Natural language instruction for actions (e.g., "Click Login", "Type 'hello' in search box").
  - `--url <url>`: URL to navigate to or `'current'` to use the existing page.
  - **Options**: Shared browser command options.

- **`cursor-tools browser observe "<instruction>" --url=<url> [options]`**: Observes interactive elements on a webpage and suggests actions.
  - `<instruction>`: Natural language instruction for observation (e.g., "interactive elements", "login form").
  - `--url <url>`: URL to navigate to.
  - **Options**: Shared browser command options.

- **`cursor-tools browser extract "<instruction>" --url=<url> [options]`**: Extracts data from a webpage based on natural language instructions.
  - `<instruction>`: Natural language instruction for data extraction (e.g., "product names", "article content").
  - `--url <url>`: URL to navigate to.
  - **Options**: Shared browser command options.

**Dependencies and Requirements:**

- **Peer Dependency**: Playwright (`npm install playwright`)
- API key for either OpenAI or Anthropic, configured in `.cursor-tools.env`.

**Advanced Usage Examples:**

- Perform a multi-step action and record video:
  ```bash
  cursor-tools browser act "Go to login page | Fill username and password | Click Submit" --url="https://example.com/login" --video="./recordings"
  ```
- Extract product names and descriptions from a webpage and save as JSON:
  ```bash
  cursor-tools browser extract "product names and descriptions" --url="https://example.com/products" --save-to="products.json"
  ```
- Observe interactive elements on current page (using `--connect-to current`):
  ```bash
  cursor-tools browser observe "interactive elements" --url=current --connect-to=9222
  ```

#### 4.3. `clickup` Package

**Summary:**

The `clickup` package provides integration with ClickUp, a project management platform, through the `clickup` command. Currently, it supports retrieving detailed information about ClickUp tasks.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.

**Public Features/API:**

- **`cursor-tools clickup task <task_id>`**: Retrieves and displays detailed information about a ClickUp task.
  - `<task_id>`: The ID of the ClickUp task to retrieve.

**Dependencies and Requirements:**

- ClickUp API token configured in `.cursor-tools.env` as `CLICKUP_API_TOKEN`.

**Advanced Usage Examples:**

- Retrieve and display all comments for a specific ClickUp task:
  ```bash
  cursor-tools clickup task "your_task_id"
  ```

#### 4.4. `github` Package

**Summary:**

The `github` package enables interaction with GitHub repositories through the `github` command and its subcommands (`pr` and `issue`). It allows retrieval of information about pull requests and issues, enhancing workflow automation and repository insights.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.

**Public Features/API:**

- **`cursor-tools github pr [number]`**: Retrieves pull request information.
  - `[number]` (optional): If provided, retrieves details for a specific PR number. If omitted, lists recent PRs.
  - **Options**:
    - `--from-github <GitHub username>/<repository name>[@<branch>]`: Specifies a remote GitHub repository in the format "owner/repo" or "owner/repo@branch".

- **`cursor-tools github issue [number]`**: Retrieves issue information.
  - `[number]` (optional): If provided, retrieves details for a specific issue number. If omitted, lists recent issues.
  - **Options**:
    - `--from-github <GitHub username>/<repository name>[@<branch>]`: Specifies a remote GitHub repository.

**Dependencies and Requirements:**

- GitHub authentication, which can be configured via:
    - `GITHUB_TOKEN` environment variable in `.cursor-tools.env`.
    - GitHub CLI (`gh`) installation and login.
    - Git credentials configured for github.com.

**Advanced Usage Examples:**

- List recent pull requests from a specific repository:
  ```bash
  cursor-tools github pr --from-github=facebook/react
  ```
- View detailed information for a specific issue with comments:
  ```bash
  cursor-tools github issue 123 --from-github=microsoft/typescript
  ```

#### 4.5. `mcp` Package

**Summary:**

The `mcp` package provides integration with Model Context Protocol (MCP) servers via the `mcp` command and its subcommands (`search` and `run`). This enables interaction with specialized tools and servers in the MCP Marketplace.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.

**Public Features/API:**

- **`cursor-tools mcp search "<query>"`**: Searches the MCP Marketplace for servers matching the query.
  - `<query>`: Search query to find MCP servers.

- **`cursor-tools mcp run "<query>"`**: Executes tools from MCP servers based on natural language queries.
  - `<query>`: Natural language query describing the tool and its arguments. Should include sufficient context to identify the server and tool.

**Dependencies and Requirements:**

- Anthropic API key configured as `ANTHROPIC_API_KEY` in `.cursor-tools.env`.

**Advanced Usage Examples:**

- Search for servers related to Git repository management:
  ```bash
  cursor-tools mcp search "git repository management"
  ```
- Run a tool to list files in the current directory using a specific MCP server (replace `mcp-server-sqlite` with actual server name):
  ```bash
  cursor-tools mcp run "using the mcp-server-sqlite list files in directory"
  ```

#### 4.6. `plan` Package

**Summary:**

The `plan` package offers implementation planning capabilities through the `plan` command. It leverages AI to generate step-by-step plans for software development tasks, utilizing repository context for informed suggestions.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.

**Public Features/API:**

- **`cursor-tools plan "<query>" [options]`**: Generates an implementation plan for a given query.
  - `<query>`: Natural language query describing the implementation task (e.g., "Add user authentication").
  - **Options**:
    - `--fileProvider <provider>`: Provider for file identification (default: gemini).
    - `--thinkingProvider <provider>`: Provider for plan generation (default: openai).
    - `--fileModel <model>`: Model for file identification.
    - `--thinkingModel <model>`: Model for plan generation.
    - `--debug`: Enables debug mode.

**Dependencies and Requirements:**

- API keys for the configured `fileProvider` (default: Gemini API key) and `thinkingProvider` (default: OpenAI API key) in `.cursor-tools.env`.

**Advanced Usage Examples:**

- Generate a plan for adding user authentication, using specific providers and models:
  ```bash
  cursor-tools plan "Add user authentication to the login page" --fileProvider gemini --thinkingProvider openai --thinkingModel gpt-4o
  ```

#### 4.7. `repo` Package

**Summary:**

The `repo` package provides repository analysis capabilities through the `repo` command. It allows users to ask questions about the codebase and receive context-aware answers, leveraging Google Gemini for repository understanding.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.

**Public Features/API:**

- **`cursor-tools repo "<query>" [options]`**: Analyzes the repository and answers questions based on its context.
  - `<query>`: Natural language query about the repository (e.g., "Explain the authentication flow").
  - **Options**:
    - `--provider <provider>`: AI provider to use (default: gemini).
    - `--model <model>`: Model to use for repository analysis.
    - `--max-tokens <number>`: Limits the maximum tokens in the response.
    - `--debug`: Enables debug mode.

**Dependencies and Requirements:**

- Gemini API key configured as `GEMINI_API_KEY` in `.cursor-tools.env`.

**Advanced Usage Examples:**

- Explain the architecture of the repository using a specific model:
  ```bash
  cursor-tools repo "Explain the architecture of this repository" --provider gemini --model gemini-2.0-pro-exp
  ```
- Review recent changes to error handling and suggest improvements:
  ```bash
  cursor-tools repo "Review recent changes to command error handling looking for mistakes, omissions and improvements"
  ```

#### 4.8. `test` Package

**Summary:**

The `test` package introduces a testing framework within `cursor-tools` to enable feature behavior testing using AI agents. It allows for automated testing of cursor-tools commands and functionalities, generating detailed reports and PASS/FAIL results.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.

**Public Features/API:**

- **`cursor-tools test <feature-behavior-file.md> [options]`**: Executes feature behavior tests defined in a Markdown file.
  - `<feature-behavior-file.md>`: Path to the Markdown file defining test scenarios.
  - **Options**:
    - `--output <directory>`: Directory to store test reports (default: `tests/reports`).
    - `--parallel <number>`: Number of parallel tests to run (default: CPU cores - 1).
    - `--branch <branch-name>`: Branch name to include in report filenames (default: current git branch).
    - `--compare-with <path-to-report>`: Path to a previous report for comparison.
    - `--timeout <seconds>`: Maximum test execution time (default: 300s).
    - `--retries <number>`: Number of retries for failed tests (default: 3).
    - `--tag <tag1,tag2>`: Run only scenarios with specified tags.
    - `--debug`: Enables debug mode for detailed logs.

**Dependencies and Requirements:**

- API key for Anthropic, configured as `ANTHROPIC_API_KEY` in `.cursor-tools.env`.

**Advanced Usage Examples:**

- Run all tests in a feature behavior file:
  ```bash
  cursor-tools test tests/feature-behaviors/ask/ask-command.md
  ```
- Run tests in parallel with a concurrency level of 4:
  ```bash
  cursor-tools test tests/feature-behaviors/ask/ask-command.md --parallel=4
  ```
- Run only scenarios tagged with 'error-handling':
  ```bash
  cursor-tools test tests/feature-behaviors/ask/ask-command.md --tag error-handling
  ```

#### 4.9. `web` Package

**Summary:**

The `web` package provides web search capabilities through the `web` command. It leverages AI models with web access to answer user queries with up-to-date information from the internet.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.

**Public Features/API:**

- **`cursor-tools web "<query>" [options]`**: Performs a web search for the given query.
  - `<query>`: The search query (e.g., "latest AI trends").
  - **Options**:
    - `--provider <provider>`: AI provider to use for web search (default: perplexity).
    - `--model <model>`: Model to use for web search.
    - `--max-tokens <number>`: Limits the maximum tokens in the response.
    - `--debug`: Enables debug mode.

**Dependencies and Requirements:**

- API key for a web search-capable AI provider (Perplexity or Gemini), configured in `.cursor-tools.env`.

**Advanced Usage Examples:**

- Search for recent news about AI and save the results to a file:
  ```bash
  cursor-tools web "latest AI news" --save-to ai-news.md
  ```
- Use Gemini for web search instead of the default Perplexity:
  ```bash
  cursor-tools web "current weather in London" --provider gemini
  ```

#### 4.10. `xcode` Package

**Summary:**

The `xcode` package provides Xcode development automation through the `xcode` command and its subcommands (`build`, `run`, `lint`). It simplifies common Xcode tasks like building, running on simulators, and code linting.

**Installation and Import:**

This package is part of the main `cursor-tools` CLI and does not require separate installation or import.

**Public Features/API:**

- **`cursor-tools xcode build [buildPath=<path>] [destination=<destination>]`**: Builds an Xcode project and reports errors.
  - **Options**:
    - `--buildPath <path>`: Specifies a custom directory for derived build data (default: `./.build/DerivedData`).
    - `--destination <destination>`: Specifies the destination for building the app (default: `platform=iOS Simulator,name=iPhone 16 Pro`).

- **`cursor-tools xcode run [destination=<destination>]`**: Builds and runs the Xcode project on a simulator.
  - **Options**:
    - `--destination <destination>`: Specifies the destination simulator (default: `platform=iOS Simulator,name=iPhone 16 Pro`).

- **`cursor-tools xcode lint`**: Runs static analysis (linting) on the Xcode project to find and fix issues.

**Dependencies and Requirements:**

- Xcode development environment setup.

**Advanced Usage Examples:**

- Build the Xcode project with a custom build path:
  ```bash
  cursor-tools xcode build buildPath=~/custom_xcode_build
  ```
- Run the app on a specific iPad simulator:
  ```bash
  cursor-tools xcode run destination="platform=iOS Simulator,name=iPad Pro (12.9-inch) (6th generation)"
  ```
- Run linting to analyze and fix code warnings:
  ```bash
  cursor-tools xcode lint
  ```

### 5. Dependencies and Requirements

- Node.js (>= 18.0.0)
- npm or pnpm package manager
- API keys for:
    - Perplexity (for web search)
    - Google Gemini (for repository analysis and documentation)
    - OpenAI or Anthropic (for browser commands)
    - ClickUp (for ClickUp integration)
    - Anthropic (for MCP commands)
- Playwright (peer dependency for browser commands, install separately: `npm install playwright`)
- Xcode development environment (for Xcode commands)
- GitHub CLI (`gh`) (optional, for enhanced GitHub authentication)

### 6. Advanced Usage Examples

- **Comprehensive Documentation Workflow**:
  ```bash
  # Generate documentation for a remote repository and save it locally
  cursor-tools doc --from-github=owner/repo --save-to local-docs/repo-docs.md

  # After reviewing, ask Gemini to refine specific sections of the documentation
  cursor-tools repo "Improve the 'Quick Start' section of the documentation in local-docs/repo-docs.md"

  # Use web search to find best practices for documenting specific code patterns and incorporate them
  cursor-tools web "best practices for documenting javascript classes" --save-to local-research/doc-best-practices.md

  # Finally, regenerate the documentation with the new hints and best practices incorporated
  cursor-tools doc --from-github=owner/repo --save-to local-docs/repo-docs-v2.md --hint="Incorporate best practices from local-research/doc-best-practices.md and focus on user-centric language"
  ```

- **Web Application Debugging and Issue Resolution Workflow**:
  ```bash
  # Open the web application and check for console errors
  cursor-tools browser open "http://localhost:3000" --no-headless --console --network

  # Observe interactive elements on the page to understand the UI structure
  cursor-tools browser observe "interactive elements" --url=current --connect-to=9222

  # Act on the page to reproduce a bug, recording a video for detailed analysis
  cursor-tools browser act "Navigate to user profile | Click 'Edit Profile' | Change email to invalid format | Click Save" --url=current --connect-to=9222 --video="./debug-recordings"

  # If an error is observed, use web search to find solutions
  cursor-tools web "playwright 'element not interactable' error" --save-to local-research/playwright-error.md

  # Based on search results, adjust browser command and retry
  cursor-tools browser act "Click 'Save' button again with adjusted wait times" --url=current --connect-to=9222 --wait="time:2s"
  ```
```

--- End of Documentation ---
