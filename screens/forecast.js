import React, { Component } from 'react';
import { StyleSheet, Button, Text, ScrollView, TextInput, View, Dimensions, Image, TouchableOpacity, AppRegistry, TouchableHighlight, Animated, Alert, NetInfo } from 'react-native';
import { Assets, Constants, Audio } from 'expo'
import { StackNavigator } from 'react-navigation';
import { Overlay } from 'react-native-maps';
import call from 'react-native-phone-call';
import Loader from '../components/util/loader';
import request from '../components/util/apirequest';
import APIConfig from '../components/config/APIconfig';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const OVERLY_LEN = .3 * DEVICE_HEIGHT;
const SUB_VIEW = .67 * DEVICE_HEIGHT;
const source = {
    uri: 'https://s3.amazonaws.com/exp-us-standard/audio/playlist-example/Comfort_Fit_-_03_-_Sorry.mp3',
};

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
var cityNames = ["Karaikal", "Nagapatinam", "Vedarnyam", "Poompuhar"];
var cityLeftCount = 0;
var cityRightCount = 2;
var cityCenterCount = 1;
var cityHiddenCount = 3;
var cityDirection = [];

const alert_feedback = () => {
    Alert.alert(
        'Thanks for your feedback!'
    )
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
            cityNames: ["Karaikal", "Nagapatinam", "Vedarnyam", "Poompuhar"],

        };
    }

    async componentWillMount() {
        const { navigation } = this.props;
        const selCity = navigation.getParam('cityOBJ', 'NO-VAL');
        console.log(JSON.stringify(selCity));
        this.setState.loading=true;
        await this.apiCallForForecast(selCity);
    }

    async apiCallForForecast(selCity) {
        var data = {
            "state": "Gujarat",
            "landing_centre": selCity,
            "language": "Gujarati",
        };
        console.log("Request Body: " + JSON.stringify(data));
        //var stubresponse = await request("http://10.160.64.65/osf/engine/get_osf/", data);
        var stubresponse = {
            "data": [{
                "state": "GUJARAT",
                "district": "Kachchh",
                "landing centre": "Lakhapat",
                "engine_data": {
                    "date": "24th May, 2019",
                    "current": {
                        "max_speed_kmph": 25,
                        "min_speed_kmph": 2,
                        "direction_deg": "NNW"
                    },
                    "wind": {
                        "max_speed_kmph": 23,
                        "min_speed_kmph": 1,
                        "direction_deg": "NNW"
                    },
                    "wave": {
                        "max_height_ft": 4,
                        "min_height_ft": 5,
                        "direction_deg": "NNE"
                    }
                }
            }],
            "text": "નમસ્કાર વેરાવળ વિસ્તારના સાગરખેડુ મિત્રો માટે ઇન્કોઇસ અને રીલાયન્સ ફાઉન્ડેશન દ્વારા સમુદ્રની સ્થીતિ વિષેની માહીતી Lakhapat. આવતીકાલ 2019-03-14 ના રોજ 100 કિલોમીટર સુધી પવનની ઝડપ 5.0 થી 24.0 કીમી પ્રતિ કલાકે NNW દીશાની રહેશે . મહત્તમ પવનની ઝડપ સાંજના 5:30 કલાકે રહેશે સમુદ્રના મોજાની ઉંચાઇ 1.0 થી 3.0 ફૂટ અને દિશા NNE ની  રહેશે, મહત્તમ મોજા ની ઊંચાઈ રાત્રિના 11:30 કલાકે રહેશે. પાણીનો પ્રવાહ 1.0 થી 24.0 સેમી   દિશાનો રહેશે NNW. ઇન્કોઇસ દ્વારા આ માહિતીનો સ્ત્રોત મળેલ છે. વધુ માહિતી માટે રિલાયંસ ફાઉન્ડેશનના ટોલ ફ્રી નબર ૧૮૦૦ ૪૧૯ ૮૮૦૦ ઉપર સંપર્ક કરવા વિનતી સમુદ્રમાં પ્રવેશવાનું સલામત છે અને સમુદ્રની સ્થિતિ શાંત થઈ જશે"

        }
        this.setState.loading=false;
        this.state.currentVal = stubresponse.data[0].engine_data.current.max_speed_kmph + "-" + stubresponse.data[0].engine_data.current.min_speed_kmph + " km/hr";
        this.state.currentDir = stubresponse.data[0].engine_data.current.direction_deg;
        this.state.waveVal = stubresponse.data[0].engine_data.wave.max_height_ft + "-" + stubresponse.data[0].engine_data.wave.min_height_ft+ " ft";
        this.state.waveDir = stubresponse.data[0].engine_data.wave.direction_deg;
        this.state.windVal = stubresponse.data[0].engine_data.wind.max_speed_kmph + "-" + stubresponse.data[0].engine_data.wind.min_speed_kmph + " km/hr";
        this.state.windDir = stubresponse.data[0].engine_data.wind.direction_deg;
        this.state.textInfo = stubresponse.text;
        this.state.date = stubresponse.data[0].engine_data.date;

    }

    componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        const { navigation } = this.props;
        const selCity = navigation.getParam('cityOBJ', 'NO-VAL');
        switch (selCity) {
            case 'Karaikal':
                cityLeftCount = 3;
                cityRightCount = 1;
                cityCenterCount = 0;
                cityHiddenCount = 2;
                break;
            case 'Nagapatinam':
                cityLeftCount = 0;
                cityRightCount = 2;
                cityCenterCount = 1;
                cityHiddenCount = 3;
                break;
            case 'Vedarnyam':
                cityLeftCount = 1;
                cityRightCount = 3;
                cityCenterCount = 2;
                cityHiddenCount = 0;
                break;
            case 'Poompuhar':
                cityLeftCount = 2;
                cityRightCount = 0;
                cityCenterCount = 3;
                cityHiddenCount = 1;
                break;
            //No Default
        }
        this.setState({
            cityLeft: cityNames[cityLeftCount],
            cityRight: cityNames[cityRightCount],
            cityCenter: cityNames[cityCenterCount],
            hiddenCity: cityNames[cityHiddenCount],
        });

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
        this.state.loading = false;
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
                this.state.loading = true,
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
                Playing...
        </Text>) :
            <View>
                <Text style={styles.textForcast}>
                    Today's forecast
        </Text>
                <Text>
                   {this.state.date}
        </Text>
            </View>
    }

    onSwipeUp(gestureState) {
        this.setState({ myText: 'You swiped up!' });
    }

    onSwipeDown(gestureState) {
        this.setState({ myText: 'You swiped down!' });
    }

     async onSwipeLeft() {
        cityLeftCount = (cityLeftCount + 1) % 4;
        this.state.cityLeft = cityNames[cityLeftCount];
        cityRightCount = (cityRightCount + 1) % 4;
        this.state.cityRight = cityNames[cityRightCount];
        cityCenterCount = (cityCenterCount + 1) % 4;
        this.state.cityCenter = cityNames[cityCenterCount];
        cityHiddedCount = (cityHiddenCount + 1) % 4;
        this.state.cityHidden = cityNames[cityHiddenCount];
        this.setState.loading=true;
        await this.apiCallForForecast(this.state.cityCenter);
    }

    async onSwipeRight() {
        cityLeftCount = (cityLeftCount + 3) % 4;
        this.state.cityLeft = cityNames[cityLeftCount];
        cityRightCount = (cityRightCount + 3) % 4;
        this.state.cityRight = cityNames[cityRightCount];
        cityCenterCount = (cityCenterCount + 3) % 4;
        this.state.cityCenter = cityNames[cityCenterCount];
        cityHiddedCount = (cityHiddenCount + 3) % 4;
        this.state.cityHidden = cityNames[cityHiddenCount];
        this.setState.loading=true;
        await this.apiCallForForecast(this.state.cityCenter);
    }

    async moveToRight(){
        cityLeftCount = (cityLeftCount + 1) % 4;
        this.state.cityLeft = cityNames[cityLeftCount];
        cityRightCount = (cityRightCount + 1) % 4;
        this.state.cityRight = cityNames[cityRightCount];
        cityCenterCount = (cityCenterCount + 1) % 4;
        this.state.cityCenter = cityNames[cityCenterCount];
        cityHiddedCount = (cityHiddenCount + 1) % 4;
        this.state.cityHidden = cityNames[cityHiddenCount];
        this.setState.loading=true;
        await this.apiCallForForecast(this.state.cityCenter);
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
                console.log('Swiped');
                break;
            case SWIPE_RIGHT:
                console.log('Swiped');
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
                <Loader loading={this.state.loading} />
            </View>
        );
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
                    <Text style={styles.currentCityText}>
                        {this.state.cityCenter}
                    </Text>
                </View>
                {this.rightCityIcon()}
                {this.rightCityFrame()}
            </View>
        );
    }
    leftCityFrame() {
        return (
            <View style={styles.cityBoxLeft}>
                <Text style={styles.otherCityText}>
                    {this.state.cityLeft}
                </Text>
                <Text style={styles.txtDirection} >
                    44 Km north
                </Text>
            </View>
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
                    41 Km south
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
                    <Image style={styles.playImg}
                        source={require('../assets/images/play_green.png')}
                    />
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
                {this.warningStatus()}
                {this.rowCurrent()}
                {this.rowWave()}
                {this.rowWind()}
                {this.bottomtab()}
            </View>
        );
    }
    warningStatus() {
        return (
            <View style={styles.flexCondition}>
                <View style={styles.boxCondition}>
                    <Image style={styles.cautionIcon}
                        source={require('../assets/images/caution_small.png')}
                    />
                    {this.textCaution()}
                </View>
            </View>
        );
    }
    textCaution() {
        return (
            <Text style={styles.textCondition}>
                CAUTION
                            </Text>
        );
    }
    rowCurrent() {
        return (
            <View style={styles.infoBox}>
                {this.imgCurrent()}
                <Text style={[styles.symbolName, { color: '#0a4a81' }]}>Current</Text>
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
                <Text style={[styles.symbolName, { color: '#0088fc' }]}>Wave</Text>
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
                <Text style={[styles.symbolName, { color: '#c9bd75' }]}>Wind</Text>
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
            <View>
                <Text style={styles.reviewText}>Was this information useful?  </Text>
                <Text style={styles.reviewDate}>{this.state.date}{"\n"}{"\n"}{"\n"}{"\n"}</Text>
            </View>
        );
    }
    userReviewInput() {
        return (
            <View style={styles.reviewUserFlex}>
                <TouchableOpacity style={styles.iconNotUseful} onPress={alert_feedback}>
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
            <TouchableOpacity style={styles.iconUseful} onPress={alert_feedback}>
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
        width: 50,
        height: 50,
        marginLeft: 30,
        marginTop: 30,
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
        fontWeight: 'bold',
        fontSize: 12,
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
        marginLeft: 20
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
        marginLeft: 40,
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
        width: '80%',
        height: 80,
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
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    reviewText: {
        fontSize: 14,
        fontWeight: 'bold',
        lineHeight: 30,
    },
    reviewDate: {
        fontSize: 12,
        color: '#626262',
    },
    reviewUserFlex: {
        flex: 1,
        flexDirection: 'row',
        width: 60,
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
        marginLeft: 5,
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











