import React, { Component } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  getStories
} from '../api';
import color from '../utils/colors';
import fonts from '../utils/fonts';
import moment from 'moment';
import durationToTime from '../utils/time';

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
        <TouchableOpacity
          onPress={this.goBack.bind(this)}
          style={styles.goBackButton}
        >
          <Image
            source={require('../../assets/back.png')}
            style={{height: 31, width: 36}}
          />
        </TouchableOpacity>
        <View style={styles.stories}>
          {this.state.stories &&
            <FlatList
              data={this.state.stories}
              keyExtractor={(item) => item.id}
              horizontal={true}
              renderItem={({item}) => {
                return (
                  <TouchableOpacity
                    onPress={() => { this._onSelectStory(item) }}
                    key={item.id}
                    style={styles.storyContainer}
                  >
                    <View style={styles.story}>
                      <Text style={styles.date}>
                        {moment(item.created_at).format('MMM D, YYYY')}
                      </Text>
                      <View>
                        <View style={styles.storyBacking1}>
                          <Image
                            source={require('../../assets/backing_1.png')}
                            style={styles.storyBackingImage1}
                            resizeMode='contain'
                          />
                        </View>
                        <View style={styles.storyBacking2}>
                          <Image
                            source={require('../../assets/backing_2.png')}
                            style={styles.storyBackingImage2}
                            resizeMode='contain'
                          />
                        </View>
                        <View style={styles.storyBacking3}>
                          <Image
                            source={require('../../assets/backing_3.png')}
                            style={styles.storyBackingImage3}
                            resizeMode='contain'
                          />
                        </View>
                        <ImageBackground
                          source={item.cover_image ? {uri: item.cover_image} : null}
                          style={styles.storyCoverImage}
                          resizeMode='contain'
                        >
                          <View style={styles.storyInfo}>
                            <Text style={styles.storyDuration}>
                              {durationToTime(item.duration)}
                            </Text>
                          </View>
                        </ImageBackground>
                      </View>
                    </View>
                  </TouchableOpacity>
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
    paddingVertical: 50,
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
    justifyContent: 'flex-end'
  },
  storyBacking1: {
    position: 'absolute',
    left: 0,
    top: -5
  },
  storyBackingImage1: {
    width: 370,
    height: 300
  },
  storyBacking2: {
    position: 'absolute',
    left: -10,
    top: -10
  },
  storyBackingImage2: {
    width: 362,
    height: 280
  },
  storyBacking3: {
    position: 'absolute',
    left: -10,
    top: -10
  },
  storyBackingImage3: {
    width: 362,
    height: 280
  },
  storyInfo: {
    alignItems: 'flex-start',
    backgroundColor: 'transparent'
  },
  storyDuration: {
    ...fonts.bold,
    fontSize: 16
  }
});
