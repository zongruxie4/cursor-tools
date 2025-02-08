import { Stagehand } from '@browserbasehq/stagehand';
import type { SharedBrowserCommandOptions } from '../browserOptions';
import type { RecordVideoOptions } from './act';
import { once } from '../../../utils/once';

const oldInit = Stagehand.prototype.init;

// --- FIX FOR STAGEHAND ---
export const patchStagehand = once(async () => {
  const tempStagehand = new Stagehand({
    env: 'LOCAL',
    apiKey: 'test',
    verbose: 0,
    debugDom: false,
    headless: true,
    logger: () => {},
  });
  await oldInit.call(tempStagehand);
  const StagehandPage = tempStagehand['stagehandPage']!.constructor;
  const StagehandContext = tempStagehand['stagehandContext']!.constructor;
  tempStagehand.context.addInitScript;
  await tempStagehand.close();
  return { StagehandPage, StagehandContext };
});

export function overrideStagehandInit() {
  //@ts-ignore
  Stagehand.prototype.init = async function myinit(
    initOptions:
      | undefined
      | {
          recordVideo: RecordVideoOptions;
          viewport?: SharedBrowserCommandOptions['viewport'];
          connectTo?: SharedBrowserCommandOptions['connectTo'];
        }
  ): Promise<{ debugUrl: string; sessionUrl: string; sessionId: string }> {
    const { StagehandPage, StagehandContext } = await patchStagehand();
    const viewport = initOptions?.viewport?.toLowerCase().split('x').map(Number);
    const viewportSize = { width: viewport?.[0] ?? 1280, height: viewport?.[1] ?? 720 };

    const browserResult = await getBrowser(
      this['apiKey'],
      this['projectId'],
      this['env'],
      {
        headless: this.headless,
        recordVideo: initOptions?.recordVideo,
        viewport: viewportSize,
        connectTo: initOptions?.connectTo,
      },
      this.logger
    ).catch((e) => {
      console.error('Error in init:', e);
      return {
        context: undefined,
        debugUrl: undefined,
        sessionUrl: undefined,
        sessionId: undefined,
        env: this.env,
        contextPath: undefined,
      };
    });

    this['intEnv'] = browserResult.env;
    this['contextPath'] = browserResult.contextPath;

    if (!browserResult.context) {
      throw new Error('Failed to initialize browser context');
    }

    this['stagehandContext'] = await StagehandContext.init(browserResult.context, this);

    // Check for existing pages when using CDP
    let defaultPage;
    if (initOptions?.connectTo) {
      const pages = await browserResult.context.pages();
      defaultPage = pages.length > 0 ? pages[0] : await browserResult.context.newPage();
    } else {
      defaultPage = (await browserResult.context.pages())[0];
    }

    this['stagehandPage'] = await new StagehandPage(
      defaultPage,
      this,
      this['stagehandContext'],
      this['llmClient'],
      this['userProvidedInstructions']
    ).init();

    // Set the browser to headless mode if specified
    if (this.headless) {
      await this.page.setViewportSize(viewportSize);
    }

    await browserResult.context.addInitScript({
      content: scriptContent(),
    });

    this.browserbaseSessionID = browserResult.sessionId;

    return { 
      debugUrl: browserResult.debugUrl ?? '', 
      sessionUrl: browserResult.sessionUrl ?? '', 
      sessionId: browserResult.sessionId ?? '' 
    };
  };
}

// Import these from act.ts
import { getBrowser } from './act';
import { scriptContent } from './scriptContent'; 