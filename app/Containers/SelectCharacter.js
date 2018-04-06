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
  console.log('=== rendering char', character);
  return (
    <TouchableOpacity
      onPress={onPick}
    >
      <Image
        source={{uri: character.image}}
        style={{height: 537, width: 252}}
      />
    </TouchableOpacity>
  );
};

const CharacterPicker = ({characters, onPick}) => {
  console.log('=== Got characters', characters);
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

  async _prefetchImages(scenes) {
    await Promise.all(scenes.map((scene) => {
      return Image.prefetch(scene.image);
    }));
  }

  _onConfirmSelection() {
    if (!this.state.selectedCharacter || this.state.scenesForSelectedCharacter.length === 0) {
      return;
    }
    this.props.navigation.navigate('Create', { character, scenes: this.state.scenesForSelectedCharacter });
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
        <SceneList
          scenes={this.state.scenesForSelectedCharacter}
        />
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
  sceneList: {
    flex: 1,
    flexDirection: 'row'
  },
  scene: {

  }
});
