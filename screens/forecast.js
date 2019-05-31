import React, { Component } from 'react';
import { StyleSheet, Button, Text, ScrollView, TextInput, View, Dimensions, Image, TouchableOpacity, AppRegistry, TouchableHighlight, Animated, Alert, NetInfo, AsyncStorage } from 'react-native';
import { Assets, Constants, Audio } from 'expo'
import { StackNavigator } from 'react-navigation';
import { Overlay } from 'react-native-maps';
import call from 'react-native-phone-call';
import Loader from '../components/util/loader';
import request from '../components/util/apirequest';
import APIConfig from '../components/config/APIconfig';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';
import getObjectForKey from '../components/util/title.localization';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const OVERLY_LEN = .3 * DEVICE_HEIGHT;
const SUB_VIEW = .67 * DEVICE_HEIGHT;
const source = {
    uri: 'http://guru.southindia.cloudapp.azure.com/OSF_Telugu_1780731751869209131.wav',
};
const acknowledgementText = 'Thanks for your feedback !';

function MiniOfflineSign() {
    Alert.alert("Please check your internet connection !");
    return (
        <View style={styles.offlineContainer}>
            <View style={styles.offlineNotification}>
                <Text style={styles.offlineText}>No Internet Connection</Text>
            </View>
            <View style={styles.offlineIconContainer}>
                <Image style={styles.offlineIcon}
                    source={require('../assets/images/no_connection.png')}
                />
            </View>
        </View>
    );
}
var isHidden = true;
var toValue;

const alert_feedback = () => {
    var response = request(
        APIConfig.Base_URL + APIConfig.User_Feedback,
        data
      );
    Alert.alert(acknowledgementText);
}


