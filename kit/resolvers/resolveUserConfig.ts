import { pathExists } from 'fs-extra';
import { error, debug } from 'signale';
import { join } from 'path';
import loadDefaultModuleFirst from '../utils/loadDefaultModuleFirst';
import { CwdNeeded } from '../types';

export const MODULE_NAME = 'iconkit';
export const CONFIG_FILES = [
  `.${MODULE_NAME}rc.js`,
  `.${MODULE_NAME}rc.ts`,
  `${MODULE_NAME}.config.js`,
  `${MODULE_NAME}.config.ts`
];

export default async function resolveUserConfig({
  cwd
}: CwdNeeded): Promise<object | null> {
  const configFilePath = await getFirstExistFilePath({
    cwd,
    filePaths: CONFIG_FILES
  });
  if (!configFilePath) {
    error(`Cannot find any config file!`);
    return null;
  }
  debug(`Begin to load config from ${configFilePath}`);
  const userConfig = loadDefaultModuleFirst<object>(require(configFilePath));
  debug(`Config loaded: ${userConfig}`);
  return userConfig;
}

async function getFirstExistFilePath({
  cwd,
  filePaths
}: CwdNeeded & { filePaths: string[] }): Promise<string | null> {
  for (const filePath of filePaths) {
    const absoluteFilePath = join(cwd, filePath);
    if (await pathExists(absoluteFilePath)) {
      return absoluteFilePath;
    }
  }
  return null;
}
