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

	render() {
		return (
			<View style={styles.container}>
        <Option onPress={this.onPressList.bind(this)} title='List'/>
        <Option onPress={this.onPressCreate.bind(this)} title='Create'/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row'
	},
  option: {
    flex: 1
  }
})
