import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import color from '../utils/colors';

const IMAGES = {
  listen: require('../../assets/listen.png'),
  create: require('../../assets/record_doggie.png')
}

const Option = ({onPress, imageSource}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.option}>
      <Image
        source={imageSource}
        style={styles.optionImage}
        resizeMode='contain'
      />
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
          <Option onPress={this.onPressList.bind(this)} imageSource={IMAGES.listen}/>
          <Option onPress={this.onPressCreate.bind(this)} imageSource={IMAGES.create}/>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: color('tan', 100),
    alignItems: 'center',
    justifyContent: 'center'
  },
  option: {
    flex: 1,
    minWidth: 300,
    alignItems: 'center'
  },
  optionImage: {
    width: 300
  }
})
