import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import {
  Audio,
  Permissions
} from 'expo';
import {
  FontAwesome
} from '@expo/vector-icons';
import color from '../utils/colors';
import fonts from '../utils/fonts';
import {
  getScenes,
  makeNewStory,
  saveSceneRecording
} from '../api';

const durationToTime = (durationMillis) => {
  if (!durationMillis) {
    return null;
  }
  const minutes = parseInt(durationMillis/ (1000 * 60));
  const seconds = parseInt((durationMillis - minutes * 60 * 1000) / 1000);
  return `${minutes}:${addLeadingZero(seconds)}`;
}

const addLeadingZero = (seconds) => {
  if (seconds / 10 > 1) {
    return seconds;
  }
  return `0${seconds}`;
}

const StartRecording = ({onPress}) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      style={styles.startRecording}
    >
      <FontAwesome
        name='microphone'
        size={50}
        color='white'
      />
    </TouchableHighlight>
  );
}

const StopRecording = ({onPress, recordingDuration, nextSceneImage}) => {
  const time = durationToTime(recordingDuration);
  return (
    <TouchableHighlight
      onPress={onPress}
      style={styles.stopRecording}
    >
      <View style={styles.stopRecordingContainer}>
        <Text style={styles.recordingDurationText}>
          {time}
        </Text>
        <Image
          resizeMode='contain'
          source={require('../../assets/wave.png')}
          style={{height: 30, width: 600}}
        />
        {nextSceneImage &&
          <View style={{paddingLeft: 15}}>
            <Image
              resizeMode='contain'
              source={nextSceneImage}
              style={{height: 170, width: 127}}
            />
          </View>
        }
      </View>
    </TouchableHighlight>
  );
}

const Playback = ({
  onPlayPress, onConfirm, isPlaying,
  recordingDuration, playbackDuration
}) => {
  const recordingTime = durationToTime(recordingDuration);
  const playbackTime = durationToTime(playbackDuration);
  const time = isPlaying && playbackDuration ? `${playbackTime} / ${recordingTime}` : recordingTime;
  return (
    <View style={styles.playback}>
      <TouchableHighlight
        onPress={onPlayPress}
        style={styles.playRecording}
      >
        <View style={styles.playRecordingIn}>
          <FontAwesome
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={50}
            color={color('teal', 600)}
          />
          <Text style={styles.recordingTimelineTime}>
            {time}
          </Text>
          <View style={styles.recordingTimeline}/>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        onPress={onConfirm}
        style={styles.confirmRecording}
      >
        <Image
          source={require('../../assets/checkmark.png')}
          style={{width: 52, height: 36}}
        />
      </TouchableHighlight>
    </View>
  );
}

