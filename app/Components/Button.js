import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import color from '../utils/colors';
import { ResponsiveImage } from './Responsive';

const checkMark = require('../../assets/checkmark.png');
const cancel = require('../../assets/black_close.png');

function buttonConstructor(source, backgroundColor) {
  const button = ({ onPress, disabled, style, baseHeight, baseWidth }) => {
    const opacity = disabled ? 0.2 : 1.0;
    return (
      <TouchableOpacity
        style={[styles.container, { opacity, backgroundColor }, style]}
        onPress={onPress}
        key={opacity}
        disabled={disabled}
      >
        <View style={[styles.check]}>
          <ResponsiveImage
            resizeMode='contain'
            source={source}
            baseWidth={baseWidth}
            baseHeight={baseHeight}
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
export const Cancel = buttonConstructor(cancel, color('red', 300));

