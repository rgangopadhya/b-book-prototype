import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import RegistrationWrapper from '../Components/RegistrationWrapper';
import color from '../utils/colors';
import { logout } from '../api';

export default class Profile extends Component {

  _logOut() {
    logout();
    const { navigate } = this.props.navigation;
    navigate('Login');
  }

  render() {
    const { email } = this.props.navigation.state.params;
    console.log('=== Got props ===', email);
    return (
      <View style={styles.container}>
        <RegistrationWrapper>
          <Text>Logged in as: {email}</Text>
        </RegistrationWrapper>
        <View style={styles.submit}>
          <TouchableHighlight
            onPress={this._logOut.bind(this)}
            style={styles.logOut}
          >
            <View>
              <Text>Log Out</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color('tan', 100)
  },
  submit: {

  },
  logOut: {

  }
})
