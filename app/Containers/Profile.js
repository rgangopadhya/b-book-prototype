import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
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

  _goBack() {
    const { navigate } = this.props.navigation;
    navigate('Landing');
  }

  render() {
    const { user } = this.props.navigation.state.params;
    return (
      <View style={styles.container}>
        <RegistrationWrapper>
          <View style={styles.profile}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.email}>Logged in as: {user.email}</Text>
          </View>
        </RegistrationWrapper>
        <View style={styles.submit}>
          <TouchableOpacity
            onPress={this._goBack.bind(this)}
            style={styles.goBackButton}
          >
            <Image
              source={require('../../assets/back.png')}
              style={{height: 31, width: 36}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this._logOut.bind(this)}
            style={styles.logOut}
          >
            <Text style={styles.logOutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: color('tan', 100)
  },
  profile: {
    flex: 1
  },
  title: {
    fontSize: 50,
    padding: 10
  },
  email: {
    fontSize: 30
  },
  goBackButton: {
    padding: 30
  },
  submit: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%'
  },
  logOut: {
    backgroundColor: color('red', 300),
    padding: 40
  },
  logOutText: {
    fontSize: 50
  }
})
