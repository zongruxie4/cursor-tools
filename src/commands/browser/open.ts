import type { Command, CommandGenerator, CommandOptions } from '../../types';
import { chromium } from 'playwright';
import { loadConfig } from '../../config.ts';
import { ensurePlaywright } from './utils.ts';

interface OpenBrowserOptions extends CommandOptions {
  url?: string;
  console?: boolean;
  html?: boolean;
  screenshot?: string;
  network?: boolean;
  timeout?: number;
  viewport?: string;
  headless?: boolean;
  connectTo?: number;
}

export class OpenCommand implements Command {
  private config = loadConfig();

  async *execute(query: string, options?: OpenBrowserOptions): CommandGenerator {
    try {
      // Check for Playwright availability first
      await ensurePlaywright();

      // Parse options from query if not provided
      if (!options?.url && query) {
        options = { ...options, url: query };
      }

      if (!options?.url) {
        yield 'Please provide a URL to open. Usage: cursor-tools browser open <url> [options]';
        return;
      }

      const browserType = chromium;
      let browser;
      let consoleMessages: string[] = [];
      let networkMessages: string[] = [];

      try {
        if (options.connectTo) {
          yield `Connecting to existing Chrome instance on port ${options.connectTo}...`;
          browser = await browserType.connectOverCDP(`http://localhost:${options.connectTo}`);
        } else {
          yield 'Launching browser...';
          browser = await browserType.launch({
            headless:
              options.headless !== undefined
                ? options.headless
                : (this.config.browser?.headless ?? true),
          });
        }

        const page = await browser.newPage();

        if (options.viewport) {
          const [width, height] = options.viewport.split('x').map(Number);
          if (!isNaN(width) && !isNaN(height)) {
            await page.setViewportSize({ width, height });
          } else {
            yield `Invalid viewport format: ${options.viewport}. Expected format: <width>x<height> (e.g. 1280x720)`;
          }
        } else if (this.config.browser?.defaultViewport) {
          const [width, height] = this.config.browser.defaultViewport.split('x').map(Number);
          if (!isNaN(width) && !isNaN(height)) {
            await page.setViewportSize({ width, height });
          }
        }

        // Set up console and network monitoring before navigation
        if (options.console) {
          page.on('console', (msg) => {
            const type = msg.type();
            const text = msg.text();
            consoleMessages.push(`Browser Console (${type}): ${text}`);
          });
        }

        if (options.network) {
          page.on('request', (request) => {
            networkMessages.push(`Network Request: ${request.method()} ${request.url()}`);
          });
          page.on('response', (response) => {
            networkMessages.push(`Network Response: ${response.status()} ${response.url()}`);
          });
        }

        yield `Navigating to ${options.url}...`;
        await page.goto(options.url, {
          timeout: options.timeout ?? this.config.browser?.timeout ?? 30000,
        });

        // Output console messages if any
        if (consoleMessages.length > 0) {
          yield '\n--- Console Messages ---\n\n';
          for (const msg of consoleMessages) {
            yield msg + '\n';
          }
          yield '--- End of Console Messages ---\n\n';
        }

        // Output network messages if any
        if (networkMessages.length > 0) {
          yield '\n--- Network Activity ---\n\n';
          for (const msg of networkMessages) {
            yield msg + '\n';
          }
          yield '--- End of Network Activity ---\n\n';
        }

        if (options.html) {
          const htmlContent = await page.content();
          yield '\n--- Page HTML Content ---\n\n';
          yield htmlContent;
          yield '\n--- End of HTML Content ---\n';
        }

        if (options.screenshot) {
          yield `Taking screenshot and saving to ${options.screenshot}...`;
          await page.screenshot({ path: options.screenshot, fullPage: true });
          yield 'Screenshot saved.\n';
        }
      } catch (error) {
        yield `Browser command error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      } finally {
        if (browser) {
          await browser.close();
          yield 'Browser closed.\n';
        }
      }
    } catch (error) {
      yield `Playwright check error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}
