module.exports = {
  entry: 'src/index.ts',
  esm: {
    type: 'babel'
  },
  cjs: {
    type: 'babel'
  },
  umd: {
    name: 'AntDesignIcons',
    minFile: true
  }
};
