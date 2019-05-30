import React from 'react';
import { StyleSheet, Alert, AppRegistry, Text, TextInput, View, Dimensions, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, NetInfo } from 'react-native';
import Loader from '../components/util/loader';
import getObjectForKey from '../components/util/title.localization';
import {
    widthPercentageToDP,
    heightPercentageToDP,
} from 'react-native-responsive-screen';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');

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

export default class success extends React.Component {
    static navigationOptions = {
        header: null
    }
    constructor(props) {
        super(props)
        this.state = {
            isConnected: true,
            loading: false,
            success_tag: 'Success !!',
            registeted_tag: 'You are now registered !',
        }
    }
    async componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        /*var labelText = await getObjectForKey('Login_Screen_Greeting');
        var noText = await getObjectForKey('Login_Screen_Question');
        this.setState({
          hi_there:labelText,
          ask_phNo:noText,
        });
        console.log("Label"+ JSON.stringify(sText));*/
    }
    toLandingSites(){
        var { navigate } = this.props.navigation;
        navigate("fishing_site");
    }
    componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }

    CheckTextInputIsEmptyOrNot() {
        console.log("Success");

    }

    render() {
        var { navigate } = this.props.navigation;
        if (!this.state.isConnected) {
            return <MiniOfflineSign />;
        }
        else {
            return (
                <View style={{ justifyContent: 'center', height: DEVICE_HEIGHT }}>
                    {this.keyboardAvoid()}
                    <Loader loading={this.state.loading} />
                </View>
            );
        }
    }
    userInput() {
        return (
            <TouchableOpacity style={styles.InputName} onPress={() => this.toLandingSites()}>
                {this.inputBar()}
                <Image style={styles.submitImg}
                    source={require('../assets/images/green_left.png')}
                />
            </TouchableOpacity>
        );
    }
    header() {
        return (
            <View style={styles.containerInside}>
                <Image style={styles.titleIcon}
                    source={require('../assets/images/icon_main.png')}
                />
                <Text style={styles.success}>
                    {this.state.success_tag}
                </Text>
                <Text style={styles.registered}>
                    {this.state.registeted_tag}
                </Text>
            </View>
        );
    }

    keyboardAvoid() {
        return (
            <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
                <View >
                    {this.header()}
                    {this.userInput()}
                </View>
            </KeyboardAvoidingView>
        );
    }
    inputBar() {
        return (
            <Text style={styles.input}>Let's get Started !   </Text>
        );
    }
}

const styles = StyleSheet.create({
    containerInside: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleIcon: {
        width: 80,
        height: 82,
    },
    success: {
        marginTop: heightPercentageToDP('15%'),
        fontSize: 36,
        width: DEVICE_WIDTH,
        textAlign: 'center',
        color: '#039073',
        fontWeight: 'bold',

    },
    registered: {
        marginTop: heightPercentageToDP('8%'),
        fontSize: 26,
        width: DEVICE_WIDTH,
        textAlign: 'center',
        color: '#000000',
        fontWeight: 'bold',

    },
    InputName: {
        marginTop: 60,
        backgroundColor: '#fff',
        alignItems: 'center',
        width: '75%',
        alignSelf: 'center',
        paddingRight: 5,
        paddingLeft: 10,
        paddingTop: 30,
        paddingBottom: 30,
        borderRadius: 50,
        borderColor: '#f4f4f4',
        borderWidth: 3,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: '20%',
        backgroundColor: '#039073'
    },
    input: {
        fontSize: 24,
        width: '70%',
        height: 30,
        marginLeft: 10,
        color: '#ffffff'
    },
    submitImg: {
        width: 50,
        height: 50,
        marginTop:4,
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
        width: 180,
        height: 182,
    },
});