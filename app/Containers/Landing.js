import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import color from '../utils/colors';
import {
  checkLogin
} from '../api';

const IMAGES = {
  listen: require('../../assets/listen.png'),
  create: require('../../assets/record_doggie.png'),
  profile: require('../../assets/profile.png')
}

const Option = ({onPress, imageSource, style}) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.option, style]}>
      <Image
        source={imageSource}
        style={styles.optionImage}
        resizeMode='contain'
      />
    </TouchableOpacity>
  );
}

export default class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false,
      user: null
    };
  }

  onPressList() {
    const { navigate } = this.props.navigation;
    navigate('List');
  }

  onPressCreate() {
    const { navigate } = this.props.navigation;
    navigate('SelectCharacter');
  }

  onPressLogin() {
    const { navigate } = this.props.navigation;
    if (this.state.isLoggedIn) {
      navigate('Profile', { user: this.state.user });
    } else {
      navigate('Login');
    }
  }

  async componentDidMount() {
    // check if user logged in: if so, navigate to Landing
    this.props.screenProps.showSpinner();
    const user = await checkLogin();
    const isLoggedIn = !!user;
    this.setState({ user, isLoggedIn });
    if (!isLoggedIn) {
      this.props.navigation.navigate('Login');
    }
    this.props.screenProps.hideSpinner();
  }

	render() {
		return (
			<View style={styles.container}>
        <Option
          onPress={this.onPressList.bind(this)}
          imageSource={IMAGES.listen}
          style={{ backgroundColor: color('blue', 500) }}
        />
        <Option
          onPress={this.onPressCreate.bind(this)}
          imageSource={IMAGES.create}
          style={{ backgroundColor: color('orange', 500) }}
        />
        <TouchableOpacity
          onPress={this.onPressLogin.bind(this)}
          style={styles.login}
        >
          <Image
            source={IMAGES.profile}
            resizeMode='contain'
            style={{height: 55, width: 55}}
          />
        </TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center'
	},
  option: {
    flex: 1,
    height: '100%',
    minWidth: 300,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionImage: {
    width: 300
  },
  login: {
    alignItems: 'center',
    position: 'absolute',
    top: 50,
    left: '47.25%'
  }
})
