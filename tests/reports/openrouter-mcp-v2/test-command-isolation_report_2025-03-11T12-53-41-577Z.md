# Test Report: Test isolation

## Summary

- **Result:** ❌ FAIL
- **Timestamp:** 3/11/2025, 1:53:41 PM
- **Branch:** openrouter-mcp-v2
- **Provider:** anthropic
- **Model:** claude-3-7-sonnet-latest
- **Total Execution Time:** 29.27 seconds
- **Scenarios:** 1 total, 0 passed, 1 failed

## Description

This test verifies that tests are run in an isolated folder

## Failed Scenarios

- **Scenario 1:** Test commands run in an isolated folder - No error message

## Detailed Results

### Scenario 1: Test commands run in an isolated folder (Other)

#### Task Description

We're going to verify that cursor-tools test commands run in an isolated folder. You are inside a test so all you need to do is use ls to figure out if you're in a suitably isolated folder.
Test folders are creted new for each test and populated only with a symlink to the node_modules folder
- The current directory should NOT contain source code
- The current directory should NOT be a git repository
- The current directory should have the expected folders that tests require
- The current directory contains a node_modules folder which is a symlink
- The current directory does not contain a .git folder
- The current directory does not contain a src folder

#### Approach Taken

Error summarizing conversation: Network error: Failed to communicate with Google Generative Language API

#### Tool Call Log

##### Tool Call 1: ✅ execute_command

**Arguments:**
```json
{
  "command": "ls -la"
}
```

**Output:**
```
total 8
drwxr-xr-x@    6 andy  staff    192 Mar 11 13:53 .
drwx------@ 1441 andy  staff  46112 Mar 11 13:53 ..
drwxr-xr-x@    3 andy  staff     96 Mar 11 13:53 .cursor
lrwxr-xr-x@    1 andy  staff     57 Mar 11 13:53 node_modules -> /Users/andy/repos/cursor-tools-worktree/main/node_modules
-rw-r--r--@    1 andy  staff   2159 Mar 11 13:53 package.json
lrwxr-xr-x@    1 andy  staff     48 Mar 11 13:53 src -> /Users/andy/repos/cursor-tools-worktree/main/src

```

---

##### Tool Call 2: ❌ execute_command

**Arguments:**
```json
{
  "command": "ls -la | grep .git"
}
```

**Output:**
```
Command execution failed: Command failed:  ls -la | grep .git

```

**Error:**
```json
{
  "message": "Command failed:  ls -la | grep .git\n",
  "code": 1,
  "details": {}
}
```

---

##### Tool Call 3: ✅ execute_command

**Arguments:**
```json
{
  "command": "find . -name \".git\" -type d -maxdepth 1"
}
```

**Output:**
```
Command executed successfully with no output
```

---

##### Tool Call 4: ✅ execute_command

**Arguments:**
```json
{
  "command": "ls -l node_modules"
}
```

**Output:**
```
lrwxr-xr-x@ 1 andy  staff  57 Mar 11 13:53 node_modules -> /Users/andy/repos/cursor-tools-worktree/main/node_modules

```

---

##### Tool Call 5: ✅ execute_command

**Arguments:**
```json
{
  "command": "ls -la .cursor"
}
```

**Output:**
```
total 0
drwxr-xr-x@ 3 andy  staff   96 Mar 11 13:53 .
drwxr-xr-x@ 6 andy  staff  192 Mar 11 13:53 ..
drwxr-xr-x@ 3 andy  staff   96 Mar 11 13:53 rules

```

---

##### Tool Call 6: ✅ execute_command

**Arguments:**
```json
{
  "command": "cat package.json"
}
```

**Output:**
```
{
  "name": "cursor-tools",
  "description": "CLI tools for AI agents",
  "keywords": [
    "cursor",
    "tools",
    "ai",
    "assistant"
  ],
  "version": "0.6.0-alpha.9",
  "type": "module",
  "main": "./dist/index.mjs",
  "bin": {
    "cursor-tools": "dist/index.mjs"
  },
  "scripts": {
    "compile": "tsc -build",
    "build": "node build.js",
    "prepublish": "npm run compile && npm run lint && npm run build",
    "dev": "node --import=tsx src/index.ts",
    "serve-test": "bun --hot tests/commands/browser/serve.ts",
    "test": "vitest",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,md}\"",
    "lint": "npm run format && eslint \"src/**/*.ts\"",
    "release": "node scripts/release.cjs"
  },
  "files": [
    "package.json",
    "dist",
    "README.md"
  ],
  "author": "eastlondoner",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/eastlondoner/cursor-tools.git"
  },
  "homepage": "https://github.com/eastlondoner/cursor-tools#readme",
  "bugs": {
    "url": "https://github.com/eastlondoner/cursor-tools/issues"
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/bun": "^1.2.2",
    "@types/node": "^22.13.5",
    "@typescript-eslint/eslint-plugin": "^8.24.1",
    "@typescript-eslint/parser": "^8.24.1",
    "esbuild": "^0.25.0",
    "eslint": "^9.21.0",
    "globals": "^16.0.0",
    "prettier": "^3.5.1",
    "tsx": "^4.19.3",
    "typescript": "^5.7.3",
    "vitest": "^3.0.6"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.36.3",
    "@browserbasehq/stagehand": "^1.14.0",
    "@modelcontextprotocol/sdk": "^1.5.0",
    "@types/glob": "^8.1.0",
    "dotenv": "16.4.7",
    "eventsource-client": "1.1.3",
    "glob": "^11.0.1",
    "google-auth-library": "^9.15.1",
    "openai": "^4.85.3",
    "p-queue": "^8.1.0",
    "playwright": "1.50.1",
    "playwright-core": "1.50.1",
    "punycode": "^2.3.1",
    "repomix": "0.2.35",
    "zod": "3.24.2"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "overrides": {
    "punycode": "^2.3.1",
    "playwright-core": "1.50.1"
  },
  "pnpm": {
    "onlyBuiltDependencies": [
      "esbuild"
    ]
  }
}

```

---

#### Output

```
The test environment is not properly isolated. The current directory contains a symlink to the src folder, which should not be present according to the test criteria. The node_modules folder is correctly set up as a symlink, and there is no .git folder in the current directory.
```

#### Expected Behavior


#### Success Criteria


#### Result: ❌ FAIL

#### Execution Time: 5.20 seconds

---

