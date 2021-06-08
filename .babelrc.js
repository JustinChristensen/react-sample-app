module.exports = {
    presets: [
        ['@babel/preset-env', { 
            useBuiltIns: 'usage', 
            corejs: 3, 
            exclude: ['transform-typeof-symbol'] 
        }],
        ['@babel/preset-react', { runtime: 'automatic' }]
    ]
};
