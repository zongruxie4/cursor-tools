Packing repository using repomix...
Querying Gemini AI using gemini-2.0-flash-thinking-exp...
This repository is `cursor-tools`, a CLI tool designed to enhance the capabilities of AI agents. It uses `pnpm` for package management and script running.

The core idea is to provide AI agents with "teammates" (like Gemini and Perplexity for web search, planning, and repo analysis) and "skills" (like browser automation, GitHub interaction, Xcode management, ClickUp task management, and testing).

Key aspects of the repository include:

- **Building a CLI tool for AI agents**: The primary goal is to create a versatile command-line tool that AI agents can use to perform various tasks.
- **AI "Teammates" and "Skills"**: Commands are categorized as either AI assistants (teammates) or task execution tools (skills).
- **Focus on CLI Commands**: Everything is implemented as CLI commands that must return a result and cannot be long-running processes.
- **Manual Testing**: The repository relies on manual testing instead of automated unit or integration tests.
- **Logging and Outputs**: Standardized logging and output methods are used, including `console.log`, `console.error`, and `yield` for streaming output.
- **Browser Command Testing**:  A dedicated test server and test files are provided for developing and testing browser commands.
- **Comprehensive Documentation**: The `cursor-tools.mdc` file itself serves as a merged representation of the entire codebase, intended for AI consumption and analysis.

In essence, this repository is building a toolkit that empowers AI agents by providing them with a set of commands to interact with various services and perform complex tasks, particularly within a development context.