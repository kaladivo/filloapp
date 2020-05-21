module.exports = {
	env: {
		browser: true,
		es6: true,
	},
	extends: ['airbnb', 'prettier'],
	globals: {
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	plugins: ['react', '@typescript-eslint'],
	rules: {
		semi: [2, 'never'],
		'object-curly-spacing': [2, 'never'],
		indent: ['error', 'tab', {'SwitchCase': 1}],
		'no-tabs': 0,
		'react/jsx-indent-props': [2, 'tab'],
		'react/jsx-indent': [2, 'tab'],
		'react/jsx-filename-extension': 0,
		'react/jsx-closing-bracket-location': [2, 'tag-aligned'],
		'react/jsx-closing-tag-location': 0,
		'react/jsx-tag-spacing': [2, {beforeSelfClosing: 'always'}],
		'react/jsx-one-expression-per-line': 0,
		'jsx-quotes': 0,
		'consistent-return': 0,
		'react/jsx-wrap-multilines': 0,
		'max-len': 0,
		'function-paren-newline': 0,
		'object-curly-newline': 0,
		'import/prefer-default-export': 0,
		'no-extra-boolean-cast': 0,
		'no-restricted-globals': 0,
		'no-restricted-syntax': 0,
		'no-param-reassign': 0,
		'no-continue': 0,
		'no-confusing-arrow': 0,
		'no-underscore-dangle': 0,
		'lines-between-class-members': 0,
		'react/jsx-props-no-spreading': 0,
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				'vars': 'all',
				'args': 'after-used',
				'ignoreRestSiblings': false,
			},
		],
		'no-console': 0,
		'func-names': 0,
		'indent': 0,
		'jsx-a11y/click-events-have-key-events': 1,
		'jsx-a11y/no-static-element-interactions': 1,
		'import/extensions': [
			'error',
			'always',
			{
				'ts': 'never',
				'tsx': 'never',
				'js': 'never',
				'jsx': 'never',
			},
		],
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
			},
		},
	},
}
