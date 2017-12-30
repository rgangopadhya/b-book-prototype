import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'

const Option = ({onPress, title}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.option}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
}

export default class Landing extends Component {

  onPressList() {
    const { navigate } = this.props.navigation;
    navigate('List');
  }

  onPressCreate() {
    const { navigate } = this.props.navigation;
    navigate('Create');
  }

  onPressLogin() {
    const { navigate } = this.props.navigation;
    navigate('Login');
  }

	render() {
		return (
			<View style={styles.container}>
        <View style={styles.loginButton}>
          <TouchableOpacity
            onPress={this.onPressLogin.bind(this)}
          >
            <Text>Login</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.options}>
          <Option onPress={this.onPressList.bind(this)} title='List'/>
          <Option onPress={this.onPressCreate.bind(this)} title='Create'/>
        </View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
  loginButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'blue'
  },
  options: {
    flex: 1,
    flexDirection: 'row'
  },
  option: {
    flex: 1
  }
})
