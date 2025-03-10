import * as path from 'path';
import * as os from 'os';
import type { Command, CommandGenerator } from '../../types';
import { loadEnv, loadConfig } from '../../config';
import { yieldOutput } from '../../utils/output';
import { TestError, FeatureFileParseError } from '../../errors';
import { TestOptions, RetryConfig, TestReport, TestScenarioResult } from './types';
import { parseFeatureBehaviorFile } from './parser';
import { executeScenario } from './executor';
import { saveReportToFile, saveResultToFile, compareReports } from './reporting';
import {
  getCurrentBranch,
  createDirIfNotExists,
  findFeatureBehaviorFiles,
  getReportFilename,
  getResultFilename,
} from './utils';
import PQueue from 'p-queue';
import { createProvider } from '../../providers/base';
import { once } from '../../utils/once';

/**
 * Implementation of the test command
 */
export class TestCommand implements Command {
  private config;

  constructor() {
    // Load environment variables and configuration
    loadEnv();
    this.config = loadConfig();
  }

  /**
   * Execute the test command
   *
   * @param query - Path to the feature behavior file or glob pattern
   * @param options - Test command options
   */
  async *execute(query: string, options: TestOptions): CommandGenerator {
    try {
      // Check if query is a glob pattern
      if (query.includes('*')) {
        yield* this.executeAll(query, options);
        return;
      }

      // Set default options
      const outputDir = options.output || 'tests/reports';
      const branch = options.branch || (await getCurrentBranch());
      const model = options.model || 'claude-3-7-sonnet-latest';
      const timeout = options.timeout || 300; // 5 minutes
      const retries = options.retries || 3;
      const debug = options.debug || false;
      const tags = options.tag ? options.tag.split(',') : undefined;
      const mcpServers = options.mcpServers || [];
      const parallel = options.parallel || Math.max(1, os.cpus().length - 1); // Default to CPU count - 1 for optimal performance

      // Create a single instance of the Gemini provider for summarization
      const geminiProvider = once(() => createProvider('gemini'));

      await yieldOutput(`\n🧪 Testing feature behavior: ${query}\n`, options);
      await yieldOutput(
        `📋 Options: outputDir=${outputDir}, branch=${branch}, model=${model}, timeout=${timeout}s, retries=${retries}${tags ? `, tags=${tags.join(',')}` : ''}${options.scenarios ? `, scenarios=${options.scenarios}` : ''}${mcpServers.length > 0 ? `, mcpServers=[${mcpServers.join(', ')}]` : ''}, parallel=${parallel}\n\n`,
        options
      );

      // Create output directory if it doesn't exist
      const branchOutputDir = path.join(outputDir, branch);
      await createDirIfNotExists(branchOutputDir);

      // Parse the feature behavior file
      const featureBehavior = await parseFeatureBehaviorFile(query);
      if (!featureBehavior) {
        throw new FeatureFileParseError(query);
      }

      await yieldOutput(`📖 Testing feature: ${featureBehavior.name}\n`, options);
      await yieldOutput(`🔍 Description: ${featureBehavior.description}\n`, options);
      await yieldOutput(`🧩 Scenarios: ${featureBehavior.scenarios.length}\n\n`, options);

      // Filter scenarios by tags if specified
      let scenarios = featureBehavior.scenarios;
      if (tags && tags.length > 0) {
        scenarios = scenarios.filter(
          (scenario) => scenario.tags && scenario.tags.some((tag) => tags.includes(tag))
        );
        await yieldOutput(
          `🏷️ Filtered to ${scenarios.length} scenarios with tags: ${tags.join(', ')}\n\n`,
          options
        );
      }

      // Filter scenarios by scenario numbers if specified
      const scenarioNumbers = options.scenarios;
      if (scenarioNumbers) {
        const numbers = scenarioNumbers
          .split(',')
          .map((num) => parseInt(num.trim(), 10))
          .filter((num) => !isNaN(num) && num > 0);

        if (numbers.length > 0) {
          scenarios = scenarios.filter((scenario) => {
            // Extract number from scenario ID (assuming format "Scenario 1", "Scenario 2", etc.)
            const scenarioNumber = parseInt(scenario.id.split(' ')[1], 10);
            return numbers.includes(scenarioNumber);
          });
          await yieldOutput(
            `🔢 Filtered to ${scenarios.length} scenarios with numbers: ${numbers.join(', ')}\n\n`,
            options
          );
        } else {
          await yieldOutput(
            `⚠️ Invalid scenario numbers provided: ${scenarios}. Running all scenarios.\n\n`,
            options
          );
        }
      }

      if (scenarios.length === 0) {
        await yieldOutput(`⚠️ No scenarios to test\n`, options);
        return;
      }

      // Set up retry configuration
      const retryConfig: RetryConfig = {
        initialDelay: 1000, // 1 second
        maxDelay: 30000, // 30 seconds
        factor: 2, // Exponential factor
        retries,
        jitter: true, // Add some randomness to prevent thundering herd
      };

      // Execute scenarios
      const startTime = Date.now();
      await yieldOutput(
        `🛠️ Executing scenarios with real commands${parallel > 1 ? ` in parallel (concurrency: ${parallel})` : ''}\n`,
        options
      );

      // Create a queue for parallel execution
      const queue = new PQueue({ concurrency: parallel });
      const resultPromises: Promise<TestScenarioResult | void>[] = [];
      const inProgress = new Set<string>();
      const started = new Set<string>();
      const completed = new Set<string>();

      // Add enhanced progress tracking for parallel execution
      let lastReportTime = Date.now();
      const reportInterval = 3000; // Report every 3 seconds

      queue.on('active', () => {
        const total = scenarios.length;
        const progress = Math.round((completed.size / total) * 100);
        const currentTime = Date.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;

        // Only report at intervals to avoid excessive output
        if (
          parallel > 1 &&
          (currentTime - lastReportTime > reportInterval || inProgress.size < parallel)
        ) {
          // Calculate estimated time remaining
          let estimatedTimeRemaining = 0;
          if (completed.size > 0) {
            const avgTimePerScenario = elapsedSeconds / completed.size;
            const remainingScenarios = total - completed.size;
            // Adjust for parallel execution
            estimatedTimeRemaining =
              (avgTimePerScenario * remainingScenarios) /
              Math.min(parallel, remainingScenarios || 1);
          }

          // Format times for display
          const formatTime = (seconds: number): string => {
            if (seconds < 60) return `${seconds.toFixed(0)}s`;
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
            return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${Math.floor(seconds % 60)}s`;
          };

          const statusMessage =
            `⏳ Progress: ${completed.size}/${total} scenarios completed (${progress}%)
🔄 Status: ${inProgress.size} running, ${total - completed.size - inProgress.size} pending` +
            (elapsedSeconds > 2
              ? `
⏱️ Elapsed: ${formatTime(elapsedSeconds)}
⏰ Est. remaining: ${formatTime(estimatedTimeRemaining)}
`
              : '');

          yieldOutput(statusMessage, options).catch((err) =>
            console.error('Error yielding progress output:', err)
          );

          lastReportTime = currentTime;
        }
      });

      // Enqueue each scenario for execution
      for (const scenario of scenarios) {
        const result = queue.add(async (): Promise<TestScenarioResult> => {
          const scenarioId = scenario.id;
          const scenarioOutputBuffer: string[] = []; // Create buffer for each scenario
          inProgress.add(scenarioId);
          started.add(scenarioId);

          try {
            // Execute the scenario
            const scenarioResult = await executeScenario(
              scenario,
              {
                model,
                timeout,
                retryConfig,
                debug,
                mcpServers,
                scenarioId, // Pass scenarioId to executor
                outputBuffer: scenarioOutputBuffer, // Pass the buffer to collect outputs
              },
              geminiProvider()
            );

            // Store the output buffer in the result
            scenarioResult.outputBuffer = scenarioOutputBuffer;

            return scenarioResult;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            // Create a failed result for this scenario
            const failedResult: TestScenarioResult = {
              id: scenarioId,
              type: scenario.type,
              description: scenario.description,
              taskDescription: scenario.taskDescription,
              approachTaken: '',
              commands: [],
              output: '',
              outputBuffer: scenarioOutputBuffer, // Include the output buffer even for failed scenarios
              expectedBehavior: scenario.expectedBehavior.map((behavior) => ({
                behavior,
                met: false,
                explanation: 'Execution error',
              })),
              successCriteria: scenario.successCriteria.map((criteria) => ({
                criteria,
                met: false,
                explanation: 'Execution error',
              })),
              result: 'FAIL',
              executionTime: 0,
              attempts: 0,
              explanation: 'Failed to execute scenario',
              error: errorMessage,
            };
            return failedResult;
          } finally {
            inProgress.delete(scenarioId);
            completed.add(scenarioId);
          }
        });
        resultPromises.push(result);
      }

      // Wait for all scenarios to complete
      await queue.onIdle();
      await Promise.allSettled(resultPromises);

      const results = (await Promise.all(resultPromises)).filter(
        (r): r is TestScenarioResult => !!r
      );

      // Output all scenario logs sequentially after all scenarios are complete
      if (parallel > 1) {
        await yieldOutput(`\n📋 Scenario Logs (in execution order):\n`, options);

        // Sort results by the order they were started
        const sortedResults = [...results].sort((a, b) => {
          const aIndex = scenarios.findIndex((s) => s.id === a.id);
          const bIndex = scenarios.findIndex((s) => s.id === b.id);
          return aIndex - bIndex;
        });

        // Output each scenario's logs
        for (const result of sortedResults) {
          await yieldOutput(`\n${'='.repeat(80)}\n`, options);
          await yieldOutput(`📝 Scenario: ${result.id}\n`, options);
          await yieldOutput(`${'='.repeat(80)}\n\n`, options);

          if (result.outputBuffer && result.outputBuffer.length > 0) {
            for (const line of result.outputBuffer) {
              await yieldOutput(line, options);
            }
          } else {
            await yieldOutput(`No logs available for this scenario.\n`, options);
          }
        }

        await yieldOutput(`\n${'='.repeat(80)}\n\n`, options);
      }

      // Calculate overall result
      const failedScenarios = results.filter((r) => r.result === 'FAIL').map((r) => r.id);

      const overallResult = failedScenarios.length === 0 ? 'PASS' : 'FAIL';
      const totalExecutionTime = (Date.now() - startTime) / 1000; // in seconds
      const sequentialEstimatedTime = results.reduce((sum, r) => sum + (r.executionTime || 0), 0);
      const timeSaved = parallel > 1 ? sequentialEstimatedTime - totalExecutionTime : 0;

      // Build test report
      const testReport: TestReport = {
        featureName: featureBehavior.name,
        description: featureBehavior.description,
        scenarios: results,
        timestamp: new Date().toISOString(),
        branch,
        provider: 'anthropic', // Always using Anthropic for tool-enabled mode
        model,
        os: `${os.platform()} ${os.release()}`,
        nodeVersion: process.version,
        overallResult,
        failedScenarios,
        totalExecutionTime,
      };

      // Write report to file
      const reportFilePath = path.join(branchOutputDir, getReportFilename(query));
      await saveReportToFile(testReport, reportFilePath);
      await yieldOutput(`📊 Report saved to: ${reportFilePath}\n`, options);

      // Write result file (PASS/FAIL)
      const resultFilePath = path.join(branchOutputDir, getResultFilename(query));
      await saveResultToFile(testReport, resultFilePath);
      await yieldOutput(`🏁 Result saved to: ${resultFilePath}\n`, options);

      // Compare with previous report if specified
      if (options.compareWith) {
        const comparisonResult = await compareReports(reportFilePath, options.compareWith, options);
        await yieldOutput(`\n📈 Comparison with ${options.compareWith}:\n`, options);
        await yieldOutput(`  - ${comparisonResult.added.length} new scenarios\n`, options);
        await yieldOutput(`  - ${comparisonResult.removed.length} removed scenarios\n`, options);
        await yieldOutput(`  - ${comparisonResult.changed.length} changed results\n`, options);
        await yieldOutput(`  - ${comparisonResult.unchanged.length} unchanged results\n`, options);
      }

      // Output final summary
      let summary = `
📋 Test Summary for ${featureBehavior.name}:
- Total scenarios: ${scenarios.length}
- Passed: ${scenarios.length - failedScenarios.length}
- Failed: ${failedScenarios.length}${failedScenarios.length > 0 ? ` (${failedScenarios.join(', ')})` : ''}
- Overall result: ${overallResult}
- Total execution time: ${totalExecutionTime.toFixed(2)}s
`;

      // Add parallel execution statistics if using parallel execution
      if (parallel > 1 && timeSaved > 0) {
        // Calculate more detailed statistics
        const speedupFactor = sequentialEstimatedTime / totalExecutionTime;
        const efficiency = (speedupFactor / parallel) * 100;
        const avgScenarioTime = sequentialEstimatedTime / scenarios.length;

        // Format times for display
        const formatTime = (seconds: number): string => {
          if (seconds < 60) return `${seconds.toFixed(1)}s`;
          if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
          return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${Math.floor(seconds % 60)}s`;
        };

        summary += `
⚡ Parallel Execution Statistics:
- Concurrency level: ${parallel}
- Estimated sequential time: ${formatTime(sequentialEstimatedTime)}
- Actual parallel time: ${formatTime(totalExecutionTime)}
- Time saved: ${formatTime(timeSaved)} (${Math.round((timeSaved / sequentialEstimatedTime) * 100)}%)
- Speedup factor: ${speedupFactor.toFixed(2)}x
- Parallel efficiency: ${efficiency.toFixed(1)}%
- Average scenario time: ${formatTime(avgScenarioTime)}
`;
      }

      await yieldOutput(summary, options);

      // Don't return anything
    } catch (error) {
      if (error instanceof Error) {
        throw new TestError(`Failed to execute test: ${error.message}`);
      }
      throw new TestError('Failed to execute test: Unknown error');
    }
  }

  /**
   * Execute multiple feature behavior files matching a pattern
   *
   * @param pattern - Glob pattern for feature behavior files
   * @param options - Test command options
   */
  private async *executeAll(pattern: string, options: TestOptions): CommandGenerator {
    // Find all files matching the pattern
    const files = await findFeatureBehaviorFiles(pattern);

    if (files.length === 0) {
      await yieldOutput(
        `❌ No feature behavior files found matching pattern: ${pattern}\n`,
        options
      );
      return;
    }

    await yieldOutput(
      `📂 Found ${files.length} feature behavior files matching pattern: ${pattern}\n`,
      options
    );

    // Execute each file
    const reports: TestReport[] = [];
    for (const file of files) {
      await yieldOutput(`\n🔍 Testing file: ${file}\n`, options);
      try {
        yield* this.execute(file, options);
      } catch (error) {
        await yieldOutput(
          `❌ Error testing ${file}: ${error instanceof Error ? error.message : String(error)}\n`,
          options
        );
      }
    }

    // Output summary of all tests
    const passedTests = reports.filter((r) => r.overallResult === 'PASS').length;
    const failedTests = reports.length - passedTests;

    await yieldOutput(`\n Overall Summary:\n`, options);
    await yieldOutput(`- Total files: ${files.length}\n`, options);
    await yieldOutput(`- Passed: ${passedTests}\n`, options);
    await yieldOutput(`- Failed: ${failedTests}\n`, options);
  }
}
