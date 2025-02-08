import type { Command, CommandGenerator } from '../../../types';
import { formatOutput, handleBrowserError, ActionError, NavigationError } from './stagehandUtils';
import {
  BrowserResult,
  ConstructorParams,
  InitResult,
  LogLine,
  Stagehand,
} from '@browserbasehq/stagehand';
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
  setupVideoRecording,
} from '../utilsShared';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { BrowserContext, chromium } from 'playwright';
import { overrideStagehandInit } from './initOverride';

const dumbMessages = new Set([
  'clicked element',
  'running / continuing action',
  'looking at chunk',
  'creating chat completion',
  'processing DOM',
  'transformed response',
]);
const boringMessages = new Set([
  'launching local browser',
  'local browser started successfully.',
  'action completed successfully',
  'finished waiting for (possible) page navigation',
]);

export async function getBrowser(
  apiKey: string | undefined,
  projectId: string | undefined,
  env: 'LOCAL' | 'BROWSERBASE' = 'LOCAL',
  options: {
    headless: boolean;
    recordVideo: RecordVideoOptions | undefined;
    viewport: { width: number; height: number };
    connectTo: number | undefined;
  },
  logger: (message: LogLine) => void
): Promise<BrowserResult> {
  logger({
    category: 'init',
    message: 'launching local browser',
    level: 0,
    auxiliary: options as any,
  });

  const tmpDirPath = path.join(os.tmpdir(), 'stagehand');
  if (!fs.existsSync(tmpDirPath)) {
    fs.mkdirSync(tmpDirPath, { recursive: true });
  }

  const tmpDir = fs.mkdtempSync(path.join(tmpDirPath, 'ctx_'));
  fs.mkdirSync(path.join(tmpDir, 'userdir/Default'), { recursive: true });

  const defaultPreferences = {
    plugins: {
      always_open_pdf_externally: true,
    },
  };

  fs.writeFileSync(
    path.join(tmpDir, 'userdir/Default/Preferences'),
    JSON.stringify(defaultPreferences)
  );

  const downloadsPath = path.join(process.cwd(), 'downloads');
  fs.mkdirSync(downloadsPath, { recursive: true });

  let context: BrowserContext;
  if (options.connectTo) {
    const browser = await chromium.connectOverCDP(`http://localhost:${options.connectTo}`);
    logger({
      category: 'init',
      message: 'connected to existing browser',
    });
    
    // Get or create context
    context = (await browser.contexts()[0]) ||
      (await browser.newContext({
        recordVideo: options.recordVideo,
        acceptDownloads: true,
        viewport: options.viewport,
        locale: 'en-US',
        timezoneId: 'America/New_York',
        bypassCSP: true,
        deviceScaleFactor: 1,
      }));

    // Get existing pages
    const pages = await context.pages();
    if (pages.length > 0) {
      logger({
        category: 'init',
        message: 'using existing page',
        level: 1,
        auxiliary: { 
          pageCount: { 
            value: pages.length.toString(), 
            type: 'integer' 
          }
        }
      });
    }

    logger({
      category: 'init',
      message: 'connected to existing browser',
    });
  } else {
    context = await chromium.launchPersistentContext(path.join(tmpDir, 'userdir'), {
      recordVideo: options.recordVideo,
      acceptDownloads: true,
      headless: options.headless,
      viewport: options.viewport,

      locale: 'en-US',
      timezoneId: 'America/New_York',
      deviceScaleFactor: 1,
      args: [
        '--enable-webgl',
        '--use-gl=swiftshader',
        '--enable-accelerated-2d-canvas',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
      ],
      bypassCSP: true,
      timeout: 30_000,
    });

    logger({
      category: 'init',
      message: 'local browser started successfully.',
    });
  }

  await applyStealthScripts(context);

  return { context, contextPath: tmpDir, env: 'LOCAL' };
}

async function applyStealthScripts(context: BrowserContext) {
  await context.addInitScript(() => {
    // Override the navigator.webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });

    // Mock languages and plugins to mimic a real browser
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });

    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    });

    // Remove Playwright-specific properties
    // @ts-ignore
    // eslint-disable-next-line no-undef
    delete window.__playwright;
    // @ts-ignore
    // eslint-disable-next-line no-undef
    delete window.__pw_manual;
    // @ts-ignore
    // eslint-disable-next-line no-undef
    delete window.__PW_inspect;

    // Redefine the headless property
    Object.defineProperty(navigator, 'headless', {
      get: () => false,
    });

    // Override the permissions API
    // eslint-disable-next-line no-undef
    const originalQuery = window.navigator.permissions.query;
    // eslint-disable-next-line no-undef
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({
            state: Notification.permission,
          } as PermissionStatus)
        : originalQuery(parameters);
  });
}

export type RecordVideoOptions = {
  /**
   * Path to the directory to put videos into.
   */
  dir: string;
};

