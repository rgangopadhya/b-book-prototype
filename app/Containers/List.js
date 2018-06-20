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
  getStories,
  updateStoryWithTitle
} from '../api';
import color from '../utils/colors';
import fonts from '../utils/fonts';
import moment from 'moment';
import durationToTime from '../utils/time';
import { startRecording } from '../utils/recording';
import { Confirm } from '../Components/Button';
import {
  ResponsiveImage,
  ResponsiveImageBackground
} from '../Components/Responsive';

const Story = (props) => {
  const { item, onPress } = props;
  return (
    <TouchableOpacity
      onPress={ () => onPress(item) }
      key={item.id}
      style={styles.storyContainer}
      disabled={props.showRecordingTitle}
    >
      <View style={styles.story}>
        <View style={styles.storyTitle}>
          <Text style={styles.date}>
            {moment(item.created_at).format('MMM D, YYYY')}
          </Text>
          {item.title !== null &&
            <TouchableOpacity
              onPress={ () => props.onPressPlay(item) }
            >
              <ResponsiveImage
                source={require('../../assets/title_wave_confirm.png')}
                baseWidth={80}
                baseHeight={13}
                style={{alignSelf: 'center'}}
              />
            </TouchableOpacity>
          }
        </View>
        <View>
          <View style={styles.storyBacking1}>
            <ResponsiveImage
              source={require('../../assets/backing_1.png')}
              style={styles.storyBackingImage1}
              baseWidth={370}
              baseHeight={300}
              resizeMode='contain'
            />
          </View>
          <View style={styles.storyBacking2}>
            <ResponsiveImage
              source={require('../../assets/backing_2.png')}
              style={styles.storyBackingImage2}
              baseWidth={362}
              baseHeight={280}
              resizeMode='contain'
            />
          </View>
          <View style={styles.storyBacking3}>
            <ResponsiveImage
              source={require('../../assets/backing_3.png')}
              style={styles.storyBackingImage3}
              baseWidth={362}
              baseHeight={280}
              resizeMode='contain'
            />
          </View>
          <ResponsiveImageBackground
            source={item.cover_image ? {uri: item.cover_image} : null}
            style={styles.storyCoverImage}
            resizeMode='contain'
            baseWidth={333}
            baseHeight={250}
          >
            <View style={styles.storyInfo}>
              <Text style={styles.storyDuration}>
                {durationToTime(item.duration)}
              </Text>
            </View>
          </ResponsiveImageBackground>
          {props.showRecordingTitle && !props.isSaving &&
            <SaveTitle
              {...props}
            />
          }
        </View>
      </View>
    </TouchableOpacity>
  );
}

const SaveTitle = ({
  isRecording, isSaving,
  onStartRecording, onStopRecording, onConfirm
}) => {
  return (
    <View style={{paddingTop: 50}}>
      <View
        style={styles.saveTitle}
      >
        {isRecording &&
          <View
            style={{flexDirection: 'row'}}
          >
            <View
              style={{backgroundColor: 'white', padding: 50, alignItems: 'center', justifyContent: 'center', flex: 3}}
            >
              <ResponsiveImage
                resizeMode='contain'
                baseWidth={75}
                baseHeight={11}
                source={require('../../assets/title_wave_confirm.png')}
              />
            </View>
            <Confirm
              onPress={onConfirm}
              style={{flex: 1, height: 100}}
              disabled={isSaving}
              baseHeight={50}
              baseWidth={50}
            />
          </View>
        }
        {!isRecording &&
          <TouchableOpacity
            onPress={onStartRecording}
            style={{backgroundColor: color('teal', 500), padding: 50, alignItems: 'center'}}
          >
            <Image
              resizeMode='contain'
              style={{}}
              source={require('../../assets/title_wave_start.png')}
            />
          </TouchableOpacity>
        }
      </View>
    </View>
  );
}

export default class List extends Component {

