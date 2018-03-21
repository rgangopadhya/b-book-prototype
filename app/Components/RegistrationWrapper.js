import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';

const IMAGES = {
  profile: require('../../assets/profile.png')
}

export default ({ children }) => {
  return (
    <View style={styles.loginFormProfile}>
      <View style={styles.profile}>
        <Image
          source={IMAGES.profile}
          resizeMode='contain'
          style={{width: 250}}
        />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  loginFormProfile: {
    flex: 1,
    flexDirection: 'row'
  },
  profile: {
    justifyContent: 'center'
  },
})
