const colorMap = {
  'teal': {
    600: '#23A393',
    500: '#52A49F'
  },
  'tan': {
    50: '#EADCCE',
    100: '#F1CD9F',
    200: '#F0C792'
  },
  'red': {
    300: '#ED7461'
  }
}

export default color = (name, level=600) => {
  return colorMap[name][level];
}
