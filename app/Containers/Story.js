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
  loadStoryData
} from '../api';
import durationToTime from '../utils/time';
import color from '../utils/colors';
import fonts from '../utils/fonts';


// we should probably move the playback code here
// that way, we dont have to worry about
// re-rendering the whole page every time
const PlaybackCursor = ({
  index, soundPosition, durations,
  isPlaying, onPause, onResume}) => {
  const totalDuration = durations.reduce((a, b) => a + b, 0);
  const segmentFractions = durations.map(d => d / totalDuration);
  const currSegmentPosition = soundPosition - durations.filter((d, i) => {
    return i < index;
  }).reduce((acc, d) => {
    return acc + d;
  }, 0);
  console.log('=== index', index, 'pos', soundPosition, 'total', totalDuration, 'fractions', segmentFractions);
  return (
    <TouchableOpacity
      onPress={isPlaying ? onPause : onResume}
      style={{justifyContent: 'center'}}
    >
      <View
        style={{flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center'}}
      >
        <View style={{backgroundColor: 'transparent'}}>
          <Text style={[styles.playbackDurationText, isPlaying ? {} : styles.playbackPausedText]}>
            {durationToTime(soundPosition)}
          </Text>
        </View>
        {segmentFractions.map((segmentFraction, i) => {
          const duration = durations[i];
          let fill = index > i ? 1 : index === i ? currSegmentPosition / duration : 0;
          return (
            <PlaybackCursorSegment
              width={`${segmentFraction * 85}%`}
              isPlaying={isPlaying}
              fill={fill}
              key={i}
            />
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const PlaybackCursorSegment = ({width, fill, isPlaying}) => {
  return (
    <View
      style={{width, height: 10, paddingHorizontal: 10, flexDirection: 'row'}}
    >
      <View style={{backgroundColor: isPlaying ? 'black' : 'red', width: `${fill*100}%`, height: 10}}/>
      <View style={{backgroundColor: isPlaying ? color('gray', 200) : color('red', 100), width: `${(1-fill)*100}%`, height: 10}}/>
    </View>
  )
}


export default class Story extends Component {

  constructor(props) {
    super(props);
    this.sound = null;
    this.state = {
      story: this.props.navigation.state.params.story,
      isLoaded: false,
      scenes: [],
      currentScene: null,
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
    const { scenes, story } = await loadStoryData(this.state.story.id);
    await this._prefetchImages(scenes);
    this.setState({
      scenes,
      currentScene: scenes[0],
      isLoaded: true
    });
    this.stopWaiting();
  }

  async _prefetchImages(scenes) {
    await Promise.all(scenes.map((scene) => {
      return Image.prefetch(scene.image);
    }));
  }

  async start() {
    this.setState({ isPlaying: true });
    await this._playRecording();
  }

  async _playRecording() {
    this.startWaiting();
    const sound = new Expo.Audio.Sound();
    sound.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate)
    this.sound = sound;
    try {
      await sound.loadAsync({ uri: this.state.story.recording });
      await sound.playAsync();
    } catch(error) {
      console.log('oh noes', error);
    } finally {
      this.stopWaiting();
    }
  }

  async _pausePlayback() {
    this.setState({ isPlaying: false });
    await this.sound.pauseAsync();
  }

  async _resumePlayback() {
    if (this.sound === null) {
      await this.start();
      return;
    }
    await this.sound.playAsync();
    this.setState({ isPlaying: true });
  }

  async finish() {
    this.startWaiting();
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
        const nextIndex = this.state.index + 1;
        const cumulativeDurationForScene = this.state.scenes.slice(0, nextIndex).reduce(
          (acc, el) => { return acc + el.duration }, 0
        );
        let shouldUpdateScene = status.positionMillis > cumulativeDurationForScene;
        shouldUpdateScene = shouldUpdateScene && nextIndex < this.state.scenes.length;
        this.setState({
          soundPosition: status.positionMillis,
          index: shouldUpdateScene ? nextIndex : this.state.index,
          currentScene: shouldUpdateScene ? this.state.scenes[nextIndex] : this.state.currentScene
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
        this.finish();
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
          <View
            style={{flexDirection: 'row', height: '15%', paddingHorizontal: 10, backgroundColor: 'white', alignItems: 'center'}}
          >
            <TouchableOpacity
              onPress={this.goBack.bind(this)}
              style={styles.goBackButton}
            >
              <Image
                source={require('../../assets/back.png')}
                style={{height: 31, width: 36}}
              />
            </TouchableOpacity>
            {this.state.isLoaded &&
              <PlaybackCursor
                index={this.state.index}
                soundPosition={this.state.soundPosition}
                durations={this.state.scenes.map(s => s.duration)}
                isPlaying={this.state.isPlaying}
                onPause={this._pausePlayback.bind(this)}
                onResume={this._resumePlayback.bind(this)}
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
    flex: 1,
    justifyContent: 'flex-end'
  },
  goBackButton: {
  },
  playbackDurationText: {
    paddingHorizontal: 10,
    textAlign: 'center',
    ...fonts.bold,
    fontSize: 18
  },
  playbackPausedText: {
    color: color('red', 300)
  }
});
