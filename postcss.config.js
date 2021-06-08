const SOMEWHAT_EXPERIMENTAL = 1;

module.exports = {
    plugins: [
        require('postcss-preset-env')({
            stage: SOMEWHAT_EXPERIMENTAL
        })
    ]
};
