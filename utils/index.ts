import { normalize, sep } from 'path';
import { memoize, flow, camelCase, upperFirst } from 'lodash';

export const getThemeAccordingToDir = memoize(function getThemeAccordingToDir(
  dir: string
): string {
  return (
    normalize(dir)
      .split(sep)
      .pop() || ''
  );
});

export const getIdentifierCase = memoize(
  flow(
    camelCase,
    upperFirst
  )
);

export const getIdentifierAccordingToNameAndDir = memoize(
  (name: string, dir: string) => {
    const theme = getThemeAccordingToDir(dir);
    const kkCase = `${name}${theme ? `-${theme}` : ''}`;
    return getIdentifierCase(kkCase);
  }
);
