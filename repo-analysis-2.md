Packing repository using Repomix...
Analyzing repository using gemini-2.0-flash-thinking-exp...
```markdown
## Repository Architecture Overview: cursor-tools

The `cursor-tools` repository is structured as a modular CLI application, designed with extensibility and maintainability in mind. Its architecture revolves around providing AI agents with a set of commands that encapsulate various functionalities, leveraging different AI providers and external tools.

**Overall Structure:**

The repository is primarily organized into the following directories:

- **`docs/`**: Contains documentation files, including `TESTING.md` (testing guidelines) and general project documentation (`docs.md`).
- **`scripts/`**: Holds scripts for development and release processes, such as `release.cjs` and `verify-stagehand.cjs`.
- **`src/`**:  The main source code directory, containing all the logic for `cursor-tools`.
- **`tests/`**:  Contains test-related files, including feature behavior tests, assets for tests, and a test server for browser commands.

**Key Subdirectories within `src/commands/`:**

- **`browser/`**:  Implements browser automation commands using Stagehand. Key components include:
    -   `stagehand/`: Contains Stagehand integration logic, including `act.ts`, `extract.ts`, `observe.ts`, and `stagehandScript.ts`.
    -   `browserCommand.ts`:  The main command handler for browser-related actions.
    -   `open.ts`, `element.ts`: Subcommands for browser operations.
    -   `utils.ts`, `utilsShared.ts`: Utility functions specific to browser commands.
- **`clickup/`**: Implements ClickUp integration commands, mainly for task management. Key files are `task.ts` and `clickupAuth.ts`.
- **`github/`**: Implements GitHub integration commands for accessing issues and pull requests. Key files include `issue.ts`, `pr.ts`, and `githubAuth.ts`.
- **`mcp/`**: Implements commands for interacting with Model Context Protocol (MCP) servers. Key components are:
    -   `client/`: Contains the MCP client implementation (`MCPClient.ts`) and error handling (`errors.ts`).
    -   `marketplace.ts`: Manages MCP Marketplace interactions.
    -   `mcp.ts`, `run.ts`, `search.ts`: Subcommands for MCP functionality.
-   **`test/`**:  Implements the test command and testing framework. Key files include:
    -   `tools/`: Contains tools for command execution within tests.
    -   `command.ts`: The main test command implementation.
    -   `executor.ts`: Handles test scenario execution logic.
    -   `parser.ts`: Parses feature behavior files.
    -   `reporting.ts`: Generates test reports.
-   **`xcode/`**: Implements Xcode-related commands for building, running, and linting iOS/macOS projects. Key files are `build.ts`, `run.ts`, `lint.ts`, and `xcode.ts`.
-   **Top-level commands in `src/commands/`**:
    -   `ask.ts`: Implements the `ask` command for direct model queries.
    -   `clickup.ts`: Implements the `clickup` command.
    -   `doc.ts`: Implements the `doc` command for documentation generation.
    -   `github.ts`: Implements the `github` command.
    -   `index.ts`: Exports all commands for the CLI.
    -   `install.ts`: Implements the `install` command for setup and configuration.
    -   `plan.ts`: Implements the `plan` command for implementation planning.
    -   `repo.ts`: Implements the `repo` command for repository analysis.
    -   `web.ts`: Implements the `web` command for web search.

**Other Important Files:**

*   **`src/index.ts`**: The main entry point for the `cursor-tools` CLI application.
*   **`src/config.ts`**: Handles configuration loading and default settings.
*   **`src/cursorrules.ts`**: Manages Cursor project rules integration and template.
*   **`src/types.ts`**: Defines shared TypeScript types and interfaces.
*   **`src/providers/`**: Contains base classes and implementations for different AI providers (Gemini, OpenAI, Perplexity, Anthropic, ModelBox, OpenRouter).
*   **`src/utils/`**: Includes utility functions for tasks like output handling, message chunking, string similarity, and tool-enabled LLM client.
*   **`README.md`**: Provides a high-level overview of the project and usage instructions.
*   **`cursor-tools.config.json`**: Example configuration file.
*   **`package.json`**: Defines project dependencies and scripts.
*   **`tsconfig.json`**: TypeScript configuration file.

**In summary, the repository is structured to create a modular and extensible CLI tool with a focus on AI-powered commands for various development and research tasks. The main components are the command implementations within `src/commands/`, the provider integrations in `src/providers/`, and the testing framework in `src/commands/test/`.**
```