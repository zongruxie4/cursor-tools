import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

// In ESM, __filename is not available, so we need to construct it
const __filename = fileURLToPath(import.meta.url);

export const import_meta_url = pathToFileURL(__filename);
