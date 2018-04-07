import React, { Component } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import {
  getCharacters,
  getScenesForCharacter
} from '../api';
import color from '../utils/colors';

const Character = ({character, onPick}) => {
  return (
    <TouchableOpacity
      onPress={onPick}
    >
      <Image
        source={{uri: character.image}}
        style={{height: 537, width: 485}}
        resizeMode='contain'
      />
    </TouchableOpacity>
  );
};

const CharacterPicker = ({characters, onPick}) => {
  return (
    <ScrollView
      horizontal={true}
    >
      {characters.map((item) => {
        return (
          <Character
            character={item}
            key={item.id}
            onPick={() => { onPick(item) }}
          />
        );
      })}
    </ScrollView>
  );
}

const Scene = ({sceneUrl}) => {
  return (
    <Image
      source={{uri: sceneUrl}}
      style={{height: 127, width: 170}}
      key={sceneUrl}
    />
  );
}

const SceneList = ({scenes}) => {
  return (
    <View style={styles.sceneList}>
      {scenes.map((scene) => {
          return <Scene sceneUrl={scene.image} key={scene.id}/>;
        }
      )}
    </View>
  );
}

export default class SelectCharacter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      characters: [],
      selectedCharacter: null,
      scenesForSelectedCharacter: []
    };
  }

  startWaiting() {
    this.setState({ isLoading: true });
    this.props.screenProps.showSpinner();
  }

  stopWaiting() {
    this.setState({ isLoading: false });
    this.props.screenProps.hideSpinner();
  }

  goBack() {
    this.props.navigation.goBack();
  }

  async componentDidMount() {
    this.startWaiting();
    const characters = await getCharacters();
    this.setState({ characters });
    await this._onPickCharacter(characters[0]);
    this.stopWaiting();
  }

  async _onPickCharacter(character) {
    this.startWaiting();
    if (this.state.selectedCharacter && this.state.selectedCharacter.id === character.id) {
      this._onConfirmSelection();
      this.stopWaiting();
      return;
    }
    this.setState({
      scenesForSelectedCharacter: [],
      selectedCharacter: character
    });
    const scenes = await getScenesForCharacter(character.id);
    await this._prefetchImages(scenes);
    this.setState({
      scenesForSelectedCharacter: scenes
    });
    this.stopWaiting();
  }

  async _shuffle() {
    this.startWaiting();
    const character = this.state.selectedCharacter;
    const scenes = await getScenesForCharacter(character.id);
    await this._prefetchImages(scenes);
    this.setState({
      scenesForSelectedCharacter: scenes
    });
    this.stopWaiting();
  }

  async _prefetchImages(scenes) {
    await Promise.all(scenes.map((scene) => {
      return Image.prefetch(scene.image);
    }));
  }

  _onConfirmSelection() {
    if (!this.state.selectedCharacter || this.state.scenesForSelectedCharacter.length === 0) {
      return;
    }
    this.props.navigation.navigate('Create', { character: this.state.selectedCharacter, scenes: this.state.scenesForSelectedCharacter });
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
        <CharacterPicker
          characters={this.state.characters}
          selectedCharacter={this.state.selectedCharacter}
          onPick={this._onPickCharacter.bind(this)}
        />
        <View style={styles.sceneSelect}>
          <TouchableOpacity
            onPress={this._shuffle.bind(this)}
            style={{backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', height: 127, width: 170}}
          >
            <Image
              source={require('../../assets/shuffle.png')}
              style={{height: 56, width: 99}}
            />
          </TouchableOpacity>
          <SceneList
            scenes={this.state.scenesForSelectedCharacter}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color('tan', 200)
  },
  goBackButton: {
    padding: 30
  },
  sceneSelect: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  sceneList: {
    flexDirection: 'row'
  },
  scene: {

  }
});
