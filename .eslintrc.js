const restrictedGlobals = require('confusing-browser-globals');

const restrictedFeatures = [
    'WithStatement',
    'ClassDeclaration',
    'ClassExpression'
];

const styleGuide = {
    'indent': [ 'error', 4 ],
    'linebreak-style': [ 'error', 'unix' ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'always' ],
};

module.exports = {
    'env': {
        'browser': true,
        'es2021': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:react/recommended'
    ],
    'parserOptions': {
        'ecmaVersion': 12,
        'sourceType': 'module'
    },
    'settings': {
        'react': {
            'version': 'detect'
        }
    },
    'rules': {
        'no-restricted-globals': ['error'].concat(restrictedGlobals),
        'no-restricted-syntax': ['error'].concat(restrictedFeatures),
        'array-callback-return': 'warn',
        'dot-location': ['error', 'property'],
        'eqeqeq': ['warn', 'smart'],
        'new-parens': 'error',
        'no-caller': 'error',
        'no-cond-assign': ['warn', 'except-parens'],
        'no-const-assign': 'error',
        'no-control-regex': 'warn',
        'no-delete-var': 'error',
        'no-dupe-args': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-empty-character-class': 'error',
        'no-empty-pattern': 'error',
        'no-eval': 'error',
        'no-ex-assign': 'error',
        'no-extend-native': 'error',
        'no-extra-bind': 'error',
        'no-extra-label': 'error',
        'no-func-assign': 'error',
        'no-implied-eval': 'error',
        'no-invalid-regexp': 'error',
        'no-iterator': 'error',
        'no-label-var': 'error',
        'no-lone-blocks': 'error',
        'no-loop-func': 'warn',
        'no-multi-str': 'error',
        'no-new-func': 'error',
        'no-new-object': 'error',
        'no-new-symbol': 'error',
        'no-new-wrappers': 'error',
        'no-obj-calls': 'error',
        'no-octal': 'warn',
        'no-octal-escape': 'warn',
        'no-redeclare': 'error',
        'no-var': 'error',
        'no-script-url': 'error',
        'no-self-assign': 'error',
        'no-self-compare': 'error',
        'no-shadow-restricted-names': 'error',
        'no-template-curly-in-string': 'warn',
        'no-throw-literal': 'warn',
        'no-undef': 'error',
        'no-unreachable': 'error',
        'no-unused-expressions': [
            'error',
            {
                allowShortCircuit: true,
                allowTernary: false,
                allowTaggedTemplates: false,
            }
        ],
        'no-unused-labels': 'error',
        'no-unused-vars': [
            'error',
            {
                args: 'none',
                ignoreRestSiblings: true,
            },
        ],
        'no-use-before-define': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-concat': 'error',
        'no-useless-escape': 'warn',
        'no-useless-rename': 'error',
        'no-with': 'error',
        'no-whitespace-before-property': 'error',
        'require-yield': 'error',
        'rest-spread-spacing': 'error',
        'strict': 'error',
        'unicode-bom': 'error',
        'use-isnan': 'error',
        'valid-typeof': 'error',
        'no-restricted-properties': [
            'error',
            {
                object: 'require',
                property: 'ensure',
                message:
                'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
            },
            {
                object: 'System',
                property: 'import',
                message:
                'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
            },
        ],
        'getter-return': 'error',
        'react/react-in-jsx-scope': 'off',
        ...styleGuide
    }
};
