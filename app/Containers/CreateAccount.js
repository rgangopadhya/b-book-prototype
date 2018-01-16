import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View
} from 'react-native';
import {
  register
} from '../api';
import { maskPassword } from '../utils/login';

const LoginInput = ({name, onChangeText, value}) => {
  return (
    <View>
      <Text>{name}</Text>
      <TextInput
        style={styles.textInput}
        onChangeText={onChangeText}
        value={value}
        autoCorrect={false}
        autoCapitalize='none'
      />
    </View>
  );
}

export default class CreateAccount extends Component {

  constructor(params) {
    super(params);
    this.state = {
      username: null,
      email: null,
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
    } catch(error) {
      // TODO: show this to user
      console.log('Login error', error);
    }
    this.props.navigation.navigate('Landing');
    this.props.screenProps.hideSpinner();
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
          <LoginInput
            name='Email'
            onChangeText={this._updateKey.bind(this, 'email')}
            value={this.state.email}
          />
          <LoginInput
            name='Username'
            onChangeText={this._updateKey.bind(this, 'username')}
            value={this.state.username}
          />
          <LoginInput
            name='Password'
            onChangeText={this._updateKey.bind(this, 'password1')}
            value={maskPassword(this.state.password1)}
          />
          <LoginInput
            name='Enter password again'
            onChangeText={this._updateKey.bind(this, 'password2')}
            value={maskPassword(this.state.password2)}
          />
        </View>
        <TouchableHighlight
          onPress={this._submitRegistration.bind(this)}
        >
          <Text>Submit</Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  textInput: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10
  },
});
