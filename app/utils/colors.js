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
    100: '#FFE3E3',
    300: '#ED7461'
  },
  'gray': {
    200: '#DEDEDE'
  }
}

export default color = (name, level=600) => {
  return colorMap[name][level];
}
