import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  register
} from '../api';
import RegistrationWrapper from '../Components/RegistrationWrapper';
import LoginInput from '../Components/LoginInput';
import { Confirm, Cancel } from '../Components/Button';

export default class CreateAccount extends Component {

  constructor(params) {
    super(params);
    this.state = {
      email: null,
      username: null,
      password1: null,
      password2: null
    };
  }

  _updateKey(key, value) {
    this.setState({ [key]: value });
  }

  async _submitRegistration() {
    this.props.screenProps.showSpinner();
    try {
      await register(
        this.state.username,
        this.state.email,
        this.state.password1,
        this.state.password2
      );
      this.props.navigation.navigate('Landing');
    } catch(error) {
      this.props.screenProps.showError('Invalid login', 'Try a more complicated password');
    } finally {
      this.props.screenProps.hideSpinner();
    }
  }

  _cancelRegistration() {
    this.props.navigation.navigate('Login');
  }

  render() {
    const disabled = !this.state.email || !this.state.username || !this.state.password1 || !this.state.password2;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <RegistrationWrapper>
          <View style={styles.form}>
            <LoginInput
              placeholder='Username'
              onChange={this._updateKey.bind(this, 'username')}
              value={this.state.username}
            />
            <LoginInput
              placeholder='Email'
              onChange={this._updateKey.bind(this, 'email')}
              value={this.state.email}
            />
            <LoginInput
              placeholder='Password'
              onChange={this._updateKey.bind(this, 'password1')}
              value={this.state.password1}
              secure={true}
            />
            <LoginInput
              placeholder='Enter password again'
              onChange={this._updateKey.bind(this, 'password2')}
              value={this.state.password2}
              secure={true}
            />
          </View>
        </RegistrationWrapper>
        <View style={styles.submit}>
          <View style={{flexDirection: 'row', width: '100%'}}>
            <Cancel
              onPress={this._cancelRegistration.bind(this)}
              size={60}
              style={{flex: 1}}
            />
            <Confirm
              onPress={this._submitRegistration.bind(this)}
              size={60}
              style={{flex: 3}}
              disabled={disabled}
            />
          </View>
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
  form: {
    flex: 1,
    paddingLeft: 20
  },
  submit: {
    justifyContent: 'flex-end',
    width: '100%'
  },
});
