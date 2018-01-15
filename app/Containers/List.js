import React, { Component } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import {
  getStories
} from '../api';
import color from '../utils/colors';

export default class List extends Component {

  constructor(props) {
    super(props);
    this.state = {
      stories: []
    };
  }

  startWaiting() {
    this.props.screenProps.showSpinner();
  }

  stopWaiting() {
    this.props.screenProps.hideSpinner();
  }

  async componentDidMount() {
    this.startWaiting();
    const stories = await getStories();
    this.setState({ stories });
    this.stopWaiting();
  }

  _onSelectStory(story) {
    console.log('=== selecting story ===', story);
    const { navigate } = this.props.navigation;
    navigate('Story', { story });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.stories &&
          <FlatList
            data={this.state.stories}
            keyExtractor={(item) => item.id}
            horizontal={true}
            renderItem={({item}) => {
              console.log('=== item ===', item);
              return (
                <TouchableHighlight
                  onPress={() => { this._onSelectStory(item) }}
                  key={item.id}
                  style={styles.storyContainer}
                >
                  <View style={styles.story}>
                    <Text>{item.created_at}</Text>
                    <Image
                      source={{uri: item.cover_image}}
                      style={{height: 200, width: 200}}
                      resizeMode='contain'
                    />
                  </View>
                </TouchableHighlight>
              );
            }}
          />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  storyContainer: {
    flex: 1,
    backgroundColor: color('tan', 200),
    padding: 20
  },
  story: {
    flex: 1
  }
});
