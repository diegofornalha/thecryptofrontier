// postcss.config.js
module.exports = {
    plugins: [
        require('postcss-import'),
        require('tailwindcss/nesting'),
        require('tailwindcss'),
        require('autoprefixer'),
        process.env.NODE_ENV === 'production' 
            ? require('@fullhuman/postcss-purgecss')({
                content: [
                    './src/**/*.{js,jsx,ts,tsx}',
                    './public/index.html'
                ],
                defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
                safelist: {
                    standard: [/^react-/, /^next-/],
                    deep: [/shadcn/, /ui-/]
                }
            })
            : undefined,
    ].filter(Boolean)
};
