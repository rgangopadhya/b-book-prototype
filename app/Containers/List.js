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

const Story = (props) => {
  const { item, onPress } = props;
  return (
    <TouchableOpacity
      onPress={onPress}
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
          {props.showRecordingTitle &&
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
  isRecording, isConfirming, isSaving,
  onStartRecording, onStopRecording, onConfirm
}) => {
  if (isRecording) {
    return (
      <TouchableOpacity
        onPress={onStopRecording}
      >
        <Image
          resizeMode='contain'
          style={{}}
          source={require('../../assets/title_wave_start.png')}
        />
      </TouchableOpacity>
    );
  } else if (isConfirming) {
    return (
      <View>
        <Image
          resizeMode='contain'
          style={{}}
          source={require('../../assets/title_wave_confirm.png')}
        />
        <Confirm
          onPress={onConfirm}
          disabled={isSaving}
          baseHeight={100}
          baseWidth={100}
        />
      </View>
    );
  }
  return (
    <TouchableOpacity
      onPress={onStartRecording}
    >
      <Image
        resizeMode='contain'
        style={{}}
        source={require('../../assets/title_wave_start.png')}
      />
    </TouchableOpacity>
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
    this.setState({ stories });
    this.stopWaiting();
  }

  _onSelectStory(story) {
    console.log('=== selecting story ===', story);
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
      } catch(error) {
        // do nothing
      }
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }
  }

  async _onConfirmRecordingTitle() {
    this.setState({ isSavingTitle: true });
    await updateStoryWithTitle(this.state.stories[0].id);
    this.setState({
      isConfirmingTitle: false,
      isSavingTitle: false,
      showRecordingTitle: false
    });
  }

  async componentWillUnmount() {
    if (this.recording !== null && this.recording !== undefined) {
      await this.recording.stopAndUnloadAsync();
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }
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
              scrollEnabled={!this.state.showRecordingTitle}
              renderItem={({item, index}) => {
                return (
                  <Story
                    onPress={() => this._onSelectStory(item)}
                    item={item}
                    showRecordingTitle={this.state.showRecordingTitle && index === 0}
                    onStartRecording={this._onStartRecordingTitle.bind(this)}
                    onStopRecording={this._onStopRecordingTitle.bind(this)}
                    onConfirm={this._onConfirmRecordingTitle.bind(this)}
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
    backgroundColor: color('blue', 500),
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
