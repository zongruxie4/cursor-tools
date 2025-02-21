import { pack } from 'repomix';

async function test() {
  try {
    const result = await pack(process.cwd(), {
      output: {
        filePath: '.repomix-output.txt',
        style: 'xml',
      },
      include: ['**/*'],
      ignore: {
        useGitignore: true,
        useDefaultPatterns: true,
      },
      security: {
        enableSecurityCheck: true,
      },
      tokenCount: {
        encoding: 'o200k_base',
      },
    });
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

test(); 