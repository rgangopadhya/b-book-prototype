import React from 'react';
import {
  Modal,
  StyleSheet,
  View
} from 'react-native';

export default ({children, visible}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  content: {
  }
});
