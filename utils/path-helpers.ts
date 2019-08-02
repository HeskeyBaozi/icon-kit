import { normalize, sep } from 'path';
import { memoize, flow, camelCase, upperFirst } from 'lodash';
import { AssetPath } from '@kit';

export const getThemeAccordingToDir = function getThemeAccordingToDir(
  dir: string
): string {
  return (
    normalize(dir)
      .split(sep)
      .pop() || ''
  );
};

export const getIdentifierCase = memoize(
  flow(
    camelCase,
    upperFirst
  )
);

export const getIdentifierAccordingToNameAndDir = memoize((from: AssetPath) => {
  const theme = getThemeAccordingToDir(from.dir);
  const kkCase = `${from.name}${theme ? `-${theme}` : ''}`;
  return getIdentifierCase(kkCase);
});
