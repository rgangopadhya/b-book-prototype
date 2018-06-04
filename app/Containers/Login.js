import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import {
  login
} from '../api';
import color from '../utils/colors';
import RegistrationWrapper from '../Components/RegistrationWrapper';
import LoginInput from '../Components/LoginInput';
import { Confirm } from '../Components/Button';

const IMAGES = {
  profile: require('../../assets/profile.png')
}

const LoginForm = ({username, onChangeUsername, password, onChangePassword}) => {
  return (
    <View style={styles.loginForm}>
      <LoginInput
        placeholder='Username'
        value={username}
        onChange={onChangeUsername}
      />
      <LoginInput
        placeholder='Password'
        value={password}
        secure={true}
        onChange={onChangePassword}
      />
    </View>
  );
}

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: null,
      password: null
    };
  }

  startWaiting() {
    this.props.screenProps.showSpinner();
  }

  stopWaiting() {
    this.props.screenProps.hideSpinner();
  }

  async _submitLogin() {
    this.startWaiting();
    try {
      await login(this.state.username, this.state.password);
      // should call parent
      this.props.navigation.navigate('Landing');
    } catch(error) {
      this.props.screenProps.showError(
        'Login Error',
        'Failed to Login! Unrecognized username/password combination. Please try again.'
      );
    } finally {
      this.stopWaiting();
    }
  }

  _goToCreateAccount() {
    this.props.navigation.navigate('CreateAccount');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TouchableOpacity
          onPress={this._goToCreateAccount.bind(this)}
          style={styles.createAccount}
        >
          <Text style={styles.createAccountText}>
            Don't have an account? Create one
          </Text>
        </TouchableOpacity>
        <RegistrationWrapper>
          <LoginForm
            onChangeUsername={(text) => this.setState({ username: text })}
            username={this.state.username}
            onChangePassword={(text) => this.setState({ password: text })}
            password={this.state.password}
          />
        </RegistrationWrapper>
        <View style={styles.submit}>
          <Confirm
            baseWidth={75}
            baseHeight={75}
            onPress={this._submitLogin.bind(this)}
            disabled={!this.state.username || !this.state.password}
            style={{width: '100%'}}
          />
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
    backgroundColor: color('tan', 100)
  },
  title: {
    fontSize: 50,
    padding: 10
  },
  loginForm: {
    flex: 1,
    paddingLeft: 20
  },
  submit: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%'
  },
  createAccount: {
    padding: 20
  },
  createAccountText: {
    fontSize: 25,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: color('teal', 500)
  },
  submitLogin: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'blue'
  }
});
