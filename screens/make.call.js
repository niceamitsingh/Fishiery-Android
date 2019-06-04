import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Image, Dimensions, ImageBackground, TouchableOpacity, PermissionsAndroid, NetInfo, Alert, AsyncStorage, FlatList, Platform } from 'react-native';
import {
    widthPercentageToDP,
    heightPercentageToDP,
} from 'react-native-responsive-screen';
import call from "react-native-phone-call";
import { StackNavigator } from 'react-navigation';
import Loader from '../components/util/loader';
import getObjectForKey from '../components/util/title.localization';
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

export default class callRFS extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            isConnected: true,
        }
    }

    async componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        //var labelText = await getObjectForKey('Login_Screen_Greeting');
    }

    async componentWillUnmount() {
        NetInfo.isConnected.removeEventListener('connectionChange', this.handleConnectivityChange);
    }

    handleConnectivityChange = isConnected => {
        if (isConnected) {
            this.setState({ isConnected });
        } else {
            this.setState({ isConnected });
        }
    };

    call = () => {
        const args = {
            number: '18004198800',
            prompt: true,
        };

        call(args).catch(console.error);
    };

    render() {
        var { navigate } = this.props.navigation;
        if (!this.state.isConnected) {
            return <MiniOfflineSign />;
        }
        else {
            return (
                <View style={{ justifyContent: 'center', height: DEVICE_HEIGHT }}>
                    {this.keyboardAvoid()}
                </View>
            );
        }
    }
    userInput() {
        return (
            <View style={styles.InputName}>
                {this.inputBar()}
                <TouchableOpacity style={styles.btnSubmit} onPress={this.CheckTextInputIsEmptyOrNot}>
                    <Image style={styles.submitImg}
                        source={require('../assets/images/green_left.png')}
                    />
                </TouchableOpacity>
            </View>
        );
    }
    header() {
        return (
            <View style={styles.containerInside}>
                <Image style={styles.titleIcon}
                    source={require('../assets/images/Reliance_Foundation_Logo.png')}
                />
                <Text style={styles.rfs_title}>
                    Call Reliance Foundation
                </Text>
                {this.subTag()}
                {this.tag_number()}
                {this.subTag_Number()}
                {this.icon_call()}
            </View>
        );
    }
    subTag() {
        return (
            <Text style={styles.rfs_subTitle}>
                Get Questions answered
            </Text>
        );
    }
    tag_number() {
        return (
            <Text style={styles.rfs_number}>
                1800 419 8800
                </Text>
        );
    }
    subTag_Number() {
        return (
            <Text style={styles.rfs_subTitle}>
                (Toll free)
            </Text>
        );
    }
    icon_call() {
        return (
            <View style={styles.viewBtnCall}>
                <TouchableOpacity style={styles.btnCall} onPress={this.call}>
                    <Image source={require("../assets/images/call_green.png")} />
                </TouchableOpacity>
            </View>
        );
    }
    keyboardAvoid() {
        return (
            <View style={styles.container} behavior="padding" enabled>
                <View >
                    {this.header()}
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    containerInside: {
        height: DEVICE_HEIGHT,
        width: DEVICE_WIDTH,
        alignItems: 'center',
    },
    titleIcon: {
        width: '80%',
        marginTop: heightPercentageToDP("15%"),
    },
    rfs_title: {
        marginTop: 30,
        fontSize: 28,
        marginTop: heightPercentageToDP("15%"),
        width: widthPercentageToDP("90%"),
        textAlign: 'center',
        color: '#000000',
        fontWeight: 'bold',
    },
    rfs_subTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        width: widthPercentageToDP("90%"),
        color: '#808080'
    },
    rfs_number: {
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: heightPercentageToDP("8%"),
        textAlign: 'center',
        width: widthPercentageToDP("90%"),
        color: '#00a213'
    },
    viewBtnCall: {
        alignItems:'center',
        width: DEVICE_WIDTH,
        marginTop:widthPercentageToDP("8%"),
    },
    btnCall: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        borderRadius: 50,
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