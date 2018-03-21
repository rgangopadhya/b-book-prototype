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
import fonts from '../utils/fonts';
import moment from 'moment';

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

  goBack() {
    this.props.navigation.goBack();
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight
          onPress={this.goBack.bind(this)}
          style={styles.goBackButton}
        >
          <Image
            source={require('../../assets/back.png')}
            style={{height: 31, width: 36}}
          />
        </TouchableHighlight>
        <View style={styles.stories}>
          {this.state.stories &&
            <FlatList
              data={this.state.stories}
              keyExtractor={(item) => item.id}
              horizontal={true}
              renderItem={({item}) => {
                return (
                  <TouchableHighlight
                    onPress={() => { this._onSelectStory(item) }}
                    key={item.id}
                    style={styles.storyContainer}
                  >
                    <View style={styles.story}>
                      <Text style={styles.date}>
                        {moment(item.created_at).format('MMM D, YYYY')}
                      </Text>
                      <View>
                        <Image
                          source={item.cover_image ? {uri: item.cover_image} : null}
                          style={styles.storyCoverImage}
                          resizeMode='contain'
                        />
                      </View>
                    </View>
                  </TouchableHighlight>
                );
              }}
            />
          }
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color('tan', 200),
  },
  stories: {
    paddingHorizontal: 100
  },
  storyContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  goBackButton: {
    padding: 30
  },
  story: {
    paddingHorizontal: 100
  },
  date: {
    ...fonts.bold,
    fontSize: 30,
    padding: 10,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: color('tan', 50)
  },
  storyCoverImage: {
    width: 333,
    height: 250,
    shadowOffset: { width: 10, height: 10 },
    shadowColor: color('tan', 50),
    shadowOpacity: 1
  }
});
