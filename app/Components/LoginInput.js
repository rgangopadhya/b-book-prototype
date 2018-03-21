import React from 'react';
import {
  StyleSheet,
  TextInput,
  View
} from 'react-native';

export default ({placeholder, value, onChange, secure}) => {
  return (
    <View style={styles.loginInputContainer}>
      <TextInput
        style={styles.textInput}
        onChangeText={onChange}
        value={value}
        secureTextEntry={secure}
        autoCorrect={false}
        placeholder={placeholder}
        autoCapitalize='none'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loginInputContainer: {
    flexDirection: 'row',
    paddingTop: 40,
    borderBottomWidth: 1,
    borderColor: 'black'
  },
  textInput: {
    flex: 1,
    padding: 10,
    fontSize: 40
  },
})
