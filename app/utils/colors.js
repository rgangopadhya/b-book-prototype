const colorMap = {
  'teal': {
    600: '#23A393'
  },
  'tan': {
    100: '#F1CD9F',
    200: '#F0C792'
  }
}

export default color = (name, level=600) => {
  return colorMap[name][level];
}
