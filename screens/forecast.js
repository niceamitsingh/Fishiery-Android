import React from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
  Alert,
  NetInfo,
  AsyncStorage,
  BackHandler
} from "react-native";
import { Audio } from "expo";
import Loader from "../components/util/loader";
import request from "../components/util/apirequest";
import APIConfig from "../components/config/APIconfig";
import getObjectForKey from "../components/util/title.localization";
import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';
import { LinearGradient } from 'expo';

var source = {
  uri: "",
};

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const SUB_VIEW = 0.67 * DEVICE_HEIGHT;

//for the animated text view !
var isHidden = true;
var toValue;

function MiniOfflineSign() {
  Alert.alert("Please check your internet connection !");
  return (
    <View style={styles.offlineContainer}>
      <View style={styles.offlineNotification}>
        <Text style={styles.offlineText}>No Internet Connection</Text>
      </View>
      <View style={styles.offlineIconContainer}>
        <Image
          style={styles.offlineIcon}
          source={require("../assets/images/no_connection.png")}
        />
      </View>
    </View>
  );
}

export default class forecast extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bounceValue: new Animated.Value(SUB_VIEW),
      showComponmentB: false, //This is the initial position of the subview
      playingStatus: "nosound",
      isConnected: true,
      loading: false,
      isSafe: false,
      currentMinVal: "-",
      currentMaxVal: "-",
      currentDir: "-",
      waveMinVal: "-",
      waveMaxVal: "-",
      waveDir: "-",
      windMinVal: "-",
      windMaxVal: "-",
      windDir: "-",
      textInfo: "No data available.",
      date: "-",
      selected_site: [],
      selected_state: "",
      forecastTag: "",
      cautionTag: "",
      playingTag: "",
      currentTag: "",
      safeTag: "",
      dangerTag: "",
      waveTag: "",
      windTag: "",
      language: "",
      fishingState: "",
      fishingStateFlag: "",
      osf_landing_site: [],
      feedbackTag: '',
      changeSiteTag: '',
      checkValueColor: '',
      soundUrl: '',
    };
  }

  componentWillReceiveProps(nextProp) {
    console.log('componentWillReceiveProps called.', nextProp);
  }
  async componentWillMount() {
    console.log("Reached forecast");
    const { navigation } = this.props;
    var selected_Landing_Site = [];
    var lat;
    var lon;
    this.setState({ loading: true });
    var labelForecast = await getObjectForKey("Forecast_OSF_Title");
    var labelCaution = await getObjectForKey("Forecast_State_Caution");
    var labelPlaying = await getObjectForKey("Forecast_Audio_playing");
    var labelCurrent = await getObjectForKey("Forecast_Component_Current");
    var labelWave = await getObjectForKey("Forecast_Component_Wave");
    var labelWind = await getObjectForKey("Forecast_Component_Wind");
    var labelHelpful = await getObjectForKey("Forecast_User_Review_Title");
    var labelSafe = await getObjectForKey("Forecast_State_Safe");
    var labelDanger = await getObjectForKey("Forecast_State_Danger");
    var labelFeedback = await getObjectForKey("Forecast_Feedback");
    var LabelChangeSite = await getObjectForKey("Forecast_Tap_To_Change");

    this.setState({
      cityCenter: selected_Landing_Site.landing_centre,
      dangerTag: labelDanger,
      safeTag: labelSafe,
      forecastTag: labelForecast,
      cautionTag: labelCaution,
      playingTag: labelPlaying,
      currentTag: labelCurrent,
      waveTag: labelWave,
      windTag: labelWind,
      reviewTag: labelHelpful,
      feedbackTag: labelFeedback,
      changeSiteTag: LabelChangeSite,
    });
    var site;
    var state;
    var city;
    try {
      site = await AsyncStorage.getItem('USERSELECTEDSITE');
      state = await AsyncStorage.getItem('USERSELECTEDSTATE');
      city = await AsyncStorage.getItem('USERSELECTEDCITY')
    } catch (error) {
      // Error retrieving data
    }
    //console.log(lat + "   " + lon);
    console.log('Site value: ' + site);
    console.log('State value: ' + state);
    var coordinates = {
      latitude: 17.3850,
      longitude: 78.4867
    };
    await this.apiCallForForecast(site, state, city);
  }

  async apiCallForForecast(currentSite, currentState, currentCity) {
    var lang;
    var site;
    try {
      lang = await AsyncStorage.getItem("DEFAULT_LANGUAGE");
    } catch (error) {
      // Error retrieving data
    }
    this.setState({ loading: false });
    console.log("Language is: " + lang);
    console.log("Enquired city:" + currentCity);
    console.log("Enquired site:" + currentSite);
    console.log("Enquired state:" + currentState);
    var data = {
      "user_id": "5cf139a5f8218a5322a41f57",
      "language": lang,
      "location": { "state": currentState, "district": currentCity, "landing_centre": currentSite },
      "template_name": "ocean_state_forecast_template",
      "selected_keywords": []
    }
    console.log("Request Body: " + JSON.stringify(data));
    response = await request(
      APIConfig.Base_URL + APIConfig.Get_OSF.urlPath,
      data
    );
    console.log("Data: " + JSON.stringify(response));
    var cond = response.data[0].flag;
    console.log("Condition is: " + cond);
    this.state.currentMinVal = response.data[0].min_current_speed_kmph;
    this.state.currentMaxVal = response.data[0].max_current_speed_kmph;
    this.state.currentDir = response.data[0].current_direction;
    this.state.waveMinVal = response.data[0].min_wave_height_feet;
    this.state.waveMaxVal = response.data[0].max_wave_height_feet;
    this.state.waveDir = response.data[0].wave_direction;
    this.state.windMinVal = response.data[0].min_wind_speed_kmph;
    this.state.windMaxVal = response.data[0].max_wind_speed_kmph;
    this.state.windDir = response.data[0].wind_direction;
    this.state.fishingState = cond;
    this.state.textInfo = response.text;
    this.state.date = response.data[0].date;
    this.state.soundUrl = response.audio;
    this.state.playingStatus = 'nosound';
    this.state.cityCenter = response.data[0].landing_centre_regional;
    AsyncStorage.setItem("DEFAULT_FORECAST_STATE", cond);
    this.setState({ loading: false });
  }

  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    NetInfo.isConnected.addEventListener(
      "connectionChange",
      this.handleConnectivityChange
    );
    this.props.navigation.addListener('willFocus', (playload) => {
      console.log(playload);
      this.state.loading=true;
      this.state.playingStatus='nosound';
      this.soundUrl = '';
      this.componentWillMount();
    });
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    NetInfo.isConnected.removeEventListener(
      "connectionChange",
      this.handleConnectivityChange
    );
  }
   onBackPress = () => {
    this.setState({
      playingStatus: 'donepause',
      isPlaying: false,
    });
    console.log('pausing...');
    this.sound.pauseAsync();
    this.props.navigation.navigate('fishing_site');
    return true;
  }


  alert_feedback = feedback_point => {
    Alert.alert(this.state.feedbackTag);
    var siteID = this.state.selected_site.landing_centre_ID;
    var dataSource = request(
      APIConfig.Base_URL + APIConfig.User_Feedback.urlPath,
      {
        response_id: siteID,
        feedback: feedback_point
      }
    );
    if (dataSource == "timeout of 60000ms exceeded") {
      Alert.alert("Please try after some time");
    }
    console.log("Feedback Response: " + dataSource);
  };

  handleConnectivityChange = isConnected => {
    if (isConnected) {
      this.setState({ isConnected });
    } else {
      this.setState({ isConnected });
    }
  };
  static navigationOptions = {
    header: null
  };

  _toggleSubview() {
    if (!isHidden) {
      toValue = DEVICE_HEIGHT;
    }
    if (isHidden) {
      toValue = 0;
    }

    _toggleShow = () => {
      this.setState({ showComponmentB: !this.state.showComponmentB });
    };
    Animated.spring(this.state.bounceValue, {
      toValue: toValue,
      velocity: 3,
      tension: 2,
      friction: 8
    }).start();

    isHidden = !isHidden;
  }

  call = () => {
    this.setState({
      playingStatus: 'donepause',
      isPlaying: false,
    });
    console.log('pausing...');
    this.sound.pauseAsync();
    this.props.navigation.navigate("call_rfs");
  };


  async _playRecording() {
    source.uri = this.state.soundUrl;
    console.log('Audio URl: ' + source.uri);
    if (source.uri === "") {
      this.setState({ loading: false });
      Alert.alert("Audio is not available.");
    }
    else {
      var { sound } = await Audio.Sound.create(
        source,
        {
          shouldPlay: true,
          isLooping: false,
        },
        this._updateScreenForSoundStatus,
      );

      this.setState({ loading: false });
      this.sound = sound;
      this.setState({
        isPlaying: 'true'
      });
    }
  }

  _updateScreenForSoundStatus = (status) => {
    if (status.isPlaying && this.state.playingStatus !== "playing") {
      this.setState({ playingStatus: "playing" });
    } else if (!status.isPlaying && this.state.playingStatus === "playing") {
      this.setState({ playingStatus: "donepause" });
    }
  };

  async _pauseAndPlayRecording() {
    if (this.sound != null) {
      if (this.state.playingStatus == 'playing') {
        this.setState({
          playingStatus: 'donepause',
          isPlaying: false,
        });
        console.log('pausing...');
        await this.sound.pauseAsync();
        console.log('paused!');
      } else {
        console.log('playing...');
        this.setState({
          playingStatus: 'playing',
          isPlaying: true
        });
        await this.sound.playAsync();
        console.log('playing!');
      }

    }
  }

  _syncPauseAndPlayRecording() {
    if (this.sound != null) {
      if (this.state.playingStatus == 'playing') {
        this.sound.pauseAsync();
      } else {
        this.sound.playAsync();
      }
    }
  }

  _playAndPause = () => {
    switch (this.state.playingStatus) {
      case 'nosound':
        this.setState({ loading: true });
        this._playRecording();
        break;
      case 'donepause':
      case 'playing':
        this._pauseAndPlayRecording();
        break;
    }
  }

  toggle_forecast = () => {
    return this.state.isPlaying ? (
      <Text style={styles.textPlaying}>{this.state.playingTag}..</Text>
    ) : (
        <View>
          <Text style={styles.textForcast}>{this.state.forecastTag}</Text>
          <Text style={styles.date}>{this.state.date}</Text>
        </View>
      );
  };

  toggle_image = () => {
    if (this.state.isPlaying) {
      return (
        <Image
          style={styles.playImg}
          source={require("../assets/images/pause.png")}
        />
      );
    }
    else {
      return (this.displayPlayIcon());
    }
  };
  displayPlayIcon() {
    cond = this.state.fishingState;
    console.log("State:    " + cond);
    if (cond == "Safe") {
      return (
        <Image
          style={styles.playImg}
          source={require("../assets/images/play_green.png")}
        />
      );
    }
    else if (cond == "Caution" || cond == "High Waves Alert") {
      return (
        <Image
          style={styles.playImg}
          source={require("../assets/images/play_yellow.png")}
        />
      );
    }
    else {
      return (
        <Image
          style={styles.playImg}
          source={require("../assets/images/play_red.png")}
        />
      );
    }
  }
  logout() {
    Alert.alert(
      'Are you Sure ?',
      "You want to logout ?",
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: 'Yes', onPress: () => {
            console.log('OK Pressed');
            AsyncStorage.setItem(
              "IS_USER_LOGGED_IN",
              JSON.stringify(false)
            );
            this.props.navigation.navigate("register_askLanguage");
          }
        },
      ],
      { cancelable: true }
    )
  }
  showAllSites = () => {
    this.props.navigation.navigate("fishing_site");
  }

  render() {
    if (!this.state.isConnected) {
      return <MiniOfflineSign />;
    } else {
      return (
        <View style={styles.container}>
          {this.headerView()}
          {this.forecastOverlay()}
          {this.mainContent()}
          {this.animateView()}
        </View>
      );
    }
  }

  setCondition() {
    cond = this.state.fishingState;
    if (cond == "Safe") {
      return (
        <View style={[styles.boxCondition]}>
          <Image
            style={[styles.cautionIcon]}
            source={require("../assets/images/safe.png")}
          />
          {this.textCaution1()}
        </View>
      );
    } else if (cond == "Caution" || cond == "High Waves Alert") {
      return (
        <View style={styles.boxCondition}>
          <Image
            style={styles.cautionIcon}
            source={require("../assets/images/caution_small.png")}
          />
          {this.textCaution2()}
        </View>
      );
    } else {
      return (
        <View style={[styles.boxCondition]}>
          <Image
            style={[styles.cautionIcon]}
            source={require("../assets/images/danger.png")}
          />
          {this.textCaution3()}
        </View>
      );
    }
  }
  headerView() {
    return (
      <View style={styles.header}>
        {this.callFrame()}
        <TouchableOpacity style={styles.iconMainLogout} onPress={() => this.logout()}>
          <Image
            style={styles.iconMain}
            source={require("../assets/images/icon_main.png")}
          />
        </TouchableOpacity>
        {this.fishingCenterView()}
      </View>
    );
  }
  fishingCenterView() {
    return (
      <View style={styles.cityBar}>
        {this.landing_site_view()}
        {this.change_site()}
      </View>
    );
  }
  landing_site_view() {
    return (
      <View style={styles.landing_centre_box}>
        <Text style={styles.landing_city_name}>{this.state.cityCenter}</Text>
        <Text style={styles.txtDirection}>
          Your fishing location
                </Text>
      </View>
    );
  }
  change_site() {
    return (
      <TouchableOpacity style={styles.site_change} onPress={this.showAllSites}>
        <Text style={styles.site_changeText}>
          {this.state.changeSiteTag}
        </Text>
      </TouchableOpacity>
    );
  }
  callFrame() {
    return (
      <TouchableOpacity style={styles.btnCall} onPress={this.call}>
        <Image style={styles.btnCallIcon} source={require("../assets/images/call.png")} />
      </TouchableOpacity>
    );
  }
  forecastOverlay() {
    cond = this.state.fishingState;
    if (cond == "Safe") {
      return (
        <LinearGradient
          colors={['#f2f9f8', '#ffffff']}
          style={styles.middleBox}>
          <View style={[styles.overlay, { backgroundColor: '#e5f4f1', borderColor: '#7ec6b8' }]}>
            <TouchableOpacity style={styles.playPause}
              disabled = {this.state.loading}
              onPress={this._playAndPause}
            >
              {this.toggle_image()}
            </TouchableOpacity>
            {this.togglingTab()}
            {this.setCondition()}
          </View>
        </LinearGradient>
      );
    }
    else if (cond == "Caution" || cond == "High Waves Alert") {
      return (this.viewCaution());
    }
    else {
      return (this.viewDanger());
    }
  }
  viewCaution() {
    return (
      <LinearGradient
        colors={['#fff9e6', '#ffffff']}
        style={styles.middleBox}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.playPause}
            onPress={this._playAndPause}
          >
            {this.toggle_image()}
          </TouchableOpacity>
          {this.togglingTab()}
          {this.setCondition()}
        </View>
      </LinearGradient>
    );
  }
  viewDanger() {
    return (
      <LinearGradient
        colors={['#fef6f2', '#ffffff']}
        style={styles.middleBox}>
        <View style={[styles.overlay, { backgroundColor: '#fcece5', borderColor: '#f58674' }]}>
          <TouchableOpacity style={styles.playPause}
            onPress={this._playAndPause}
          >
            {this.toggle_image()}
          </TouchableOpacity>
          {this.togglingTab()}
          {this.setCondition()}
        </View>
      </LinearGradient>
    );
  }
  togglingTab() {
    return <View style={styles.forecastFlex}>{this.toggle_forecast()}</View>;
  }
  mainContent() {
    return this.state.loading ? (
      <View style={[styles.content,{justifyContent:'center'}]}>
        <Image
        style={styles.loaderIcon}
        source={require("../assets/images/loading.png")}
      />
      </View>
    ) : (
      <View style={styles.content}>
        {this.currentDate()}
        {this.rowCurrent()}
        {this.rowWave()}
        {this.rowWind()}
        {this.bottomtab()}
        <Loader loading={this.state.loading} />
      </View>
    );
  }
  currentDate() {
    return (
      <View style={styles.CurrentDateStyle}>
        <Text style={styles.osf_Text}>Ocean State Forecast</Text>
        <Text style={styles.dateText}>{this.state.date}</Text>
      </View>
    );
  }
  textCaution1() {
    return (
      <Text style={[styles.textCondition, { color: "#039073" }]}>
        {this.state.safeTag}
      </Text>
    );
  }
  textCaution2() {
    return <Text style={styles.textCondition}>{this.state.cautionTag}</Text>;
  }
  textCaution3() {
    return (
      <Text style={[styles.textCondition, { color: "#eb1a1a" }]}>
        {this.state.dangerTag}
      </Text>
    );
  }
  rowCurrent() {
    return (
      <View style={styles.infoBox}>
        {this.imgCurrent()}
        {this.textCurrent()}
        {this.valueCurrent()}
        {this.dirCurrent()}
      </View>
    );
  }
  imgCurrent() {
    return (
      <Image
        style={styles.symbolIcons}
        source={require("../assets/images/current.png")}
      />
    );
  }
  textCurrent() {
    return (
      <View style={styles.name_element}>
        <Text style={[styles.symbolName, { color: "#0a4a81" }]}>
          {this.state.currentTag}
          <Text style={styles.symbolUnit}> (km/hr)   </Text>
        </Text>
      </View>
    );
  }
  valueCurrent() {
    return (
      <View style={[styles.name_element, { alignItems: 'center' },]}>
        {this.valueColor(this.state.currentMaxVal)}
        <Text style={styles.minValue}>
          /{this.state.currentMinVal}
        </Text>
      </View>
    );
  }
  dirCurrent() {
    return <Text style={styles.DirectionMain}>{this.state.currentDir}</Text>;
  }
  rowWave() {
    return (
      <View style={styles.infoBox}>
        {this.imgWave()}
        {this.textWave()}
        {this.valueWave()}
        {this.dirWave()}
      </View>
    );
  }
  imgWave() {
    return (
      <Image
        style={styles.symbolIcons}
        source={require("../assets/images/wave.png")}
      />
    );
  }
  textWave() {
    return (
      <View style={styles.name_element}>
        <Text style={[styles.symbolName, { color: "#0088fc" }]}>
          {this.state.waveTag}
          <Text style={styles.symbolUnit}>  (ft)</Text>
        </Text>
      </View>
    );
  }
  valueWave() {
    return (
      <View style={[styles.name_element]}>
        {this.valueColor(this.state.waveMaxVal)}
        <Text style={styles.minValue}>
          /{this.state.waveMinVal}
        </Text>
      </View>
    );
  }
  dirWave() {
    return <Text style={styles.DirectionMain}>{this.state.waveDir}</Text>;
  }
  rowWind() {
    return (
      <View style={styles.infoBox}>
        {this.imgWind()}
        {this.textWind()}
        {this.valueWind()}
        {this.dirWind()}
      </View>
    );
  }
  imgWind() {
    return (
      <Image
        style={styles.symbolIcons}
        source={require("../assets/images/wind.png")}
      />
    );
  }
  textWind() {
    return (
      <View style={styles.name_element}>
        <Text style={[styles.symbolName, { color: "#c9bd75" }]}>
          {this.state.windTag}
          <Text style={styles.symbolUnit}>   (km/hr)  </Text>
        </Text>
      </View>
    );
  }
  valueWind() {
    return (
      <View style={[styles.name_element]}>
        {this.valueColor(this.state.windMaxVal)}
        <Text style={styles.minValue}>
          /{this.state.windMinVal}
        </Text>
      </View>
    );
  }
  dirWind() {
    return <Text style={styles.DirectionMain}>{this.state.windDir}</Text>;
  }

  valueColor(value) {
    cond = this.state.fishingState;
    if (cond == "Safe") {
      return (
        <Text style={[styles.maxValue, { color: '#039073' }]}>
          {value}
        </Text>
      );
    }
    else if (cond == "Caution" || cond == "High Waves Alert") {
      return (
        <Text style={[styles.maxValue]}>
          {value}
        </Text>
      );
    }
    else {
      return (
        <Text style={[styles.maxValue, { color: '#eb1a1a' }]}>
          {value}
        </Text>
      );
    }
  }
  bottomtab() {
    return (
      <View style={styles.flexFooter}>
        <TouchableOpacity
          style={styles.footer}
          onPress={() => {
            this._toggleSubview();
          }}
        >
          {this.imgSwipeUp()}
          <Text style={styles.readMore}>READ MORE</Text>
        </TouchableOpacity>
      </View>
    );
  }
  imgSwipeUp() {
    return (
      <Image
        style={styles.iconSwipeUp}
        source={require("../assets/images/swipe_up.png")}
      />
    );
  }
  animateView() {
    return (
      <Animated.View
        style={[
          styles.subView,
          { transform: [{ translateY: this.state.bounceValue }] }
        ]}
      >
        {this.imgSwipeDown()}
        {this.subScrollview()}
      </Animated.View>
    );
  }
  imgSwipeDown() {
    return (
      <TouchableOpacity
        onPress={() => {
          this._toggleSubview();
        }}
      >
        <Image
          style={styles.iconSwipeDown}
          source={require("../assets/images/swipe_down.png")}
        />
      </TouchableOpacity>
    );
  }
  subScrollview() {
    return (
      <ScrollView style={styles.popIn}>
        <Text style={styles.popInText}>
          {this.state.textInfo}
          {"\n"}
          {"\n"}
        </Text>
        <View style={styles.reviewFlex}>
          {this.reviewQues()}
          {this.userReviewInput()}
        </View>
      </ScrollView>
    );
  }
  reviewQues() {
    return (
      <View style={styles.quesFlex}>
        <Text style={styles.reviewText}>{this.state.reviewTag} </Text>
        <Text style={styles.reviewDate}>
          {this.state.date}
          {"\n"}
          {"\n"}
          {"\n"}
          {"\n"}
        </Text>
      </View>
    );
  }
  userReviewInput() {
    return (
      <View style={styles.reviewUserFlex}>
        <TouchableOpacity
          style={styles.iconNotUseful}
          onPress={() => this.alert_feedback(0)}
        >
          <Image
            style={styles.reviewIcon}
            source={require("../assets/images/unsatisfied.png")}
          />
        </TouchableOpacity>
        {this.iconSatisfied()}
      </View>
    );
  }
  iconSatisfied() {
    return (
      <TouchableOpacity
        style={styles.iconUseful}
        onPress={() => this.alert_feedback(5)}
      >
        <Image
          style={styles.reviewIcon}
          source={require("../assets/images/satisfied.png")}
        />
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  header: {
    backgroundColor: "#ffffff",
    height: heightPercentageToDP("28.4%"),
    width: DEVICE_WIDTH,
  },
  btnCall: {
    position: "absolute",
    right: widthPercentageToDP("5.8%"),
    top: heightPercentageToDP("5.5%"),
    width: widthPercentageToDP("12.7%"),
    height: heightPercentageToDP("7.6%"),
    borderRadius: heightPercentageToDP("6.6%"),

  },
  btnCallIcon: {
    width: widthPercentageToDP("12.7%"),
    height: heightPercentageToDP("7.6%"),

  },
  iconMainLogout: {
    position: "absolute",
    width: widthPercentageToDP("11.7%"),
    height: heightPercentageToDP("6.6%"),
    left: widthPercentageToDP("5.8%"),
    top: heightPercentageToDP("5.5%"),
  },
  iconMain: {
    width: widthPercentageToDP("11.7%"),
    height: heightPercentageToDP("6%"),
  },
  cityBar: {
    flex: 1,
    flexDirection: "row",
    marginTop: heightPercentageToDP("16.1%"),
    alignSelf: 'center',
    width: widthPercentageToDP("92.2%"),
    height: heightPercentageToDP("10.1%"),
    marginBottom: heightPercentageToDP("2.2%"),
    borderRadius: 10.7,
    backgroundColor: '#f0f0f0'
  },
  landing_centre_box: {
    flex: 1,

    width: '50%',
    marginLeft: widthPercentageToDP('6.3%'),
    justifyContent: "center",
  },
  cityBoxRight: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  landing_city_name: {
    color: "#000000",
    fontWeight: 'bold',
    fontSize: 20,
    width: '70%',
    //textAlign: "center"
    //justifyContent: 'center',
    //alignSelf:'flex-s'
  },
  playPause: {
    justifyContent: 'center',
    marginLeft: 10,
    alignItems: 'center',
    width:50,
  },
  currentCityBox: {
    backgroundColor: "#cce9e3",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 50,
    alignItems: "center",
    padding: 2,
    height: 50,
    marginBottom: 20
  },
  txtDirection: {
    fontSize: 16,
    width: '70%',
    color: '#999999',
  },
  currentCityText: {
    color: "#039073",
    fontWeight: "bold",
    fontSize: 20,
    justifyContent: "center",
    width: 140,
    textAlign: "center"
  },
  site_change: {
    width: widthPercentageToDP('20%'),
    height: 40,
    marginRight: widthPercentageToDP('6.1%'),
    fontSize: 8,
    justifyContent: 'center',
    alignSelf: 'center',
    color: '#999999'
  },
  site_changeText: {
    fontSize: 12.5,
    justifyContent: 'center',
    color: '#999999',
    textAlign: 'right',
  },
  flexEmpty: {
    width: DEVICE_WIDTH,
    height: 1
  },

  boxCondition: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    textAlign: 'right',
    width: "40%",
    height: heightPercentageToDP('8%'),
    flex: 1,
    flexDirection: "row"
  },
  textCondition: {
    color: "#f49521",
    fontWeight: "bold",
    fontSize: 16,
    justifyContent: "center",
    width: 80,
    //alignSelf: "center",
    textAlign: 'right',

  },
  forecastFlex: {
    flex: 1,
    marginLeft: 5,
    justifyContent: 'center',

  },
  boxForcast: {
    backgroundColor: "#fff",

    alignItems: "center",
    flex: 1,
    flexDirection: "row",
  },
  cautionIcon: {
    width: 30,
    height: 30
  },
  playImg: {
    width: 16,
    height: 20,
    marginLeft: 10
  },
  textPlaying: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
    width: 150
  },
  textForcast: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16,
    width: 150
  },
  middleBox: {
    width: DEVICE_WIDTH,
    height: heightPercentageToDP('45.8%'),
    zIndex: 1,
  },

  overlay: {
    flex: .25,
    flexDirection: 'row',
    borderRadius: 15,
    borderColor: '#facb83',
    backgroundColor: '#fff4cf',
    borderWidth: 1.3,
    marginTop: heightPercentageToDP('4.1%'),
    width: widthPercentageToDP('83.5%'),
    alignSelf: 'center',
    height: heightPercentageToDP('9.6%'),
    justifyContent: 'center',
    elevation: 5,
  },
  CurrentDateStyle: {
    alignSelf: "flex-start",
    marginLeft: 20,
    width: "40%"
  },
  dateText: {
    fontWeight: "bold",
    fontSize: 10,
    color: "#999999"
  },
  osf_Text: {
    fontWeight: "bold",
    fontSize: 16,
    width: widthPercentageToDP('50%'),
    marginTop: 10
  },
  name_element: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',

  },
  maxValue: {
    fontSize: 26,
    color: '#f49420',
    textAlign: 'right',
    width: widthPercentageToDP('15%'),
    //marginLeft: widthPercentageToDP('4%'),
  },
  minValue: {
    fontSize: 18,
    color: '#999999',
    textAlign: 'center',
    marginTop: 3,
    textAlignVertical: 'bottom',
  },
  container: {
    backgroundColor: "#fff",
    flex: 1,
    alignItems: "center",
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600"
  },
  content: {
    width: widthPercentageToDP('92.2%'),
    position: "absolute",
    alignSelf: 'center',
    height: heightPercentageToDP("55.5%"),
    top: heightPercentageToDP('46.6%'),
    backgroundColor: "#fff",
    zIndex: 2,
    flex: 1,
    alignItems: "center",
    borderRadius: 10,
    borderColor: '#f2f2f2',
    borderWidth: 1,
    justifyContent: "space-between"
  },
  symbolIcons: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginTop: 4
  },
  loaderIcon: {
    width: 80,
    height: 80,
  },
  symbolName: {
    textAlignVertical: "center",
    fontWeight: "bold",
    fontSize: 18,
    marginRight: 3,
    marginLeft: 10,
  },
  symbolUnit: {
    fontSize: 14,
    color: '#999999'
  },
  symbolValue: {
    textAlignVertical: "center",
    textAlign: "center",
    color: "#f49521",
    fontWeight: "bold",
    fontSize: 16,
    width: 130
  },
  DirectionMain: {
    textAlignVertical: "center",
    textAlign: "right",
    color: "#7f7f7f",
    fontWeight: "bold",
    fontSize: 16,
    borderRadius: 10,
    width: widthPercentageToDP('15%'),
    backgroundColor: '#ebebeb',
    textAlign: 'center',
  },
  infoBox: {
    height: 50,
    backgroundColor: "#fff",
    width: "95%",
    flexDirection: "row",
    paddingLeft: 3,
    paddingRight: 3,
    alignItems: "center",
    justifyContent: "space-between"
  },
  flexFooter: {
    height: 70,
    width: DEVICE_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0
  },
  iconSwipeUp: {
    width: 50,
    height: 20,
    alignSelf: "center"
  },
  iconSwipeDown: {
    width: 50,
    height: 50,
    alignSelf: "center",
    marginBottom: 10
  },
  readMore: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  footer: {
    height: 70,
    width: DEVICE_WIDTH,
    justifyContent: "center"
  },
  footerText: {
    color: "#fff",
    fontSize: 16
  },
  subView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "#FFFFFF",
    height: SUB_VIEW
  },
  popIn: {
    height: "75%",
    padding: 30
  },
  popInText: {
    fontSize: 16,
    lineHeight: 30,
    alignSelf: "center"
  },
  reviewFlex: {
    flex: 0.5,
    paddingRight: 2,
    flexDirection: "row"
    //justifyContent: 'space-between',
  },
  reviewText: {
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 30
  },
  reviewDate: {
    fontSize: 12,
    color: "#626262"
  },
  quesFlex: {
    width: "65%"
  },
  reviewUserFlex: {
    flex: 1,
    flexDirection: "row",
    width: 100,
    justifyContent: "center"
  },
  reviewIcon: {
    width: 30,
    height: 30,
    alignSelf: "center"
  },
  iconNotUseful: {
    height: 50,
    width: 50,
    borderRadius: 50,
    backgroundColor: "#ffe3e1",
    alignItems: "center",
    justifyContent: "center"
  },
  iconUseful: {
    height: 50,
    width: 50,
    borderRadius: 50,
    marginLeft: 3,
    backgroundColor: "#def5e9",
    alignItems: "center",
    justifyContent: "center"
  },
  offlineContainer: {
    flex: 1
  },
  offlineNotification: {
    backgroundColor: "#b52424",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: DEVICE_WIDTH,
    position: "absolute",
    bottom: 10
  },
  offlineText: {
    color: "#fff",
    fontSize: 16
  },
  offlineIconContainer: {
    height: "90%",
    width: DEVICE_WIDTH,
    alignItems: "center",
    justifyContent: "center"
  },
  offlineIcon: {
    width: 80,
    height: 82
  }
});
