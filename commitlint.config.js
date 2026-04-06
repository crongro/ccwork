export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'body-min-line-count': (parsed, when, value) => {
          const { body } = parsed;
          if (!body) return [false, `body must have at least ${value} lines`];
          const lines = body.split('\n').filter(line => line.trim() !== '');
          return [
            lines.length >= value,
            `body must have at least ${value} non-empty lines (current: ${lines.length})`,
          ];
        },
      },
    },
  ],
  rules: {
    'subject-empty': [2, 'never'],
    'body-empty': [2, 'never'],
    'body-min-line-count': [2, 'always', 2],
    'subject-case': [0],
  },
};
