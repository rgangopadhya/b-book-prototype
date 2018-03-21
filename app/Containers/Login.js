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
import Confirm from '../Components/Confirm';

const IMAGES = {
  profile: require('../../assets/profile.png')
}

const LoginForm = ({email, onChangeEmail, password, onChangePassword}) => {
  return (
    <View style={styles.loginForm}>
      <LoginInput
        placeholder='Email'
        value={email}
        onChange={onChangeEmail}
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
      email: null,
      password: null
    };
  }

  _submitLogin() {
    login(this.state.email, this.state.password);
    // should call parent
    this.props.navigation.navigate('Landing');
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
            onChangeEmail={(text) => this.setState({ email: text })}
            email={this.state.email}
            onChangePassword={(text) => this.setState({ password: text })}
            password={this.state.password}
          />
        </RegistrationWrapper>
        <View style={styles.submit}>
          <Confirm
            size={60}
            onPress={this._submitLogin.bind(this)}
            disabled={!this.state.email || !this.state.password}
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
