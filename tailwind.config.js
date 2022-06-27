/* eslint-disable import/no-extraneous-dependencies */
module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './public/**/*.html',
      './src/**/*.vue',
      './src/**/*.js',
      './node_modules/vue-good-table/src/**/*.vue',

    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    minHeight: {
      150: '150px',
    },
    minWidth: {
      150: '150px',
    },
    extend: {
      spacing: {
        '2/3': '66.666667%',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    // eslint-disable-next-line global-require
    require('@tailwindcss/aspect-ratio'),
  ],
};
