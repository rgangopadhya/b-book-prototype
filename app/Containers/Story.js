import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableHighlight,
  View
} from 'react-native';
import {
  loadStoryData
} from '../api';


// we should probably move the playback code here
// that way, we dont have to worry about
// re-rendering the whole page every time
const PlaybackCursor = ({index, soundPosition, durations, isPlaying}) => {
  const totalDuration = durations.reduce((a, b) => a + b, 0);
  const segmentFractions = durations.map(d => d / totalDuration);
  console.log('**** Rendering for index', index, soundPosition);
  return (
    <View style={{flex: 1, flexDirection: 'row', alignSelf: 'flex-end'}}>
      {segmentFractions.map((segmentFraction, i) => {
        const duration = durations[i];
        let fill = index > i ? 1 : index === i ? soundPosition / duration : 0;
        return (
          <PlaybackCursorSegment
            width={`${segmentFraction * 100}%`}
            isPlaying={isPlaying}
            fill={fill}
            key={i}
          />
        );
      })}
    </View>
  );
}

const PlaybackCursorSegment = ({width, fill, isPlaying}) => {
  return (
    <View
      style={{width, height: 20, padding: 10, flexDirection: 'row'}}
    >
      <View style={{backgroundColor: isPlaying ? 'black' : 'red', width: `${fill*100}%`, height: 20}}/>
      <View style={{backgroundColor: 'white', width: `${(1-fill)*100}%`, height: 20}}/>
    </View>
  )
}


export default class Story extends Component {

  constructor(props) {
    super(props);
    this.state = {
      story: this.props.navigation.state.params.story,
      sceneRecordings: [],
      scenes: [],
      currentScene: null,
      currentSceneRecording: null,
      isPlaying: false,
      index: 0
    };
  }

  async componentDidMount() {
    await this._loadStory();
    await this.start();
  }

  async componentWillUnmount() {
    if (this.sound !== null) {
      this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
  }

  startWaiting() {
    this.props.screenProps.showSpinner();
  }

  stopWaiting() {
    this.props.screenProps.hideSpinner();
  }

  async _loadStory() {
    this.startWaiting();
    const { scenes, sceneRecordings } = await loadStoryData(this.state.story.id);
    this.setState({
      scenes,
      sceneRecordings,
      currentScene: scenes[0]
    });
    this.stopWaiting();
  }

  async start() {
    const recording = this.state.sceneRecordings.find(r => r.scene == this.state.currentScene.id);
    await this._playRecording(recording);
  }

  async _playRecording(sceneRecording) {
    this.startWaiting();
    const sound = new Expo.Audio.Sound();
    sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate)
    this.sound = sound;
    try {
      await sound.loadAsync({ uri: sceneRecording.recording });
      await sound.playAsync();
    } catch(error) {
      console.log('oh noes', error);
    } finally {
      this.stopWaiting();
    }
  }

  async _startNextSceneOrFinish() {
    console.log('=== startNextSceneOrFinish===', this.state);
    this.startWaiting();
    if (this.state.index >= this.state.scenes.length - 1) {
      // reset, no longer playing
      this.setState({
        index: 0,
        currentScene: this.state.scenes[0],
        soundPosition: 0,
        isPlaying: false
      });
      this.stopWaiting();
      return;
    }
    console.log('here we go');

    const nextIndex = this.state.index + 1;
    const nextScene = this.state.scenes[nextIndex];
    const nextRecording = this.state.sceneRecordings.find(r => r.scene === nextScene.id);
    console.log('== about to start with', nextIndex, nextScene, nextRecording);
    this.setState({
      currentScene: nextScene,
      index: nextIndex,
      soundPosition: 0
    });
    console.log('=== updated state');
    await this._playRecording(nextRecording);
    console.log('=== start playing next ===');
    this.stopWaiting();
  }

  _onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      // Update your UI for the unloaded state
      if (status.error) {
        console.log(`Encountered a fatal error during playback: ${status.error}`);
        // Send Expo team the error on Slack or the forums so we can help you debug!
      }
    } else {
      // Update your UI for the loaded state

      if (status.isPlaying) {
        // Update your UI for the playing state
        console.log('=== updating position', status.positionMillis);
        this.setState({
          soundPosition: status.positionMillis
        });
      } else {
        // Update your UI for the paused state
      }

      if (status.isBuffering) {
        // Update your UI for the buffering state
      }

      if (status.didJustFinish && !status.isLooping) {
        // The player has just finished playing and will stop. Maybe you want to play something else?
        this.sound.unloadAsync();
        this.sound = null;
        this._startNextSceneOrFinish();
      }
    }
  }

  goBack() {
    this.props.navigation.goBack();
  }

  render() {
    const imageDimensions = {
      height: Dimensions.get('window').height,
      width: Dimensions.get('window').width
    };
    const backgroundSource = this.state.currentScene ? { uri: this.state.currentScene.image } : null;
    return (
      <View style={styles.container}>
        <ImageBackground
          resizeMode='contain'
          style={[styles.img, imageDimensions]}
          source={backgroundSource}
        >
          <TouchableHighlight
            onPress={this.goBack.bind(this)}
            style={styles.goBackButton}
          >
            <Image
              source={require('../../assets/back.png')}
              style={{height: 31, width: 36}}
            />
          </TouchableHighlight>
          <PlaybackCursor
            index={this.state.index}
            soundPosition={this.state.soundPosition}
            durations={this.state.sceneRecordings.map(d => d.duration)}
            isPlaying={true}
          />
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  goBackButton: {
    padding: 20
  }
});
