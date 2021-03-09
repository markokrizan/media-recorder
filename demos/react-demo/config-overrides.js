module.exports = function override(config, env) {
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        { exclude: /node_modules\/(?!media-recorder)/ },
      ],
    },
  };
};