overrideStagehandInit();

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
    let consoleMessages: string[] = [];
    let networkMessages: string[] = [];

    try {
      const config = {
        env: 'LOCAL',
        headless: options?.headless ?? stagehandConfig.headless,
        verbose: options?.debug || stagehandConfig.verbose ? 1 : 0,
        debugDom: options?.debug ?? stagehandConfig.debugDom,
        modelName: getStagehandModel(stagehandConfig),
        apiKey: getStagehandApiKey(stagehandConfig),
        enableCaching: stagehandConfig.enableCaching,
        logger: stagehandLogger(options?.debug ?? stagehandConfig.verbose),
      } satisfies ConstructorParams;
      console.log('using stagehand config', config);
      stagehand = new Stagehand(config);

      await using _stagehand = {
        [Symbol.asyncDispose]: async () => {
          console.error('closing stagehand, this can take a while');
          await Promise.race([
            options?.connectTo ? undefined : stagehand?.page.close(),
            stagehand?.close(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Page close timeout')), 5000)
            ),
          ]);
          console.error('stagehand closed');
        },
      };

      // Initialize with timeout
      const initPromise = stagehand.init({
        // this method is overriden in our Stagehand class patch hack
        ...options,
        //@ts-ignore
        recordVideo: options.video
          ? {
              dir: await setupVideoRecording(options),
            }
          : undefined,
      });
      const initTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Initialization timeout')), 30000)
      );
      await Promise.race([initPromise, initTimeoutPromise]);

      // Setup console and network monitoring
      consoleMessages = await setupConsoleLogging(stagehand.page, options || {});
      networkMessages = await setupNetworkMonitoring(stagehand.page, options || {});

      try {
        // Skip navigation if url is 'current' or if current URL matches target URL
        if (url !== 'current') {
          const currentUrl = await stagehand.page.url();
          if (currentUrl !== url) {
            // Navigate with timeout
            const gotoPromise = stagehand.page.goto(url);
            const gotoTimeoutPromise = new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Navigation timeout')),
                stagehandConfig.timeout ?? 30000
              )
            );
            await Promise.race([gotoPromise, gotoTimeoutPromise]);
          } else {
            console.log('Skipping navigation - already on correct page');
          }
        } else {
          console.log('Skipping navigation - using current page');
        }
      } catch (error) {
        throw new NavigationError(
          `Failed to navigate to ${url}. Please check if the URL is correct and accessible.`,
          error
        );
      }

      const result = await this.performAction(
        stagehand,
        { instruction: query, evaluate: options?.evaluate },
        options?.timeout ?? stagehandConfig.timeout
      );

      // Take screenshot if requested
      await captureScreenshot(stagehand.page, options || {});

      // Output result and messages
      yield formatOutput(result, options?.debug);
      for (const message of outputMessages(networkMessages, consoleMessages, options || {})) {
        yield message;
      }

      // Output HTML content if requested
      if (options?.html) {
        const htmlContent = await stagehand.page.content();
        yield '\n--- Page HTML Content ---\n\n';
        yield htmlContent;
        yield '\n--- End of HTML Content ---\n';
      }

      if (options?.screenshot) {
        yield `Screenshot saved to ${options.screenshot}\n`;
      }
    } catch (error) {
      console.log('error in stagehand loop');
      yield 'error in stagehand: ' + handleBrowserError(error, options?.debug);
    }
  }

  private async performAction(
    stagehand: Stagehand,
    {
      instruction,
      evaluate,
    }: {
      instruction: string;
      evaluate?: string;
    },
    timeout = 120000
  ): Promise<string> {
    try {
      // Get the current URL before the action
      const startUrl = await stagehand.page.url();
      let totalTimeout: ReturnType<typeof setTimeout> | undefined;
      const totalTimeoutPromise = new Promise(
        (_, reject) =>
          (totalTimeout = setTimeout(() => reject(new Error('Action timeout')), timeout))
      );

      if (evaluate) {
        await Promise.race([stagehand.page.evaluate(evaluate), totalTimeoutPromise]);
      }

      // Perform action with timeout
      for (const instruct of instruction.split('|')) {
        let stepTimeout: ReturnType<typeof setTimeout> | undefined;
        const stepTimeoutPromise = new Promise((_, reject) => {
          stepTimeout = setTimeout(() => reject(new Error('step timeout')), 90000);
        });
        await Promise.race([stagehand.page.act(instruct), totalTimeoutPromise, stepTimeoutPromise]);
        if (stepTimeout !== undefined) {
          clearTimeout(stepTimeout);
        }
        console.log('step done', instruct);
      }

      // Wait for potential navigation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the current URL after the action
      const endUrl = await stagehand.page.url();

      if (totalTimeout) {
        clearTimeout(totalTimeout);
      }

      // If the URL changed, consider the action successful
      if (endUrl !== startUrl) {
        return `Successfully performed action: ${instruction} (final url ${endUrl})`;
      }

      return `Successfully performed action: ${instruction}`;
    } catch (error) {
      console.log('error in stagehand step', error);
      if (error instanceof Error) {
        throw new ActionError(`${error.message} Failed to perform action: ${instruction}`, {
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
        });
      }
      throw error;
    }
  }
}

export function stagehandLogger(
  verbose: boolean
): ((message: LogLine) => void | Promise<void>) | undefined {
  return (message) => {
    // fs.appendFileSync("stagehand-debug.log", JSON.stringify(message, null, 2));
    if (dumbMessages.has(message.message)) {
      // append these messages to a debug.log file
      // fs.appendFileSync("stagehand-debug.log", JSON.stringify(message, null, 2));
      return;
    }
    if (boringMessages.has(message.message)) {
      console.log('Stagehand:', message.message);
      return;
    }
    if (message.message === 'received response from LLM') {
      console.log('Stagehand:', message.auxiliary?.response?.value);
      return;
    }
    if (message.message === 'response') {
      const value = message?.auxiliary?.response?.value;
      if (value) {
        const completionResponse = JSON.parse(value);
        const content = completionResponse?.content;
        if (Array.isArray(content)) {
          for (const chunk of content) {
            const text = chunk?.text;
            if (text) {
              console.log('Stagehand: ', text);
            }
          }
          return;
        }
      }
    }
    if (verbose) {
      console.log('Stagehand:', message);
    } else {
      console.log('Stagehand:', message.message, message.auxiliary);
    }
  };
}
