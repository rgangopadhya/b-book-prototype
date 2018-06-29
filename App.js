import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Landing from './app/Containers/Landing';
import Login from './app/Containers/Login';
import CreateAccount from './app/Containers/CreateAccount';
import Profile from './app/Containers/Profile';
import SelectCharacter from './app/Containers/SelectCharacter';
import Create from './app/Containers/Create';
import List from './app/Containers/List';
import Story from './app/Containers/Story';
import ErrorNotification from './app/Components/ErrorNotification';

// view network requests
GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

const Navigator = StackNavigator({
  Landing: { screen: Landing },
  Login: { screen: Login },
  CreateAccount: { screen: CreateAccount },
  Profile: { screen: Profile },
  SelectCharacter: { screen: SelectCharacter },
  Create: { screen: Create },
  List: { screen: List },
  Story: { screen: Story },
}, { headerMode: 'none' });

const LoadingSpinner = ({ isVisible }) => {
  if (isVisible) {
    return (
      <View style={styles.spinnerStyle}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    return null;
  }
};

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isWaiting: false,
      errorModalVisible: false,
      errorTitle: null,
      errorMessage: null
    };
  }

  showSpinner() {
    this.setState({ isWaiting: true });
  }

  hideSpinner() {
    this.setState({ isWaiting: false });
  }

  showError(title, message) {
    this.setState({
      errorModalVisible: true,
      errorTitle: title,
      errorMessage: message
    });
  }

  hideError() {
    this.setState({
      errorModalVisible: false,
      errorTitle: null,
      errorMessage: null
    });
  }

  render() {
    const screenProps = {
      showSpinner: this.showSpinner.bind(this),
      hideSpinner: this.hideSpinner.bind(this),
      showError: this.showError.bind(this)
    };
    return (
      <View style={{flex: 1}}>
        <Navigator
          screenProps={screenProps}
        />
        <LoadingSpinner isVisible={this.state.isWaiting}/>
        <ErrorNotification
          title={this.state.errorTitle}
          message={this.state.errorMessage}
          visible={this.state.errorModalVisible}
          onPress={this.hideError.bind(this)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinnerStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    flex: 1,
    justifyContent : 'center',
    alignItems: 'center',
  }
});
