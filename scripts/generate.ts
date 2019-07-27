import { explorer } from '../kit/getUserConfig';
import { CosmiconfigResult } from 'cosmiconfig';

explorer.search().then((result: CosmiconfigResult) => {
  if (result) {
    const {
      config: { add, value },
      filepath
    } = result;
    console.log(add(1, 2), value);
  }
});
