import getUserConfig from '../helpers/getUserConfig';

getUserConfig({ cwd: process.cwd() }).then((config) => {
  console.log(config);
});
