import React from 'react';
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default ({ onPress, size, disabled }) => {
  const opacity = disabled ? 0.2 : 1.0;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.cancelButton, { opacity }]}
      key={opacity}
      disabled={disabled}
    >
      <View style={styles.check}>
        <Image
          resizeMode='contain'
          source={require('../../assets/close.png')}
          style={{height: size}}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    backgroundColor: 'white',
    alignSelf: 'center'
  },
  check: {
    alignSelf: 'center',
    padding: 30
  }
});
