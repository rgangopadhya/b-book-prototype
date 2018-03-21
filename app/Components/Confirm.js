import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import color from '../utils/colors';

const checkMark = require('../../assets/checkmark.png');

export default ({ onPress, size, disabled }) => {
  const opacity = disabled ? 0.2 : 1.0;
  return (
    <TouchableOpacity
      style={[styles.container, { opacity }]}
      onPress={onPress}
      key={opacity}
      disabled={disabled}
    >
      <View style={styles.check}>
        <Image
          resizeMode='contain'
          source={checkMark}
          style={{height: size}}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: color('teal', 500),
    alignSelf: 'center'
  },
  check: {
    alignSelf: 'center',
    padding: 30
  }
});
