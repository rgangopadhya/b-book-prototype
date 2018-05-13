import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import color from '../utils/colors';

export default ({title, message, visible, onPress}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
    >
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <Text style={styles.header}>
            {title}
          </Text>
          <Text style={styles.message}>
            {message}
          </Text>
          <View style={styles.okButtonWrapper}>
            <TouchableOpacity
              onPress={onPress}
              style={styles.okButton}
            >
              <Text style={styles.okText}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    minWidth: 250,
    minHeight: 250,
    backgroundColor: 'white'
  },
  header: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20
  },
  message: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 15,
    padding: 10
  },
  okButtonWrapper: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  okButton: {
    backgroundColor: color('teal', 600)
  },
  okText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
    padding: 15
  }
})
