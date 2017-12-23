const colorMap = {
  'teal': {
    600: '#23A393'
  }
}

export default color = (name, level=600) => {
  return colorMap[name][level];
}
