import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Landing from './app/Containers/Landing';
import Create from './app/Containers/Create';
import List from './app/Containers/List';

const Navigator = StackNavigator({
  LandingPage: { screen: Landing },
  Create: { screen: Create },
  List: { screen: List }
});

export default class App extends React.Component {
  render() {
    return (
      <Navigator />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});


// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import { StackNavigator } from 'react-navigation';

// class HomeScreen extends React.Component {
//   render() {
//     return <Text>Hello, Navigation!</Text>;
//   }
// }

// const SimpleApp = StackNavigator({
//   Home: { screen: HomeScreen }
// });

// export default class App extends React.Component {
//   render() {
//     return <SimpleApp />;
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center'
//   }
// });