export default class Create extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      hasRecording: false,
      isRecording: false,
      currentImage: null,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      volume: 1,
      haveRecordingPermissions: false,
      story: null,
      scenes: [],
      currentSceneIndex: 0
    };
  }

  async _askForPermissions() {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  }

  async _loadScenes() {
    this.startWaiting();
    const scenes = await getScenes();
    const story = await makeNewStory();
    this.setState({ scenes, story });
    this.stopWaiting();
  }

  componentDidMount() {
    this._askForPermissions();
    this._loadScenes();
  }

  async componentWillUnmount() {
    if (this.recording !== null && this.recording !== undefined) {
      await this.recording.stopAndUnloadAsync();
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }
    if (this.sound != null) {
      this.sound.stopAsync();
      this.sound = null;
    }
  }

  startWaiting() {
    this.setState({ isLoading: true });
    this.props.screenProps.showSpinner();
  }

  stopWaiting() {
    this.setState({ isLoading: false });
    this.props.screenProps.hideSpinner();
  }

  async startRecording() {
    console.log('=== startRecording ====');
    this.sound = null;
    this.startWaiting();
    console.log('.   setState');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
    console.log('.  setAudioModeAsync');
    if (this.recording !== null && this.recording !== undefined) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();
    this.recording = recording;
    const recordingSettings = {
      ios: Object.assign({}, Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY.ios, {
        extension: '.mp4',
        outputFormat: Expo.Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC
      }),
      android: Object.assign({}, Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY.android, {
        extension: '.mp4',
        outputFormat: Expo.Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4
      })
    };
    console.log('settings', recordingSettings);
    try {
      // await this.recording.prepareToRecordAsync(Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await this.recording.prepareToRecordAsync(recordingSettings);
      console.log('.   prepareToRecordAsync');
      recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);
      await this.recording.startAsync();
      this.stopWaiting();
      console.log('.   recording.startAsync');
    } catch (error) {
      console.log('error!!', error);
    }
  }

  async stopRecording() {
    console.log('==== stopRecording =====');
    this.setState({ hasRecording: true });
    this.startWaiting();
    try {
      await this.recording.stopAndUnloadAsync();
    } catch(error) {
      console.log('Stop recording error', error);
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
    const { sound, status } = await this.recording.createNewLoadedSound(
      {volume: this.state.volume},
      this._updateScreenForSoundStatus
    );
    this.sound = sound;
    this.stopWaiting();
    console.log('     Set hasRecording');
  }

  _onPlayPausePressed() {
    console.log('=== on play pause pressed====');
    if (this.sound != null) {
      if (this.state.isPlaying) {
        this.sound.pauseAsync();
      } else {
        console.log('=== start playing === ');
        this.sound.playAsync();
      }
    }
  }

  _onStopPressed() {
    if (this.sound != null) {
      this.sound.stopAsync();
    }
  }

  async _resetRecording() {
    if (this.recording !== null && this.recording !== undefined) {
      this.startWaiting();
      try {
        await this.recording.stopAndUnloadAsync();
      } catch(error) {
        // do nothing
      }
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
      this.setState({ hasRecording: false });
      this.stopWaiting();
    }
  }

  async _onConfirmRecording() {
    this.startWaiting();
    // save recording. for now just unload
    const recordingDuration = this.state.recordingDuration;
    await this._saveRecording(this.recording.getURI(), recordingDuration);
    this._resetRecording();
    if (this.state.currentSceneIndex >= this.state.scenes.length - 1) {
      // transition to home page
      console.log('=== trying to get out ====');
      this.props.navigation.navigate('Landing');
    } else {
      console.log('=== not trying to get out yet ===');
      this.setState({ currentSceneIndex: this.state.currentSceneIndex + 1 });
    }
    this.stopWaiting();
  }

  async _saveRecording(uri, duration) {
    console.log('== about to save', duration);
    try {
      await saveSceneRecording(
        this.state.story.id,
        this.state.scenes[this.state.currentSceneIndex].id,
        uri,
        duration,
        this.state.currentSceneIndex
      );
    } catch(error) {
      console.log('Error saving, try again');
    }
  }

  _updateScreenForSoundStatus = (status) => {
    console.log('=== updating for sound status', status);
    if (status.isLoaded) {
      console.log('     isLoaded', this);
      this.setState({
        soundDuration: status.durationMillis,
        soundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        rate: status.rate,
        isPlaybackAllowed: true
      });
    } else {
      console.log('      not loaded');
      this.setState({
        soundDuration: null,
        soundPosition: null,
        isPlaybackAllowed: false
      });
      if (status.error) {
        console.log(`FATAL PLAYER ERROR: ${status.error}`);
      }
    }
  }

  _updateScreenForRecordingStatus = (status) => {
    console.log('=== updating for recording status', status);
    if (status.canRecord) {
      console.log('    setting state for canRecord');
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
      });
    } else if (status.isDoneRecording) {
      console.log('    isDoneRecording');
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
      if (!this.state.isLoading) {
        this.stopRecording();
      }
    }
  }

  render() {
    const hiddenOverlay = {
      backgroundColor: 'gray',
      opacity: 0.8
    };
    console.log('=== rendering ==', this.state);
    const overlayStyle = this.state.isRecording || this.state.hasRecording ? {} : hiddenOverlay;
    const showRecordingPrompt = !this.state.isRecording && !this.state.hasRecording;
    const showCancelRecording = this.state.isRecording || this.state.hasRecording;
    const imageDimensions = {
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width
    }
    const backgroundSource = this.state.scenes.length > 0 ? { uri: this.state.scenes[this.state.currentSceneIndex].image } : null;
    let nextSceneImage = null;
    if (this.state.currentSceneIndex < this.state.scenes.length - 1) {
      const nextScene = this.state.scenes[this.state.currentSceneIndex + 1];
      nextSceneImage = { uri: nextScene.image };
    }
    return (
      <View style={styles.container}>
        <ImageBackground
          resizeMode='contain'
          style={[styles.img, imageDimensions]}
          source={backgroundSource}
        >
          <View style={[styles.imageOverlay, overlayStyle]}>
            {showCancelRecording &&
                <TouchableHighlight
                  onPress={this._resetRecording.bind(this)}
                  style={styles.cancelButton}
                >
                  <Image
                    source={require('../../assets/close.png')}
                  />
                </TouchableHighlight>
            }
          </View>
          <View style={styles.bottomBar}>
            {showRecordingPrompt &&
              <StartRecording
                onPress={this.startRecording.bind(this)}
              />
            }
            {this.state.isRecording &&
              <StopRecording
                onPress={this.stopRecording.bind(this)}
                recordingDuration={this.state.recordingDuration}
                nextSceneImage={nextSceneImage}
              />
            }
            {!this.state.isRecording && this.state.hasRecording &&
              <Playback
                onPlayPress={this._onPlayPausePressed.bind(this)}
                onConfirm={this._onConfirmRecording.bind(this)}
                isPlaying={this.state.isPlaying}
                recordingDuration={this.state.recordingDuration}
                playbackDuration={this.state.soundPosition}
              />
            }
          </View>
        </ImageBackground>
      </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  img: {
    flex: 1
  },
  imageOverlay: {
    height: '90%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },
  cancelButton: {
    padding: 20
  },
  bottomBar: {
    height: '10%'
  },
  startRecording: {
    flex: 1,
    backgroundColor: color('teal', 500),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stopRecording: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 40
  },
  stopRecordingContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  recordingDurationText: {
    color: color('teal', 500),
    width: 200,
    textAlign: 'center',
    textShadowOffset: { width: 1, height: 1},
    textShadowColor: '#045384',
    ...fonts.bold
  },
  playback: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playRecording: {
    flex: 3,
    padding: 30
  },
  playRecordingIn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  recordingTimeline: {
    backgroundColor: color('red', 300),
    height: 10,
    shadowOffset: { width: 1, height: 1},
    shadowColor: 'gray',
    flex: 1
  },
  recordingTimelineTime: {
    paddingHorizontal: 10,
    color: color('red', 300),
    textShadowOffset: { width: 1, height: 1 },
    textShadowColor: '#045384',
    ...fonts.bold
  },
  confirmRecording: {
    flex: 1,
    backgroundColor: color('teal', 500),
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
});
