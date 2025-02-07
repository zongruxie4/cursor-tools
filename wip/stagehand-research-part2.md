Querying Perplexity AI using sonar-pro for: For implementing Stagehand in a CLI tool like cursor-tools: 1. What are the best practices for managing browser sessions and cleanup in a CLI context? 2. How should we handle authentication and cookies persistence between commands? 3. What are the recommended approaches for timeout and retry strategies with Stagehand? 4. How can we optimize performance when using Stagehand's AI capabilities in a CLI tool? 5. What are common pitfalls to avoid when implementing browser automation in a CLI context?
Here are concise answers to the questions about implementing Stagehand in a CLI tool:

1. Browser session management best practices:
- Use a headless browser mode for CLI contexts
- Implement proper cleanup after each command execution
- Utilize Stagehand's built-in session management capabilities
- Store session data in a temporary directory that gets cleared on exit

2. Authentication and cookie persistence:
- Use Stagehand's persistence APIs to save and load session data between commands
- Store encrypted credentials securely (e.g. in system keychain)
- Implement token-based auth with refresh logic rather than storing raw credentials
- Use Stagehand's cookie management to persist login state

3. Timeout and retry strategies:
- Implement exponential backoff with jitter for retries[7]
- Set reasonable timeouts based on expected operation duration
- Use Stagehand's built-in retry mechanisms where available
- Implement circuit breaker pattern for failing external services

4. Optimizing AI performance:
- Cache AI responses when possible to reduce API calls
- Use streaming responses for long-running AI tasks
- Implement request batching for multiple AI queries
- Leverage Stagehand's built-in caching and optimization features

5. Common pitfalls to avoid:
- Not handling network errors and timeouts gracefully
- Leaking browser resources by not closing sessions
- Hardcoding credentials or sensitive data
- Not implementing proper error handling and logging
- Overusing browser automation for tasks that can be done via APIs