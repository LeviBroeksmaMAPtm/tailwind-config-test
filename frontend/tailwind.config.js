// tailwind.config.js
const colors = require('tailwindcss/colors')

module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  theme: {
    colors: {
      // Build your palette here
      white: colors.white,
      gray: colors.coolGray,
      red: colors.red,
      blue: colors.sky,
      yellow: colors.amber,
      teal: colors.teal,
      green: colors.emerald,
      orange: colors.orange,
      indigo: colors.indigo,
      pink: colors.pink,
      purple: colors.purple
    },
    extend: {
      colors: {
        'maptm-orange': '#ff784d',
      }
    }
  },
  variants: {
    backgroundColor: ['responsive', 'hover', 'focus', 'active'],
    display: ({ after }) => after(['group-hover']),
    opacity: ({ after }) => after(['group-hover']),
    width: ({ after }) => after(['hover']),
    // opacity: ['disabled'],
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ]
}
