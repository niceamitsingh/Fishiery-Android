import React from 'react';
import { StyleSheet, Alert, AppRegistry, Text, TextInput, View, Dimensions, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, NetInfo, AsyncStorage } from 'react-native';
import Loader from '../components/util/loader';
import getObjectForKey from '../components/util/title.localization';
import { createStackNavigator, createAppContainer } from 'react-navigation';
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

    ShowAlertWithDelay=()=>{
 
        setTimeout(() =>{
            //var { navigate } = this.props.navigation;
          //Put All Your Code Here, Which You Want To Execute After Some Delay Time.
          AsyncStorage.setItem(
            "IS_USER_LOGGED_IN",
           JSON.stringify(true)
          );
            this.props.navigation.navigate("fishing_site");
     
        }, 2500);
      }

    render() {
        var { navigate } = this.props.navigation;
        if (!this.state.isConnected) {
            return <MiniOfflineSign />;
        }
        else {
            return (
                <View style={styles.containerInside}>
                    {this.showGif()}
                    {this.ShowAlertWithDelay()}
                </View>
            );
        }
    }

    showGif(){
        return(
            <Image style={styles.titleIcon}
          source={require('../assets/images/success.gif')}
        />
        );
    }

}

const styles = StyleSheet.create({
    containerInside: {
        alignItems: 'center',
        marginTop: heightPercentageToDP('40%'),
        justifyContent: 'center',
    },
    titleIcon: {
        width: 200,
        height: 200,
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