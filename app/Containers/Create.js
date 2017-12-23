import React, { Component } from 'react';
import {
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
import color from '../utils/colors';

STORY_IMAGES = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg'];

const StartRecording = ({onPress}) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      style={styles.startRecording}
    >
      <View/>
    </TouchableHighlight>
  );
}

// class Playback extends Component {
//   render() {
//     return (
//     );
//   }
// }

const StopRecording = ({onPress}) => {
  return (
    <TouchableHighlight
      onPress={onPress}
      style={styles.stopRecording}
    >
      <View/>
    </TouchableHighlight>
  );
}

export default class Create extends Component {

  constructor(props) {
    super(props);
    this.state = {
      currentImage: null,
      isRecording: false,
      hasRecording: false,
      soundPosition: null,
      soundDuration: null,
      recordingDuration: null,
      shouldPlay: false,
      isPlaying: false,
      volume: 1,
      haveRecordingPermissions: false
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

  async startRecording() {
    this.setState({ hasRecording: false });
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
    if (this.recording !== null && this.recording !== undefined) {
      this.recording.setOnRecordingStatusUpdate(null);
      this.recording = null;
    }

    const recording = new Audio.Recording();
    this.recording = recording;
    try {
      await this.recording.prepareToRecordAsync(Expo.Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);
      await this.recording.startAsync();
    } catch (error) {
      console.log('error!!', error);
    }
  }

  async stopRecording() {
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
    this.setState({ hasRecording: true });
    console.log('It should be time');
  }

  _onPlayPausePressed = () => {
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

  _onStopPressed = () => {
    if (this.sound != null) {
      this.sound.stopAsync();
    }
  }

  _updateScreenForSoundStatus = status => {
    if (status.isLoaded) {
      this.setState({
        soundDuration: status.durationMillis,
        soundPosition: status.positionMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        rate: status.rate,
        isPlaybackAllowed: true
      });
    } else {
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

  _updateScreenForRecordingStatus = status => {
    if (status.canRecord) {
      this.setState({
        isRecording: status.isRecording,
        recordingDuration: status.durationMillis,
      });
    } else if (status.isDoneRecording) {
      this.setState({
        isRecording: false,
        recordingDuration: status.durationMillis,
      });
      // if (!this.state.isLoading) {
      //   this.stopRecording();
      // }
    }
  };

  render() {
    const hiddenOverlay = {
      backgroundColor: 'gray',
      opacity: 0.8
    };
    console.log('=== rendering ==', this.state);
    const overlayStyle = this.state.isRecording ? {} : hiddenOverlay;
    return (
      <View style={styles.container}>
        <ImageBackground
          resizeMode='contain'
          style={styles.img}
          source={require('../../assets/1.jpg')}
        >
          <View style={[styles.imageOverlay, overlayStyle]}/>
          <View style={styles.bottomBar}>
            {!this.state.isRecording && !this.state.hasRecording &&
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
              <TouchableHighlight
                onPress={this._onPlayPausePressed.bind(this)}
                style={styles.playRecording}
              >
                <View/>
              </TouchableHighlight>
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
    flex: 1,
    width: null,
    height: null,

  },
  imageOverlay: {
    height: '85%'
  },
  bottomBar: {
    backgroundColor: color('teal', 600),
    height: '15%'
  },
  startRecording: {
    flex: 1,
    backgroundColor: 'green'
  },
  stopRecording: {
    flex: 1,
    backgroundColor: 'red'
  },
  playRecording: {
    flex: 1,
    backgroundColor: 'blue'
  }
});