export default class forecast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bounceValue: new Animated.Value(SUB_VIEW),
            showComponmentB: false,  //This is the initial position of the subview
            playingStatus: "nosound",
            isConnected: true,
            gestureName: 'none',
            loading: false,
            isSafe: false,
            currentVal: '12-4km/hr',
            currentDir: 'NNW',
            waveVal: '9-4ft',
            waveDir: 'NN',
            windVal: '50-31 km/hr',
            windDir: 'NNE',
            textInfo: 'something something',
            date: '14th May, 2019',
            selected_site: [],
            selected_state: '',
            landing_sites: [],
            number_sites: [],
            site_all: [],
            cityCenterCount: 0,
            leftCityDistance: 0,
            rightCityDistance: 0,
            forecastTag: '',
            cautionTag: '',
            playingTag: '',
            currentTag: '',
            safeTag: '',
            dangerTag: '',
            waveTag: '',
            windTag: '',
            language: '',
            fishingState: '',
            fishingStateFlag: '',
            landing_site_id:'',
        };
    }

    async componentWillMount() {
        console.log('Reached forecast');
        const { navigation } = this.props;
        var site_id = '';
        var selected_site_array = [];
        var state = "";
        var lat;
        var lon;
        //const lat = this.state.latitude_site;
        //const lon = this.state.longitude_site;
        try {
            lat = await AsyncStorage.getItem('DEFAULT_LAT');
            lon = await AsyncStorage.getItem('DEFAULT_LONG');
        } catch (error) {
            // Error retrieving data
        }
        console.log(lat + "   " + lon);
        var coordinates = {
            "latitude": lat,
            "longitude": lon
        };
        var dataSource = await request("http://104.211.204.132/osf/engine/get_nearest_landing_centres/", coordinates);
        console.log("Return Value: " + dataSource);
        if (dataSource == "timeout of 60000ms exceeded") {
            Alert.alert('Please try after some time');
        } else {
            selected_site_array = dataSource[0];
            state = dataSource[0].state;
            site_id = dataSource[0].landing_centre_ID;
        }
        var received_site = navigation.getParam('Selected_Site');
        var received_state = navigation.getParam('Selected_State');
        if (received_site !== null) {
            selected_site_array = received_site;
            site_id = received_site.landing_centre_ID;
            state = received_state;
        }
        console.log("slected state reached: " + state);
        const number_fish_sites = landing_sites_array.length;
        this.setState({ selected_site: selected_site_array, landing_sites: dataSource, number_sites: number_fish_sites, selected_state: state, landing_centre_ID:site_id});
        this.apiCallForForecast();
    }

    async apiCallForForecast(currentCity, currentState) {
        //this.state.loading = true;
        var lang;
        try {
            //console.log("Label"+ JSON.stringify(sText));
            lang = await AsyncStorage.getItem('DEFAULT_LANGUAGE');
        } catch (error) {
            // Error retrieving data
        }
        console.log("Language is: " + lang);
        console.log("Enquired city:" + currentCity);
        console.log("Enquired state:" + currentState);
        var data = {
            "state": currentState,
            "landing_centre": currentCity,
            "language": lang
        };
        console.log("Request Body: " + JSON.stringify(data));
        response = await request("http://104.211.204.132/osf/engine/get_osf/", data);

        console.log("Data: " + JSON.stringify(response.data[0]));
        var cond = response.data[0].flag;
        console.log("Condition is: " + cond);
        console.log("Condition in state: " + this.state.centerState);
        this.state.currentVal = response.data[0].min_current_speed_kmph + "-" + response.data[0].max_current_speed_kmph + " km/hr";
        this.state.currentDir = response.data[0].current_direction;
        this.state.waveVal = response.data[0].min_wave_height_feet + "-" + response.data[0].max_wave_height_feet + " ft";
        this.state.waveDir = response.data[0].wave_direction;
        this.state.windVal = response.data[0].min_wind_speed_kmph + "-" + response.data[0].max_wind_speed_kmph + " km/hr";
        this.state.windDir = response.data[0].wind_direction;
        this.state.fishingState = cond;
        this.state.textInfo = response.text;
        this.state.date = response.data[0].date;
        AsyncStorage.setItem(
            "DEFAULT_FORECAST_STATE",
            cond
        );
        this.setState({ loading: false });
        console.log("Loading state: " + this.state.loading);
    }

    async  componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        this.setState({ loading: true });
        for (i = 0; i < this.state.number_sites; i++) {
            if (this.state.selected_site[0].landing_centre == this.state.landing_sites[i].landing_centre) {
                this.state.cityCenterCount = i;
                break;
            }
        }
        await this.apiCallForForecast(this.state.selected_site[0].landing_centre, this.state.selected_state);
        this.setState({ loading: true });
        var labelForecast = await getObjectForKey('Forecast_OSF_Title');
        var labelCaution = await getObjectForKey('Forecast_State_Caution');
        var labelPlaying = await getObjectForKey('Forecast_Audio_playing');
        var labelCurrent = await getObjectForKey('Forecast_Component_Current');
        var labelWave = await getObjectForKey('Forecast_Component_Wave');
        var labelWind = await getObjectForKey('Forecast_Component_Wind');
        var labelHelpful = await getObjectForKey('Forecast_User_Review_Title');
        var labelSafe = await getObjectForKey('Forecast_State_Safe');
        var labelDanger = await getObjectForKey('Forecast_State_Danger');

        this.setState({
            cityLeft: this.state.landing_sites[(this.state.cityCenterCount + (this.state.number_sites - 1)) % this.state.number_sites].landing_centre,
            leftCityDistance: this.state.landing_sites[(this.state.cityCenterCount + (this.state.number_sites - 1)) % this.state.number_sites].distance_km,
            cityRight: this.state.landing_sites[(this.state.cityCenterCount + (this.state.number_sites + 1)) % this.state.number_sites].landing_centre,
            rightCityDistance: this.state.landing_sites[(this.state.cityCenterCount + (this.state.number_sites + 1)) % this.state.number_sites].distance_km,
            cityCenter: this.state.landing_sites[this.state.cityCenterCount].landing_centre,
            dangerTag: labelDanger,
            safeTag: labelSafe,
            forecastTag: labelForecast,
            cautionTag: labelCaution,
            playingTag: labelPlaying,
            currentTag: labelCurrent,
            waveTag: labelWave,
            windTag: labelWind,
            reviewTag: labelHelpful,
        });
        this.setState({ loading: false });
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }

    handleConnectivityChange = isConnected => {
        if (isConnected) {
            this.setState({ isConnected });
        } else {
            this.setState({ isConnected });
        }
    };
    static navigationOptions = {
        header: null
    }

    _toggleSubview() {
        if (!isHidden) {
            toValue = DEVICE_HEIGHT;
        }
        if (isHidden) {
            toValue = 0;
        }

        _toggleShow = () => {
            this.setState({ showComponmentB: !this.state.showComponmentB })
        }

        //This will animate the transalteY of the subview between 0 & 100 depending on its current state
        //100 comes from the style below, which is the height of the subview.
        Animated.spring(
            this.state.bounceValue,
            {
                toValue: toValue,
                velocity: 3,
                tension: 2,
                friction: 8,
            }
        ).start();

        isHidden = !isHidden;
    }

    call = () => {
        const args = {
            number: '18004198800',
            prompt: true,
        };

        call(args).catch(console.error);
    };



    async _playRecording() {
        const { sound } = await Audio.Sound.create(
            source,
            {
                shouldPlay: true,
                isLooping: true,
            },
            this._updateScreenForSoundStatus,
        );
        this.setState({ loading: false });
        this.sound = sound;
        this.setState({
            isPlaying: 'true'
        });
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
            <Text style={styles.textPlaying}>
                {this.state.playingTag}..
        </Text>) :
            <View>
                <Text style={styles.textForcast}>
                    {this.state.forecastTag}
                </Text>
            </View>
    }

    toggle_image = () => {
        return this.state.isPlaying ? (
            <Image style={styles.playImg}
                source={require('../assets/images/pause.png')}
            />) :
            <Image style={styles.playImg}
                source={require('../assets/images/play_green.png')}
            />
    }

    onSwipeUp(gestureState) {
        this.setState({ myText: 'You swiped up!' });
    }

    onSwipeDown(gestureState) {
        this.setState({ myText: 'You swiped down!' });
    }

    async onSwipeLeft() {
        var currentCount = this.state.cityCenterCount;
        currentCount = (currentCount + 1) % this.state.number_sites;
        this.setState({
            cityLeft: this.state.landing_sites[(currentCount + (this.state.number_sites - 1)) % this.state.number_sites].landing_centre,
            leftCityDistance: this.state.landing_sites[(currentCount + (this.state.number_sites - 1)) % this.state.number_sites].distance_km,
            cityRight: this.state.landing_sites[(currentCount + 1) % this.state.number_sites].landing_centre,
            rightCityDistance: this.state.landing_sites[(currentCount + 1) % this.state.number_sites].distance_km,
            cityCenter: this.state.landing_sites[currentCount].landing_centre,
        });
        this.setState({ loading: true });
        console.log("Loader state: " + this.state.loading);
        var centerCity = this.state.landing_sites[currentCount].landing_centre;
        var centerState = this.state.landing_sites[currentCount].state;
        this.state.cityCenterCount = currentCount;
        await this.apiCallForForecast(centerCity, centerState);
        this.setState({ loading: false });
    }

    async onSwipeRight() {
        var currentCount = this.state.cityCenterCount;
        currentCount = (currentCount + (this.state.number_sites - 1)) % this.state.number_sites;
        this.setState({
            cityLeft: this.state.landing_sites[(currentCount + (this.state.number_sites - 1)) % this.state.number_sites].landing_centre,
            leftCityDistance: this.state.landing_sites[(currentCount + (this.state.number_sites - 1)) % this.state.number_sites].distance_km,
            cityRight: this.state.landing_sites[(currentCount + 1) % this.state.number_sites].landing_centre,
            rightCityDistance: this.state.landing_sites[(currentCount + 1) % this.state.number_sites].distance_km,
            cityCenter: this.state.landing_sites[currentCount].landing_centre,
        });
        var centerCity = this.state.landing_sites[currentCount].landing_centre;
        var centerState = this.state.landing_sites[currentCount].state;
        this.setState({ loading: true });
        this.state.cityCenterCount = currentCount;
        await this.apiCallForForecast(centerCity, centerState);
        this.setState({ loading: false });
    }

    onSwipe(gestureName, gestureState) {
        const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
        this.setState({ gestureName: gestureName });
        switch (gestureName) {
            case SWIPE_UP:
                console.log('Swiped');
                break;
            case SWIPE_DOWN:
                console.log('Swiped');
                break;
            case SWIPE_LEFT:
                console.log('');
                break;
            case SWIPE_RIGHT:
                console.log('');
                break;
        }
    }

    render() {
        const { navigation } = this.props;
        const config = {
            velocityThreshold: 0.3,
            directionalOffsetThreshold: 100
        };
        var { navigate } = this.props.navigation;
        if (!this.state.isConnected) {
            return <MiniOfflineSign />;
        }
        else {
            return (
                <GestureRecognizer
                    onSwipe={(direction, state) => this.onSwipe(direction, state)}
                    onSwipeLeft={(state) => this.onSwipeLeft()}
                    onSwipeRight={(state) => this.onSwipeRight()}
                    config={config}
                    style={{
                        flex: 1,
                        backgroundColor: this.state.backgroundColor
                    }}>

                    {this.completeScreen()}
                </GestureRecognizer>
            );
        }
    }
    completeScreen() {
        return (
            <View style={styles.container}>
                {this.headerView()}
                {this.forcastOverlay()}
                {this.mainContent()}
                {this.animateView()}
            </View>
        );
    }

    setCondition() {
        cond = this.state.fishingState;
        console.log("State:    " + cond);
        if (cond == "Safe") {
            return (
                <View style={[styles.boxCondition, { backgroundColor: '#cce9e3' }]}>
                    <Image style={[styles.cautionIcon, { height: 40, width: 40 }]}
                        source={require('../assets/images/safe.png')}
                    />
                    {this.textCaution1()}
                </View>
            );
        }
        else if (cond == "Caution" || cond == "High Wave Alert") {
            return (
                <View style={[styles.boxCondition, { backgroundColor: '#fff4cf' }]}>
                    <Image style={styles.cautionIcon}
                        source={require('../assets/images/caution_small.png')}
                    />
                    {this.textCaution2()}
                </View>
            );
        }
        else {
            return (
                <View style={[styles.boxCondition, { backgroundColor: '#fbdada' }]}>
                    <Image style={[styles.cautionIcon, { height: 40, width: 40 }]}
                        source={require('../assets/images/danger.png')}
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
                <Image style={styles.iconMain}
                    source={require('../assets/images/icon_main.png')}
                />
                {this.allCityView()}
            </View>
        );
    }
    allCityView() {
        return (
            <View style={styles.cityBar}>
                {this.leftCityFrame()}
                {this.LeftCityIcon()}
                <View style={styles.currentCityBox}>
                    <Text adjustsFontSizeToFit style={styles.currentCityText}>
                        {this.state.cityCenter}  </Text>
                </View>
                {this.rightCityIcon()}
                {this.rightCityFrame()}
            </View>
        );
    }
    leftCityFrame() {
        return (
            <TouchableOpacity style={styles.cityBoxLeft} onPress={this.onSwipeRight}>
                <Text style={styles.otherCityText}>
                    {this.state.cityLeft}
                </Text>
                <Text style={styles.txtDirection} >
                    {this.state.leftCityDistance} Km
                </Text>
            </TouchableOpacity>
        );
    }
    LeftCityIcon() {
        return (
            <TouchableOpacity >
                <Image style={[styles.cityChangeArrow, { marginRight: 5 }]}
                    source={require('../assets/images/left.png')}
                />
            </TouchableOpacity>
        );
    }
    rightCityFrame() {
        return (
            <TouchableOpacity style={styles.cityBoxRight}>
                <Text style={styles.otherCityText}>
                    {this.state.cityRight}
                </Text>
                <Text style={styles.txtDirection}>
                    {this.state.rightCityDistance} Km
                            </Text>
            </TouchableOpacity>
        );
    }
    rightCityIcon() {
        return (
            <TouchableOpacity >
                <Image style={[styles.cityChangeArrow, { marginLeft: 5 }]}
                    source={require('../assets/images/right.png')}
                />
            </TouchableOpacity>
        );
    }
    callFrame() {
        return (
            <TouchableOpacity style={styles.btnCall} onPress={this.call}>
                <Image
                    source={require('../assets/images/call.png')}
                />
            </TouchableOpacity>
        );
    }
    forcastOverlay() {
        return (
            <View style={styles.overlay} >
                <TouchableOpacity style={styles.boxForcast}
                    onPress={this._playAndPause}>
                    {this.toggle_image()}
                    {this.togglingTab()}
                </TouchableOpacity>
            </View>
        );
    }
    togglingTab() {
        return (
            <View style={styles.forecastFlex}>
                {this.toggle_forecast()}
            </View>
        );
    }
    mainContent() {
        return (
            <View style={styles.content}>
                <View style={styles.flexEmpty}>
                </View>
                {this.currentDate()}
                {this.warningStatus()}
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
                <Text style={styles.dateText}>
                    {this.state.date}
                </Text>
            </View>
        );
    }
    warningStatus() {
        return (
            <View style={styles.flexCondition}>
                {this.setCondition()}
            </View>
        );

    }
    textCaution1() {
        return (
            <Text style={[styles.textCondition, { color: '#039073' }]}>
                {this.state.safeTag}
            </Text>
        );
    }
    textCaution2() {
        return (
            <Text style={styles.textCondition}>
                {this.state.cautionTag}
            </Text>
        );
    }
    textCaution3() {
        return (
            <Text style={[styles.textCondition, { color: '#eb1a1a' }]}>
                {this.state.dangerTag}
            </Text>
        );
    }
    rowCurrent() {
        return (
            <View style={styles.infoBox}>
                {this.imgCurrent()}
                <Text style={[styles.symbolName, { color: '#0a4a81' }]}>{this.state.currentTag}</Text>
                <Text style={styles.symbolValue}>{this.state.currentVal}</Text>
                {this.dirCurrent()}
            </View>
        );
    }
    imgCurrent() {
        return (
            <Image style={styles.symbolIcons}
                source={require('../assets/images/current.png')}
            />
        );
    }
    dirCurrent() {
        return (
            <Text style={styles.DirectionMain}>{this.state.currentDir}</Text>
        );
    }
    rowWave() {
        return (
            <View style={styles.infoBox} >
                {this.imgWave()}
                <Text style={[styles.symbolName, { color: '#0088fc' }]}>{this.state.waveTag}</Text>
                <Text style={styles.symbolValue}>{this.state.waveVal}</Text>
                {this.dirWave()}
            </View>
        );
    }
    imgWave() {
        return (
            <Image style={styles.symbolIcons}
                source={require('../assets/images/wave.png')}
            />
        );
    }
    dirWave() {
        return (
            <Text style={styles.DirectionMain}>{this.state.waveDir}</Text>
        );
    }
    rowWind() {
        return (
            <View style={styles.infoBox} >
                {this.imgWind()}
                <Text style={[styles.symbolName, { color: '#c9bd75' }]}>{this.state.windTag}</Text>
                <Text style={styles.symbolValue}>{this.state.windVal}</Text>
                {this.dirWind()}
            </View>
        );
    }
    imgWind() {
        return (
            <Image style={styles.symbolIcons}
                source={require('../assets/images/wind.png')}
            />
        );
    }
    dirWind() {
        return (
            <Text style={styles.DirectionMain}>{this.state.windDir}</Text>
        );
    }
    bottomtab() {
        return (
            <View style={styles.flexFooter}>
                <TouchableOpacity style={styles.footer} onPress={() => { this._toggleSubview() }}>
                    {this.imgSwipeUp()}
                </TouchableOpacity>
            </View>
        );
    }
    imgSwipeUp() {
        return (
            <Image style={styles.iconSwipeUp}
                source={require('../assets/images/swipe_up.png')}
            />
        );
    }
    animateView() {
        return (
            <Animated.View
                style={[styles.subView,
                { transform: [{ translateY: this.state.bounceValue }] }]}
            >
                {this.imgSwipeDown()}
                {this.subScrollview()}
            </Animated.View>
        );
    }
    imgSwipeDown() {
        return (
            <TouchableOpacity onPress={() => { this._toggleSubview() }}>
                <Image style={styles.iconSwipeDown}
                    source={require('../assets/images/swipe_down.png')}
                />
            </TouchableOpacity>
        );
    }
    subScrollview() {
        return (
            <ScrollView style={styles.popIn}>
                <Text style={styles.popInText}>{this.state.textInfo}{"\n"}{"\n"}</Text>
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
                <Text style={styles.reviewDate}>{this.state.date}{"\n"}{"\n"}{"\n"}{"\n"}</Text>
            </View>
        );
    }
    userReviewInput() {
        return (
            <View style={styles.reviewUserFlex}>
                <TouchableOpacity style={styles.iconNotUseful} onPress={alert_feedback(0)}>
                    <Image style={styles.reviewIcon}
                        source={require('../assets/images/unsatisfied.png')}
                    />
                </TouchableOpacity>
                {this.iconSatisfied()}
            </View>
        );
    }
    iconSatisfied() {
        return (
            <TouchableOpacity style={styles.iconUseful} onPress={alert_feedback(5)}>
                <Image style={styles.reviewIcon}
                    source={require('../assets/images/satisfied.png')}
                />
            </TouchableOpacity>
        );
    }
}
const styles = StyleSheet.create({
    btnCall: {
        position: 'absolute',
        right: 30,
        top: 40,
        width: 60,
        height: 60,
    },
    iconMain: {
        width: 60,
        height: 60,
        marginLeft: 30,
        marginTop: 35,
    },
    cityBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cityBoxLeft: {
        flex: 1,
        height: 50,
        marginLeft: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cityBoxRight: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otherCityText: {
        color: '#000000',
        //fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
        //justifyContent: 'center',
        //alignSelf:'flex-s'
    },
    currentCityBox: {
        backgroundColor: '#cce9e3',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        alignItems: 'center',
        padding: 2,
        height: 50,
        marginBottom: 20,
    },
    txtDirection: {
        textAlign: 'center',
        fontSize: 14,
    },
    currentCityText: {
        color: '#039073',
        fontWeight: 'bold',
        fontSize: 20,
        justifyContent: 'center',
        width: 140,
        textAlign: 'center'
    },
    cityChangeArrow: {
        width: 10,
        height: 40,
        marginBottom: 20,
    },
    flexEmpty: {
        width: DEVICE_WIDTH,
        height: 1,
    },
    flexCondition: {
        width: DEVICE_WIDTH,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },

    boxCondition: {
        backgroundColor: '#fff4cf',
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 50,
        alignItems: 'center',
        width: '50%',
        height: 100,
        flex: 1,
        flexDirection: 'row',
    },
    textCondition: {
        color: '#f49521',
        fontWeight: 'bold',
        fontSize: 20,
        justifyContent: 'center',
        width: 120,
        paddingLeft: 20,
        alignSelf: 'center'
    },
    forecastFlex: {
        flex: 1,
        marginLeft: 20,
        backgroundColor: '#ffffffff',
    },
    boxForcast: {
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 20,
        borderRadius: 50,
        borderColor: '#f4f4f4',
        borderWidth: 3,
        flex: 1,
        flexDirection: 'row',
        padding: 20,
    },
    cautionIcon: {
        width: 20,
        height: 20,
    },
    playImg: {
        width: 16,
        height: 20,
        marginLeft: 10
    },
    textPlaying: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18,
        width: 150,
    },
    textForcast: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 18,
        width: 150,
    },
    overlay: {
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        position: 'relative',
        zIndex: 1,
        marginTop: -40,
        marginLeft: 20,
        marginRight: 20,
        width: '50%',
        height: 60,
    },
    CurrentDateStyle: {
        alignSelf: 'flex-start',
        marginLeft: 20,
        width: '40%',
    },
    dateText: {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#5D4E4F'
    },
    container: {
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        width: DEVICE_WIDTH,
        height: DEVICE_HEIGHT,
    },
    header: {
        backgroundColor: '#f2f2f2',
        height: '40%',
        paddingTop: 10,
        width: DEVICE_WIDTH,
    },
    headerText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    content: {
        width: DEVICE_WIDTH,
        backgroundColor: '#fff',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    symbolIcons: {
        width: 40,
        height: 40,
        marginTop: 4
    },
    symbolName: {
        textAlignVertical: 'center',
        fontWeight: 'bold', fontSize: 16, width: 60, marginLeft: 5
    },
    symbolValue: {
        textAlignVertical: 'center',
        textAlign: 'center',
        color: '#f49521',
        fontWeight: 'bold',
        fontSize: 16,
        width: 130,
    },
    DirectionMain: {
        textAlignVertical: 'center',
        textAlign: 'right',
        color: '#7f7f7f',
        fontWeight: 'bold',
        fontSize: 16,
        width: 50,
        marginLeft: 10,
    },
    infoBox: {
        height: 50,
        backgroundColor: '#fff',
        width: '90%',
        borderRadius: 10,
        borderColor: '#f2f2f2',
        borderWidth: 1,
        flexDirection: 'row',
        paddingLeft: 7,
        paddingRight: 7,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    flexFooter: {
        height: 70,
        width: DEVICE_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 0,
    },
    iconSwipeUp: {
        width: 50,
        height: 50,
        alignSelf: 'center',
    },
    iconSwipeDown: {
        width: 50,
        height: 50,
        alignSelf: 'center',
        marginBottom: 10
    },
    footer: {
        height: 70,
        width: DEVICE_WIDTH,
        justifyContent: 'center',
    },
    footerText: {
        color: '#fff',
        fontSize: 16
    },
    subView: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        backgroundColor: "#FFFFFF",
        height: SUB_VIEW,
    },
    popIn: {
        height: '75%',
        padding: 30,

    },
    popInText: {
        fontSize: 16,
        lineHeight: 30,
        alignSelf: 'center'
    },
    reviewFlex: {
        flex: .5,
        paddingRight: 2,
        flexDirection: 'row',
        //justifyContent: 'space-between',
    },
    reviewText: {
        fontSize: 12,
        fontWeight: 'bold',
        lineHeight: 30,
    },
    reviewDate: {
        fontSize: 12,
        color: '#626262',
    },
    quesFlex: {
        width: '65%',
    },
    reviewUserFlex: {
        flex: 1,
        flexDirection: 'row',
        width: 100,
        justifyContent: 'center'
    },
    reviewIcon: {
        width: 30,
        height: 30,
        alignSelf: 'center'
    },
    iconNotUseful: {
        height: 50,
        width: 50,
        borderRadius: 50,
        backgroundColor: '#ffe3e1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconUseful: {
        height: 50,
        width: 50,
        borderRadius: 50,
        marginLeft: 3,
        backgroundColor: '#def5e9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    offlineContainer: {
        flex: 1,
    },
    offlineNotification: {
        backgroundColor: '#b52424',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: DEVICE_WIDTH,
        position: 'absolute',
        bottom: 10
    },
    offlineText: {
        color: '#fff',
        fontSize: 16,
    },
    offlineIconContainer: {
        height: '90%',
        width: DEVICE_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
    },
    offlineIcon: {
        width: 80,
        height: 82,
    },
});












