import React from 'react';
import {
  Dimensions,
  Image,
  Slider,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import { Asset, Audio, Font, Video } from 'expo';
import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigator } from 'react-navigation';

class Icon {
  constructor(module, width, height) {
    this.module = module;
    this.width = width;
    this.height = height;
    Asset.fromModule(this.module).downloadAsync();
  }
}

class PlaylistItem {
  constructor(name, uri, isVideo) {
    this.name = name;
    this.uri = uri;
    this.isVideo = isVideo;
  }
}

const PLAYLIST = [
  new PlaylistItem(
    '',
    'https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3',
    false
  ),
];


const ICON_PLAY_BUTTON = new Icon(require('../assets/images/play_green.png'), 34, 51);
const ICON_PAUSE_BUTTON = new Icon(require('../assets/images/pause.png'), 24, 32);

const ICON_LOOP_ALL_BUTTON = new Icon(require('../assets/images/loop_all_button.png'), 77, 35);
const ICON_LOOP_ONE_BUTTON = new Icon(require('../assets/images/loop_one_button.png'), 77, 35);


const ICON_TRACK_1 = new Icon(require('../assets/images/track_1.png'), 166, 5);
const ICON_THUMB_1 = new Icon(require('../assets/images/thumb_1.png'), 18, 19);

const LOOPING_TYPE_ALL = 0;
const LOOPING_TYPE_ONE = 1;
const LOOPING_TYPE_ICONS = { 0: ICON_LOOP_ALL_BUTTON, 1: ICON_LOOP_ONE_BUTTON };

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const BACKGROUND_COLOR = 'powderblue';
const DISABLED_OPACITY = 0.5;
const FONT_SIZE = 14;
const LOADING_STRING = '... loading ...';
const HOR_CENTER = (DEVICE_WIDTH-300)/2;
const VIDEO_CONTAINER_HEIGHT = DEVICE_HEIGHT * 2.0 / 5.0 - FONT_SIZE * 2;
const SOUND_PANNEL_HEIGHT = 0.6*(DEVICE_HEIGHT);
const SOUND_PANNEL_TOP = 0.3*(DEVICE_HEIGHT- SOUND_PANNEL_HEIGHT);
const SOUND_PANNEL_BELOW = 0.7*(DEVICE_HEIGHT- SOUND_PANNEL_HEIGHT);

export default class main extends React.Component {
    static navigationOptions = {
        title: '',
    };
  constructor(props) {
    super(props);
    this.index = 0;
    this.isSeeking = false;
    this.shouldPlayAtEndOfSeek = false;
    this.playbackInstance = null;
    this.state = {
      showVideo: false,
      playbackInstanceName: LOADING_STRING,
      muted: false,
      playbackInstancePosition: null,
      playbackInstanceDuration: null,
      shouldPlay: false,
      isPlaying: false,
      isBuffering: false,
      isLoading: true,
      fontLoaded: false,
      shouldCorrectPitch: true,
      volume: 1.0,
      rate: 1.0,
      videoWidth: DEVICE_WIDTH,
      videoHeight: VIDEO_CONTAINER_HEIGHT,
      poster: false,
      useNativeControls: false,
      fullscreen: false,
      throughEarpiece: false,
    };
  }