  constructor(props) {
    super(props);
    let showRecordingTitle = false;
    if (this.props.navigation.state.params) {
      showRecordingTitle = this.props.navigation.state.params.showRecordingTitle;
    }
    this.recording = null;
    this.state = {
      stories: [],
      showRecordingTitle,
      isRecordingTitle: false,
      isConfirmingTitle: false,
      isSavingTitle: false
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
    // may not be best practice to do this here
    // triggers another render
    this.setState({ stories });
    this.stopWaiting();
  }

  _onSelectStory(story) {
    const { navigate } = this.props.navigation;
    navigate('Story', { story });
  }

  async _onStartRecordingTitle() {
    if (this.recording !== null && this.recording !== undefined) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }
    await startRecording(
      (recording) => { this.recording = recording; },
      () => {},
      this._updateScreenForRecordingStatus
    );
  }

  _updateScreenForRecordingStatus = (status) => {
    if (status.canRecord) {
      this.setState({ isRecordingTitle: true });
    } else if (status.isDoneRecording) {
      this.setState({ isRecordingTitle: false, isConfirmingTitle: true });
    }
  }

  async _onStopRecordingTitle() {
    if (this.recording !== null && this.recording !== undefined) {
      try {
        await this.recording.stopAndUnloadAsync();
        return this.recording.getURI();
      } catch(error) {
        // do nothing
      }
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }
  }

  async _onConfirmRecordingTitle() {
    this.setState({ isSavingTitle: true });
    const recordingUri = await this._onStopRecordingTitle();
    const story = await updateStoryWithTitle(this.state.stories[0].id, recordingUri);
    const stories = [story, ...this.state.stories.slice(1)];
    this.setState({
      isConfirmingTitle: false,
      isSavingTitle: false,
      showRecordingTitle: false,
      stories
    });
  }

  async _onPressPlayTitle(story) {
    this.startWaiting();
    if (story.title === null) {
      return;
    }
    const sound = new Expo.Audio.Sound();
    sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
    this.sound = sound;

    try {
      await sound.loadAsync({ uri: story.title });
      await sound.playAsync();
    } catch(error) {
      console.log('woops', error);
    } finally {
      this.stopWaiting();
    }
  }

  async componentWillUnmount() {
    if (this.recording !== null && this.recording !== undefined) {
      await this.recording.stopAndUnloadAsync();
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    if (this.sound !== null && this.sound !== undefined) {
      await this.sound.stopAsync();
      this.sound = null;
    }
  }

  goBack() {
    this.props.navigation.navigate('Landing');
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.goBack.bind(this)}
          style={styles.goBackButton}
          disabled={this.state.showRecordingTitle}
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
              scrollEnabled={!this.state.showRecordingTitle}
              extraData={this.state}
              renderItem={({item, index}) => {
                return (
                  <Story
                    onPress={this._onSelectStory.bind(this)}
                    item={item}
                    showRecordingTitle={this.state.showRecordingTitle && index === 0}
                    onStartRecording={this._onStartRecordingTitle.bind(this)}
                    onStopRecording={this._onStopRecordingTitle.bind(this)}
                    onConfirm={this._onConfirmRecordingTitle.bind(this)}
                    onPressPlay={this._onPressPlayTitle.bind(this)}
                    isRecording={this.state.isRecordingTitle}
                    isConfirming={this.state.isConfirmingTitle}
                    isSaving={this.state.isSavingTitle}
                  />
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
    backgroundColor: color('blue', 500)
  },
  stories: {
    paddingHorizontal: 100,
    alignSelf: 'center'
  },
  storyContainer: {
    flex: 1,
    padding: 100,
    paddingVertical: 150
  },
  goBackButton: {
    padding: 30
  },
  story: {
    minHeight: 500,
    padding: 10
  },
  storyTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
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
  },
  saveTitle: {
    flex: 1,
    paddingVertical: 90,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
