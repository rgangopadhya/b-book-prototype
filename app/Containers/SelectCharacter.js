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
import { ResponsiveImage, ResponsiveButton } from '../Components/Responsive';

const Character = ({character, onPick}) => {
  return (
    <TouchableOpacity
      onPress={onPick}
      style={styles.character}
    >
      <ResponsiveImage
        source={{uri: character.image}}
        baseHeight={537}
        baseWidth={485}
        resizeMode='contain'
      />
    </TouchableOpacity>
  );
};

const CharacterPicker = ({characters, onPick}) => {
  return (
    <ScrollView
      horizontal={true}
      contentContainerStyle={styles.characterPicker}
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
    <ResponsiveImage
      source={{uri: sceneUrl}}
      style={styles.scene}
      baseHeight={127}
      baseWidth={170}
      key={sceneUrl}
    />
  );
}

const SceneList = ({scenes, onPress}) => {
  return (
    <TouchableOpacity
      style={styles.sceneList}
      onPress={() => { onPress(null) }}
    >
      {scenes.map((scene) => {
          return <Scene sceneUrl={scene.image} key={scene.id}/>;
        }
      )}
    </TouchableOpacity>
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
    if (this.state.selectedCharacter && (character === null || this.state.selectedCharacter.id === character.id)) {
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
          <ResponsiveButton
            onPress={this._shuffle.bind(this)}
            style={{backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', flex: 1}}
            baseHeight={127}
            baseWidth={170}
          >
            <ResponsiveImage
              source={require('../../assets/shuffle.png')}
              baseHeight={56}
              baseWidth={99}
            />
          </ResponsiveButton>
          <SceneList
            scenes={this.state.scenesForSelectedCharacter}
            onPress={this._onPickCharacter.bind(this)}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color('orange', 500)
  },
  goBackButton: {
    padding: 30
  },
  characterPicker: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  character: {
    paddingHorizontal: 20
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
    paddingHorizontal: 1
  }
});
