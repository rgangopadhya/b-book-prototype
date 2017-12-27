import React, { Component } from 'react';
import {
  Dimensions,
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

const STORY_IMAGES = [
  require('../../assets/1.jpg'),
  require('../../assets/2.jpg'),
  require('../../assets/3.jpg'),
  require('../../assets/4.jpg'),
  require('../../assets/5.jpg')
]

const StartRecording = ({onPress}) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      style={styles.startRecording}
    >
      <View style={styles.recordPrompt}>
        <FontAwesome
          name='microphone'
          size={70}
          color='white'
        />
      </View>
    </TouchableHighlight>
  );
}

const StopRecording = ({onPress}) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      style={styles.stopRecording}
    >
      <View style={styles.recordPrompt}>
        <FontAwesome
          name='stop'
          size={70}
          color='white'
        />
      </View>
    </TouchableHighlight>
  );
}

const Playback = ({onPlayPress, onConfirm, isPlaying}) => {
  return (
    <View style={styles.playback}>
      <TouchableHighlight
        onPress={onPlayPress}
        style={styles.playRecording}
      >
        <View style={styles.recordPrompt}>
          <FontAwesome
            name={isPlaying ? 'pause' : 'play'}
            size={70}
            color='white'
          />
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        onPress={onConfirm}
        style={styles.confirmRecording}
      >
        <FontAwesome
          name='check'
          size={70}
          color='white'
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
      imageSources: STORY_IMAGES,
      currentImageIndex: 0
    };
  }

  async _askForPermissions() {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  }

  componentDidMount() {
    this._askForPermissions();
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
    try {
      await this.recording.prepareToRecordAsync(Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
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

  _onConfirmRecording() {
    this.startWaiting();
    // save recording. for now just unload
    this._resetRecording();
    if (this.state.currentImageIndex >= this.state.imageSources.length - 1) {
      // transition to home page
      console.log('=== trying to get out ====');
      this.props.navigation.navigate('Landing');
    } else {
      console.log('=== not trying to get out yet ===');
      this.setState({ currentImageIndex: this.state.currentImageIndex + 1 });
    }
    this.stopWaiting();
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
    const overlayStyle = this.state.isRecording ? {} : hiddenOverlay;
    const showRecordingPrompt = !this.state.isRecording && !this.state.hasRecording;
    const showCancelRecording = this.state.isRecording || this.state.hasRecording;
    const imageDimensions = {
      height: Dimensions.get('window').height * 0.85,
      width: Dimensions.get('window').width
    }
    return (
      <View style={styles.container}>
        <ImageBackground
          resizeMode='contain'
          style={[styles.img, imageDimensions]}
          source={this.state.imageSources[this.state.currentImageIndex]}
        >
          <View style={[styles.imageOverlay, overlayStyle]}>
            {showCancelRecording &&
                <TouchableHighlight
                  onPress={this._resetRecording.bind(this)}
                  style={styles.cancelButton}
                >
                  <FontAwesome name='close' size={60} color='gray'/>
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
              />
            }
            {!this.state.isRecording && this.state.hasRecording &&
              <Playback
                onPlayPress={this._onPlayPausePressed.bind(this)}
                onConfirm={this._onConfirmRecording.bind(this)}
                isPlaying={this.state.isPlaying}
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
    backgroundColor: color('teal', 600),
    height: '15%'
  },
  startRecording: {
    flex: 1,
    backgroundColor: color('teal', 600),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stopRecording: {
    flex: 1,
    backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playback: {
    backgroundColor: 'blue',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playRecording: {
    flex: 3
  },
  confirmRecording: {
    flex: 1
  },
  recordPrompt: {

  },
  cancelButton: {

  }
});
