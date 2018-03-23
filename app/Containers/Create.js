import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  saveStoryRecording
} from '../api';
import { Confirm, Cancel } from '../Components/Button';

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
    <TouchableOpacity
      onPress={onPress}
      style={styles.startRecording}
    >
      <FontAwesome
        name='microphone'
        size={50}
        color='white'
      />
    </TouchableOpacity>
  );
}

const RecordingControl = ({
  onConfirm, onPause, onResume, onCancel,
  recordingDuration, nextSceneImage, isPaused
}) => {
  const time = durationToTime(recordingDuration);
  return (
    <View style={styles.recordingControl}>
      <Cancel
        onPress={onCancel}
        style={styles.cancelButton}
        size={45}
      />
      <TouchableOpacity
        style={styles.recordingState}
        onPress={isPaused ? onResume: onPause}
      >
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.recordingDurationText}>
            {time}
          </Text>
          <Image
            resizeMode='contain'
            source={require('../../assets/wave.png')}
            style={{height: 30, width: 550}}
          />
        </View>
      </TouchableOpacity>
      {nextSceneImage &&
        <TouchableOpacity
        onPress={onConfirm}
      >
          <Image
            source={nextSceneImage}
            style={{height: 127, width: 170}}
          />
        </TouchableOpacity>
      }
      {!nextSceneImage &&
        <Confirm
          size={60}
          onPress={onConfirm}
        />
      }
    </View>
  );
}

export default class Create extends Component {

  constructor(props) {
    super(props);
    this.sceneRecordings = [];
    this.state = {
      isLoading: false,
      recordingStarted: false,
      hasRecording: false,
      isRecording: false,
      recordingPaused: false,
      currentImage: null,
      recordingDuration: null,
      haveRecordingPermissions: false,
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
    this.setState({ scenes });
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
      await this.recording.prepareToRecordAsync(recordingSettings);
      console.log('.   prepareToRecordAsync');
      recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);
      await this.recording.startAsync();
      this.setState({ recordingStarted: true });
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
    this.stopWaiting();
    console.log('     Set hasRecording');
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

  async _pauseRecording() {
    console.log('==== pauseRecording === ');
    if (this.recording === null || this.recording === undefined) {
      return;
    }
    this.startWaiting();
    try {
      await this.recording.pauseAsync();
    } catch(error) {
      // do something? uh-oh
    }
    this.setState({ recordingPaused: true });
    this.stopWaiting();
  }

  async _resumeRecording() {
    console.log('==== resumeRecording ==== ');
    if (!this.state.recordingPaused || this.recording === null || this.recording === undefined) {
      return;
    }
    await this.recording.startAsync();
    this.setState({ recordingPaused: false });
  }

  async _onConfirmRecording() {
    console.log('==== onConfirmRecording ===');
    this.startWaiting();
    this.sceneRecordings.push({
      sceneId: this.state.scenes[this.state.currentSceneIndex].id,
      recordingUri: this.recording.getURI(),
      duration: this.state.recordingDuration
    });
    await this._resetRecording();
    if (this.state.currentSceneIndex >= this.state.scenes.length - 1) {
      // transition to home page
      console.log('=== trying to get out ====');
      await this._saveRecordings();
      this.props.navigation.navigate('Landing');
    } else {
      console.log('=== not trying to get out yet ===');
      this.startRecording();
      this.setState({ currentSceneIndex: this.state.currentSceneIndex + 1 });
    }
    this.stopWaiting();
  }

  async _saveRecordings() {
    console.log('== about to save');
    this.startWaiting();
    try {
      await saveStoryRecording(this.sceneRecordings);
      this.sceneRecordings = [];
    } catch(error) {
      console.log('Save error', error);
    }
    this.stopWaiting();
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
    const overlayStyle = this.state.recordingStarted ? {} : hiddenOverlay;
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
          <View style={[styles.imageOverlay, overlayStyle]}/>
          <View style={styles.bottomBar}>
            {!this.state.recordingStarted &&
              <StartRecording
                onPress={this.startRecording.bind(this)}
              />
            }
            {this.state.recordingStarted &&
              <RecordingControl
                onConfirm={this._onConfirmRecording.bind(this)}
                onPause={this._pauseRecording.bind(this)}
                onCancel={this.stopRecording.bind(this)}
                onResume={this._resumeRecording.bind(this)}
                isPaused={this.state.recordingPaused}
                recordingDuration={this.state.recordingDuration}
                nextSceneImage={nextSceneImage}
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
    height: '85%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },
  bottomBar: {
    height: '15%'
  },
  startRecording: {
    flex: 1,
    backgroundColor: color('teal', 500),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  recordingControl: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  recordingState: {
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  recordingDurationText: {
    color: color('teal', 500),
    width: 150,
    paddingHorizontal: 10,
    textAlign: 'center',
    textShadowOffset: { width: 1, height: 1},
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
