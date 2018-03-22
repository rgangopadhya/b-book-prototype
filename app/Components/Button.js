import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import color from '../utils/colors';

const checkMark = require('../../assets/checkmark.png');
const cancel = require('../../assets/close.png');

function buttonConstructor(source, backgroundColor) {
  const button = ({ onPress, size, disabled, style }) => {
    const opacity = disabled ? 0.2 : 1.0;
    return (
      <TouchableOpacity
        style={[styles.container, { opacity, backgroundColor }, style]}
        onPress={onPress}
        key={opacity}
        disabled={disabled}
      >
        <View style={styles.check}>
          <Image
            resizeMode='contain'
            source={source}
            style={{height: size}}
          />
        </View>
      </TouchableOpacity>
    );
  }
  return button;
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center'
  },
  check: {
    alignSelf: 'center',
    padding: 30
  }
});

export const Confirm = buttonConstructor(checkMark, color('teal', 500));
export const Cancel = buttonConstructor(cancel, 'white');
