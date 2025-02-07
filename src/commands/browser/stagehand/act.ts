import type { Command, CommandGenerator } from '../../../types';
import {
  formatOutput,
  handleBrowserError,
  ActionNotFoundError,
  NavigationError,
} from './stagehandUtils';
import { ConstructorParams, Stagehand } from '@browserbasehq/stagehand';
import { loadConfig } from '../../../config';
import {
  loadStagehandConfig,
  validateStagehandConfig,
  getStagehandApiKey,
  getStagehandModel,
} from './config';
import type { SharedBrowserCommandOptions } from '../browserOptions';
import {
  setupConsoleLogging,
  setupNetworkMonitoring,
  captureScreenshot,
  outputMessages,
} from '../utilsShared';

export class ActCommand implements Command {
  async *execute(query: string, options?: SharedBrowserCommandOptions): CommandGenerator {
    if (!query) {
      yield 'Please provide an instruction and URL. Usage: browser act "<instruction>" --url <url>';
      return;
    }

    const url = options?.url;
    if (!url) {
      yield 'Please provide a URL using the --url option';
      return;
    }

    // Load and validate configuration
    const config = loadConfig();
    const stagehandConfig = loadStagehandConfig(config);
    validateStagehandConfig(stagehandConfig);

    let stagehand: Stagehand | undefined;
    let actionSuccessful = false;
    let consoleMessages: string[] = [];
    let networkMessages: string[] = [];

    try {
      const config = {
        env: 'LOCAL',
        headless: stagehandConfig.headless,
        verbose: stagehandConfig.verbose ? 1 : 0,
        debugDom: stagehandConfig.debugDom,
        modelName: getStagehandModel(stagehandConfig),
        apiKey: getStagehandApiKey(stagehandConfig),
        enableCaching: stagehandConfig.enableCaching,
        logger: (message) => {
          if ((message.level ?? 0) <= config.verbose) {
            console.log('stagehand message', message);
          }
        },
      } satisfies ConstructorParams;
      console.log('using stagehand config', config);
      stagehand = new Stagehand(config);

      // Initialize with timeout
      const initPromise = stagehand.init();
      const initTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Initialization timeout')), 30000)
      );
      await Promise.race([initPromise, initTimeoutPromise]);

      // Setup console and network monitoring
      consoleMessages = await setupConsoleLogging(stagehand.page, options || {});
      networkMessages = await setupNetworkMonitoring(stagehand.page, options || {});

      try {
        // Navigate with timeout
        const gotoPromise = stagehand.page.goto(url);
        const gotoTimeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Navigation timeout')),
            stagehandConfig.timeout ?? 30000
          )
        );
        await Promise.race([gotoPromise, gotoTimeoutPromise]);
      } catch (error) {
        throw new NavigationError(
          `Failed to navigate to ${url}. Please check if the URL is correct and accessible.`,
          error
        );
      }

      const result = await this.performAction(stagehand, query, stagehandConfig.timeout);
      actionSuccessful = true;

      // Take screenshot if requested
      await captureScreenshot(stagehand.page, options || {});

      // Output result and messages
      yield formatOutput(result, options?.debug);
      for (const message of outputMessages(consoleMessages, networkMessages, options || {})) {
        yield message;
      }

      if (options?.screenshot) {
        yield `Screenshot saved to ${options.screenshot}\n`;
      }
    } catch (error) {
      yield handleBrowserError(error, options?.debug);
    } finally {
      try {
        // Clean up with timeout
        await Promise.race([
          stagehand?.close(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Page close timeout')), 5000)
          ),
        ]);
      } catch (error) {
        console.error('Error during cleanup:', error);
      }

      if (!actionSuccessful) {
        process.exit(1);
      }
    }
  }

  private async performAction(
    stagehand: Stagehand,
    instruction: string,
    timeout = 30000
  ): Promise<string> {
    try {
      // Get the current URL before the action
      const startUrl = await stagehand.page.url();

      // Perform action with timeout
      const actionPromise = stagehand.page.act(instruction);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Action timeout')), timeout)
      );

      await Promise.race([actionPromise, timeoutPromise]);

      // Wait for potential navigation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the current URL after the action
      const endUrl = await stagehand.page.url();

      // If the URL changed, consider the action successful
      if (endUrl !== startUrl) {
        return `Successfully performed action: ${instruction} (final url ${endUrl})`;
      }

      return `Successfully performed action: ${instruction}`;
    } catch (error) {
      if (error instanceof Error) {
        throw new ActionNotFoundError(
          `Failed to perform action: ${instruction}. ${error.message}`,
          {
            instruction,
            error,
            availableElements: await stagehand.page.$$eval(
              'a, button, [role="button"], input, select, textarea',
              (elements: Element[]) =>
                elements.map((el) => ({
                  text: el.textContent?.trim(),
                  ariaLabel: el.getAttribute('aria-label'),
                  role: el.getAttribute('role'),
                  tag: el.tagName.toLowerCase(),
                }))
            ),
          }
        );
      }
      throw error;
    }
  }
}
