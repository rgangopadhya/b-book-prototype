import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native';

import {
  login
} from '../api';
import { maskPassword } from '../utils/login';


export default class Login extends Component {

  constructor(params) {
    super(params);
    this.state = {
      username: null,
      password: null
    };
  }

  _submitLogin() {
    login(this.state.username, this.state.password);
    this.props.navigation.navigate('Landing');
  }

  _goToCreateAccount() {
    this.props.navigation.navigate('CreateAccount');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Login</Text>
        <View style={styles.loginInputContainer}>
          <Text style={styles.prompt}>Username</Text>
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => this.setState({ username: text })}
            value={this.state.username}
            autoCorrect={false}
            autoCapitalize='none'
          />
        </View>
        <View style={styles.loginInputContainer}>
          <Text style={styles.prompt}>Password</Text>
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => this.setState({ password: text })}
            value={maskPassword(this.state.password)}
            autoCorrect={false}
            autoCapitalize='none'
          />
        </View>
        <TouchableHighlight
          onPress={this._submitLogin.bind(this)}
          style={styles.submitLogin}
        >
          <View>
            <Text>Submit</Text>
          </View>
        </TouchableHighlight>
        <TouchableHighlight
          onPress={this._goToCreateAccount.bind(this)}
          style={styles.createAccount}
        >
          <Text style={styles.createAccountText}>
            Don't have an account? Create one
          </Text>
        </TouchableHighlight>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  loginInputContainer: {
    flexDirection: 'row',
    padding: 10
  },
  prompt: {
  },
  textInput: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10
  },
  createAccount: {
    padding: 20
  },
  createAccountText: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: 'bold'
  },
  submitLogin: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'blue'
  }
});
