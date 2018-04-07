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
import Modal from '../Components/Modal';
import durationToTime from '../utils/time';

const StartRecording = ({onPress}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.startRecording}
    >
      <Image
        source={require('../../assets/start_record_doggie.png')}
        style={{height: '100%'}}
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
        size={35}
      />
      <TouchableOpacity
        style={styles.recordingState}
        onPress={isPaused ? onResume: onPause}
      >
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={[styles.recordingDurationText, isPaused ? styles.recordingDurationPaused : {}]}>
            {time}
          </Text>
          {!isPaused &&
            <Image
              resizeMode='contain'
              source={require('../../assets/wave.png')}
              style={{height: 30, width: 550}}
            />
          }
          {isPaused &&
            <View
              style={{width: 550, height: 10, backgroundColor: color('red', 300)}}
            />
          }
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
          size={55}
          onPress={onConfirm}
          style={{height: 127, width: 170}}
        />
      }
    </View>
  );
}

const ConfirmActionModal = ({
  isVisible, onClose, onConfirm,
  confirmImageSource, confirmIconSource,
  confirmStyle
}) => {
  const buttonDim = 0.35 * Dimensions.get('window').width;
  const buttonDimensions = {
    height: buttonDim,
    width: buttonDim
  };
  return (
    <Modal
      visible={isVisible}
    >
      <View style={modalStyle.container}>
        <View style={modalStyle.buttonWrapper}>
          <TouchableOpacity
            onPress={onClose}
            style={[modalStyle.button, modalStyle.closeButton, buttonDimensions]}
          >
            <Image
              source={require('../../assets/back.png')}
              resizeMode='contain'
              style={{height: 90, width: 90}}
            />
          </TouchableOpacity>
        </View>
        <View style={modalStyle.buttonWrapper}>
          <TouchableOpacity
            onPress={onConfirm}
            style={[modalStyle.button, modalStyle.confirmButton, buttonDimensions, confirmStyle]}
          >
            <View style={modalStyle.confirmIcons}>
              <Image
                resizeMode='contain'
                source={confirmImageSource}
                style={{position: 'relative', left: buttonDim * 0.15, top: 0}}
              />
              <Image
                resizeMode='contain'
                source={confirmIconSource}
                style={{height: 50, width: 50}}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
      character: this.props.navigation.state.params.character,
      scenes: this.props.navigation.state.params.scenes,
      currentSceneIndex: 0,
      cancelModalVisible: false,
      confirmModalVisible: false
    };
  }

  onLastScene() {
    if (this.state.scenes.length === 0) {
      return false;
    }
    return this.state.currentSceneIndex >= this.state.scenes.length - 1;
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

  async _showCancelModal() {
    await this._pauseRecording();
    this.setState({ cancelModalVisible: true });
  }

  async _closeCancelModal() {
    await this._resumeRecording();
    this.setState({ cancelModalVisible: false });
  }

  async _cancelRecording() {
    await this._resetRecording();
    this.sceneRecordings = [];
    this.setState({ cancelModalVisible: false });
    this.props.navigation.navigate('Landing');
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

  async _showConfirmModal() {
    await this._pauseRecording();
    this.setState({ confirmModalVisible: true });
  }

  async _closeConfirmModal() {
    await this._resumeRecording();
    this.setState({ confirmModalVisible: false });
  }

  async _onFinalConfirmation() {
    this.startWaiting();
    this.setState({ confirmModalVisible: false });
    await this._saveRecording();
    await this._persistRecordings();
    this.props.navigation.navigate('Landing');
    this.stopWaiting();
  }

  async _onConfirmRecording() {
    this.startWaiting();
    if (this.onLastScene()) {
      await this._showConfirmModal();
    } else {
      await this._saveRecording();
      this.startRecording();
      this.setState({
        currentSceneIndex: this.state.currentSceneIndex + 1,
        recordingPaused: false
      });
    }
    this.stopWaiting();
  }

  async _saveRecording() {
    this.sceneRecordings.push({
      sceneId: this.state.scenes[this.state.currentSceneIndex].id,
      recordingUri: this.recording.getURI(),
      duration: this.state.recordingDuration
    });
    await this._resetRecording();
  }

  async _persistRecordings() {
    this.startWaiting();
    try {
      await saveStoryRecording(this.sceneRecordings, this.state.character);
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
    const { width, height } = Dimensions.get('window');
    const screenDimensions = { height, width };
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
          style={[styles.img, screenDimensions]}
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
                onCancel={this._showCancelModal.bind(this)}
                onResume={this._resumeRecording.bind(this)}
                isPaused={this.state.recordingPaused}
                recordingDuration={this.state.recordingDuration}
                nextSceneImage={nextSceneImage}
              />
            }
          </View>
        </ImageBackground>
        <ConfirmActionModal
          isVisible={this.state.cancelModalVisible}
          onClose={this._closeCancelModal.bind(this)}
          onConfirm={this._cancelRecording.bind(this)}
          confirmImageSource={require('../../assets/cancel_doggie.png')}
          confirmIconSource={require('../../assets/black_close.png')}
        />
        <ConfirmActionModal
          isVisible={this.state.confirmModalVisible}
          onClose={this._closeConfirmModal.bind(this)}
          onConfirm={this._onFinalConfirmation.bind(this)}
          confirmImageSource={require('../../assets/confirm_doggie.png')}
          confirmIconSource={require('../../assets/checkmark.png')}
          confirmStyle={{backgroundColor: color('teal', 600)}}
        />
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
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  recordingControl: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between'
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
  recordingDurationPaused: {
    color: color('red', 300)
  },
  confirmRecording: {
    flex: 1,
    backgroundColor: color('teal', 500),
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
});

const modalStyle = StyleSheet.create({
  container: {
    flexDirection: 'row'
  },
  buttonWrapper: {
    padding: 20
  },
  button: {
    padding: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButton: {
    backgroundColor: 'white'
  },
  confirmButton: {
    backgroundColor: color('red', 300)
  },
  confirmIcons: {
    alignItems: 'center',
    justifyContent: 'flex-end'
  }
});
