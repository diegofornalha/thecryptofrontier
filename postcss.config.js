// postcss.config.js
module.exports = {
    plugins: {
        'postcss-import': {},
        'tailwindcss/nesting': {},
        tailwindcss: {},
        autoprefixer: {},
        ...(process.env.NODE_ENV === 'production' 
            ? {
                '@fullhuman/postcss-purgecss': {
                    content: [
                        './src/**/*.{js,jsx,ts,tsx}',
                        './public/index.html'
                    ],
                    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
                    safelist: {
                        standard: [/^react-/, /^next-/],
                        deep: [/shadcn/, /ui-/]
                    }
                }
            }
            : {})
    }
};
