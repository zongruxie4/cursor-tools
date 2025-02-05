import type { Command, CommandGenerator, CommandOptions } from '../types.ts';
import type { Config } from '../config.ts';
import { loadConfig, loadEnv } from '../config.ts';
import { readFileSync, writeFileSync } from 'node:fs';
import { pack } from 'repomix';

interface DocCommandOptions extends CommandOptions {
  output?: string; // Optional output file path
  fromGithub?: string; // GitHub URL or username/reponame
}

export class DocCommand implements Command {
  private config: Config;

  constructor() {
    loadEnv();
    this.config = loadConfig();
  }

  private parseGithubUrl(url: string): { username: string; reponame: string; branch?: string } {
    // Handle full HTTPS URL format
    if (url.startsWith('https://github.com/')) {
      const parts = url.replace('https://github.com/', '').split('/');
      const [username, repoWithBranch] = parts;
      const [reponame, branch] = repoWithBranch.split('@');
      return { username, reponame, branch };
    }

    // Handle username/reponame@branch format
    const [repoPath, branch] = url.split('@');
    const parts = repoPath.split('/');
    if (parts.length !== 2) {
      throw new Error(
        'Invalid GitHub repository format. Use either https://github.com/username/reponame[@branch] or username/reponame[@branch]'
      );
    }

    return { username: parts[0], reponame: parts[1], branch };
  }

  private async getGithubRepoContext(githubUrl: string): Promise<string> {
    const { username, reponame, branch } = this.parseGithubUrl(githubUrl);
    const repoIdentifier = `${username}/${reponame}`;

    console.log('Fetching GitHub repository:', repoIdentifier, branch ? `(branch: ${branch})` : '');
    const response = await fetch('https://api.repomix.com/api/pack', {
      headers: {
        'content-type': 'application/json',
        Referer: 'https://repomix.com/',
      },
      body: JSON.stringify({
        url: repoIdentifier,
        ref: branch,
        format: 'xml',
        options: {
          removeComments: false,
          removeEmptyLines: true,
          showLineNumbers: false,
          fileSummary: true,
          directoryStructure: true,
          outputParsable: false,
        },
        signal: {},
      }),
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch GitHub repository context: ${response.statusText}\n${errorText}`
      );
    }

    return await response.text();
  }

  private async fetchGeminiDocResponse(
    repoContext: string,
    options?: DocCommandOptions
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Define a prompt for Gemini to generate documentation
    let query = `
Focus on:
1. Repository purpose and "what is it" summary
2. Quick start: How to install and use the basic core features of the project
4. Configuration options and how to configure the project for use (if applicable)
3. If a repository has multiple public packages perform all the following steps for every package:
4. package summary & how to install / import it 
5. Detailed documentation of every public feature / API / interface
6. Dependencies and requirements
7. Advanced usage examples`;

    // Add hint if provided
    if (options?.hint) {
      query += `\n\nAdditional guidance:\n${options.hint}`;
    }

    const model = options?.model || this.config.gemini.model;
    console.log('Using Gemini model:', model);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: 'You are a helpful assistant that generates public user-facing documentation for a given repository. You will be given a repository context and possibly a query to create docs for a specific part or function, if this is not provided generate docs for all public interfaces and features. Generate a comprehensive documentation with all necessary information BUT stick to short simple sentences and avoid being wordy, verbose or making a sales-pitch, stick to factual statements and be concise. Format the documentation in markdown unless otherwise specified.',
              },
            ],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: repoContext }, { text: query }],
            },
          ],
          generationConfig: {
            maxOutputTokens: options?.maxTokens || this.config.gemini.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Gemini API error: ${JSON.stringify(data.error, null, 2)}`);
    }

    return data.candidates[0].content.parts[0].text;
  }

  async *execute(query: string, options?: DocCommandOptions): CommandGenerator {
    try {
      yield 'Generating repository documentation...\n';
      console.log('Options:', options); // Debug log

      let repoContext: string;

      if (options?.fromGithub) {
        yield `Fetching repository context for ${options.fromGithub}...\n`;
        repoContext = await this.getGithubRepoContext(options.fromGithub);
      } else {
        yield 'Packing local repository using repomix...\n';
        await pack(process.cwd(), {
          output: {
            filePath: '.repomix-doc-temp.txt',
            style: 'xml',
            fileSummary: true,
            directoryStructure: true,
            removeComments: false,
            removeEmptyLines: true,
            topFilesLength: 20,
            showLineNumbers: false,
            copyToClipboard: false,
            includeEmptyDirectories: true,
            parsableStyle: true,
          },
          include: ['**/*'],
          ignore: {
            useGitignore: true,
            useDefaultPatterns: true,
            customPatterns: [
              '**/*.pbxproj',
              '**/node_modules/**',
              '**/dist/**',
              '**/build/**',
              '**/compile/**',
              '**/.*/**',
            ],
          },
          security: {
            enableSecurityCheck: true,
          },
          tokenCount: {
            encoding: 'cl100k_base',
          },
          cwd: process.cwd(),
        });

        repoContext = readFileSync('.repomix-doc-temp.txt', 'utf-8');
      }

      yield 'Generating documentation using Gemini AI...\n';
      const documentation = await this.fetchGeminiDocResponse(repoContext, options);

      // Save to file if output option is provided
      if (options?.output) {
        writeFileSync(options.output, documentation);
        yield `Documentation saved to ${options.output}\n`;
      } else {
        yield '\n--- Repository Documentation ---\n\n';
        yield documentation;
        yield '\n\n--- End of Documentation ---\n';
      }

      yield 'Documentation generation completed!\n';
    } catch (error) {
      if (error instanceof Error) {
        yield `Error: ${error.message}`;
      } else {
        yield 'An unknown error occurred';
      }
    }
  }
}