  componentDidMount() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
    });
    (async () => {
      await Font.loadAsync({
        ...MaterialIcons.font,
        'cutive-mono-regular': require('../assets/fonts/CutiveMono-Regular.ttf'),
      });
      this.setState({ fontLoaded: true });
    })();
  }

  async _loadNewPlaybackInstance(playing) {
    if (this.playbackInstance != null) {
      await this.playbackInstance.unloadAsync();
      this.playbackInstance.setOnPlaybackStatusUpdate(null);
      this.playbackInstance = null;
    }

    const source = { uri: PLAYLIST[this.index].uri };
    const initialStatus = {
      shouldPlay: playing,
      rate: this.state.rate,
      shouldCorrectPitch: this.state.shouldCorrectPitch,
      volume: this.state.volume,
      isMuted: this.state.muted,
      isLooping: this.state.loopingType === LOOPING_TYPE_ONE,
      // // UNCOMMENT THIS TO TEST THE OLD androidImplementation:
      // androidImplementation: 'MediaPlayer',
    };

    if (PLAYLIST[this.index].isVideo) {
      this._video.setOnPlaybackStatusUpdate(this._onPlaybackStatusUpdate);
      await this._video.loadAsync(source, initialStatus);
      this.playbackInstance = this._video;
      const status = await this._video.getStatusAsync();
    } else {
      const { sound, status } = await Audio.Sound.create(
        source,
        initialStatus,
        this._onPlaybackStatusUpdate
      );
      this.playbackInstance = sound;
    }

    this._updateScreenForLoading(false);
  }

  _mountVideo = component => {
    this._video = component;
    this._loadNewPlaybackInstance(false);
  };

  _updateScreenForLoading(isLoading) {
    if (isLoading) {
      this.setState({
        showVideo: false,
        isPlaying: false,
        playbackInstanceName: LOADING_STRING,
        playbackInstanceDuration: null,
        playbackInstancePosition: null,
        isLoading: true,
      });
    } else {
      this.setState({
        playbackInstanceName: PLAYLIST[this.index].name,
        showVideo: PLAYLIST[this.index].isVideo,
        isLoading: false,
      });
    }
  }

  _onPlaybackStatusUpdate = status => {
    if (status.isLoaded) {
      this.setState({
        playbackInstancePosition: status.positionMillis,
        playbackInstanceDuration: status.durationMillis,
        shouldPlay: status.shouldPlay,
        isPlaying: status.isPlaying,
        isBuffering: status.isBuffering,
      });
  
    }
  };

  _onLoadStart = () => {
    console.log(`ON LOAD START`);
  };

  _onLoad = status => {
    console.log(`ON LOAD : ${JSON.stringify(status)}`);
  };

 

  _onPlayPausePressed = () => {
    if (this.playbackInstance != null) {
      if (this.state.isPlaying) {
        this.playbackInstance.pauseAsync();
      } else {
        this.playbackInstance.playAsync();
      }
    }
  };

  _onSeekSliderValueChange = value => {
    if (this.playbackInstance != null && !this.isSeeking) {
      this.isSeeking = true;
      this.shouldPlayAtEndOfSeek = this.state.shouldPlay;
      this.playbackInstance.pauseAsync();
    }
  };

  _onSeekSliderSlidingComplete = async value => {
    if (this.playbackInstance != null) {
      this.isSeeking = false;
      const seekPosition = value * this.state.playbackInstanceDuration;
      if (this.shouldPlayAtEndOfSeek) {
        this.playbackInstance.playFromPositionAsync(seekPosition);
      } else {
        this.playbackInstance.setPositionAsync(seekPosition);
      }
    }
  };

  _getSeekSliderPosition() {
    if (
      this.playbackInstance != null &&
      this.state.playbackInstancePosition != null &&
      this.state.playbackInstanceDuration != null
    ) {
      return this.state.playbackInstancePosition / this.state.playbackInstanceDuration;
    }
    return 0;
  }

 


  render() {
    const {navigate} = this.props.navigation;
    return !this.state.fontLoaded ? (
      <View style={styles.emptyContainer} />
    ) : (
      <View style={styles.superContainer}>
    <View style={styles.emptyContainer}>
        <View style={styles.container}>
            <Video
                ref={this._mountVideo}
            />
            <View
            style={[
                styles.buttonsContainerBase,
                styles.buttonsContainerTopRow,
                {
                opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
                },
            ]}>
            <TouchableHighlight
                underlayColor={BACKGROUND_COLOR}
                style={styles.wrapper}
                onPress={this._onPlayPausePressed}
                disabled={this.state.isLoading}>
                <Image
                style={styles.button}
                source={this.state.isPlaying ? ICON_PAUSE_BUTTON.module : ICON_PLAY_BUTTON.module}
                />
            </TouchableHighlight>
            </View>
            <View
            style={[
                styles.playbackContainer,
                {
                opacity: this.state.isLoading ? DISABLED_OPACITY : 1.0,
                },
            ]}>
            <Slider
                style={styles.playbackSlider}
                trackImage={ICON_TRACK_1.module}
                thumbImage={ICON_THUMB_1.module}
                value={this._getSeekSliderPosition()}
                onValueChange={this._onSeekSliderValueChange}
                onSlidingComplete={this._onSeekSliderSlidingComplete}
                disabled={this.state.isLoading}
            />
            </View>
        </View>
      </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({

  emptyContainer: {
    marginTop:'44%',
    marginBottom:'50%',
    height: DEVICE_HEIGHT,
    width: DEVICE_WIDTH,
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding:20,
    width: '60%',
    alignItems:'center',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    borderColor: '#f4f4f4',
    borderWidth: 2,
  },
  playbackContainer: {
    flex: 1,
    flexDirection: 'column',
    marginLeft:10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    minHeight: ICON_THUMB_1.height * 2.0,
    maxHeight: ICON_THUMB_1.height * 2.0,
    width:'50%',
  },
  playbackSlider: {
    alignSelf: 'center',
    width: 150,
  },

  button: {
    backgroundColor: '#ffffff',
  },

});