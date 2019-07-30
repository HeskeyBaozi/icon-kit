import { pathExists } from 'fs-extra';
import { error, success } from 'signale';
import { join } from 'path';
import loadDefaultModuleFirst from '../utils/loadDefaultModuleFirst';
import { CwdNeeded, Config } from '../types';
import chalk from 'chalk';

export const MODULE_NAME = 'iconkit';
export const CONFIG_FILES = [
  `.${MODULE_NAME}rc.js`,
  `.${MODULE_NAME}rc.ts`,
  `${MODULE_NAME}.config.js`,
  `${MODULE_NAME}.config.ts`
];

export default async function resolveUserConfig({
  cwd
}: CwdNeeded): Promise<Config | Config[] | null> {
  const configFilePath = await getFirstExistFilePath({
    cwd,
    filePaths: CONFIG_FILES
  });
  if (!configFilePath) {
    error(`Cannot find any config file!`);
    return null;
  }
  success(`Load config file from ${chalk.underline.cyan(configFilePath)}.`);
  const userConfig = loadDefaultModuleFirst<Config | Config[] | null>(
    require(configFilePath)
  );
  if (
    Array.isArray(userConfig) ||
    (userConfig && Array.isArray(userConfig.plugins))
  ) {
    return userConfig;
  }
  return null;
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
