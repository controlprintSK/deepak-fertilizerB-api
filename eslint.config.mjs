import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  // Global rule: Disallow console.log in all files except specific ones
  {
    files: ['**/*.js'],
    ignores: ['src/utils/consoleLog.js', 'src/utils/common.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      // 'no-console': 'error',
      
    },
  },
  // Override rule: Allow console.log ONLY in `consoleLog.js` and `common.js`
  {
    files: ['src/utils/consoleLog.js', 'src/utils/common.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // 'no-console': 'off',
      'no-unreachable': 'off',

    },
  },
  pluginJs.configs.recommended,
];
