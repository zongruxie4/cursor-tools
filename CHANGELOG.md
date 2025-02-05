# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2024-03-19

### Added
- New `doc` command to generate comprehensive repository documentation
  - Support for local repository documentation generation
  - Support for remote GitHub repository documentation via `--fromGithub` option
  - Option to save documentation to file with `--output`
- Development mode support via `pnpm dev` for running latest code without building

### Changed
- Updated `.cursorrules` to include documentation for the new `doc` command
- Improved command-line argument parsing for better option handling

## [0.0.14] - Previous Release

Initial release with basic functionality:
- Web search using Perplexity AI
- Repository context-aware answers using Google Gemini
- Installation and configuration utilities 