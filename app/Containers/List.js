import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import {
  getStories
} from '../api';

export default class List extends Component {

  constructor(props) {
    super(props);
    this.state = {
      stories: []
    };
  }

  async componentDidMount() {
    const stories = await getStories();
    this.setState({ stories });
  }

  _onSelectStory(story) {
    console.log('=== selecting story ===', story);
    const { navigate } = this.props.navigation;
    navigate('Story', { story });
  }

  render() {
    return (
      <View>
        {this.state.stories.map((story) => {
          return (
            <TouchableHighlight
              onPress={() => { this._onSelectStory(story) }}
              key={story.id}
            >
              <Text>{story.id}</Text>
            </TouchableHighlight>
          )
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  list: {
    flex: 1
  }
});
