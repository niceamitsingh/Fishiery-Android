import React from 'react';
import { StyleSheet, Alert, AppRegistry, Text, TextInput, View, Dimensions, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, NetInfo, AsyncStorage } from 'react-native';
import getObjectForKey from '../components/util/title.localization';
import Loader from '../components/util/loader';
import request from '../components/util/apirequest';
import APIConfig from '../components/config/APIconfig';
import {
    widthPercentageToDP,
    heightPercentageToDP,
} from 'react-native-responsive-screen';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const { MAIN_FRAME } = DEVICE_HEIGHT * .8;

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

export default class ask_name extends React.Component {
    static navigationOptions = {
        header: null
    }

    constructor(props) {
        super(props)
        this.state = {
            isConnected: true,
            TextInputName: '',
            loading: false,
            ask_name: '',
            user_Language:'',
            user_Number:'',
        }
    }

    async componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        var labelText = await getObjectForKey('Register_Name');
        //var noText = await getObjectForKey('Login_Screen_Question');
        const { navigation } = this.props;
        var lang='';
        var num='';
        try {
            //console.log("Label"+ JSON.stringify(sText));
            lang = await AsyncStorage.getItem('DEFAULT_LANGUAGE');
            num = await AsyncStorage.getItem('DEFAULT_NUMBER');
          } catch (error) {
            console.log(error);
          }
          console.log("Language is: " + lang);
        this.setState({
            user_Language:lang,
            user_Number:num,
            ask_name: labelText,
        });
        //console.log("Label"+ JSON.stringify(sText));
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
    componentDidUnMount() {
        this.setState({ loading: false });
    }

    async saveData(){
        const name = this.state.TextInputName;
        const number = this.state.user_Number;
        const lang = this.state.user_Language;
        console.log("Name: " + name);
        console.log("Number: " + number);
        console.log("Language: " + lang);
        var data = {
            "name": name,
            "phone": number,
            "language": lang
         };
        var response = await request(
            APIConfig.Base_URL + APIConfig.New_User_Registration.urlPath,
            data
        );
        this.setState({ loading: false });
        console.log('Registration Response: '+ JSON.stringify(response));
        if (response.length != 0) {
            this.props.navigation.navigate("reg_success");
        }
        else {
            Alert.alert("Registration failed !");
        };
    }

    CheckTextInputIsEmptyOrNot = () => {
        const { TextInputName } = this.state;

        if (TextInputName == '') {
            Alert.alert("Please enter your name");
        }
        else {
            this.saveData();
        }
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
                    <Loader loading={this.state.loading} />
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
                    source={require('../assets/images/icon_main.png')}
                />
                <Text style={styles.askName}>
                    {this.state.ask_name}
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
            <TextInput
                style={styles.input}
                maxLength={20}
                placeholderTextColor={'rgba(0,0,0, 0.7)'}
                underlineColorAndroid='transparent'
                onChangeText={TextInputName => this.setState({ TextInputName })}
            />
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
    askName: {
        marginTop: 30,
        fontSize: 34,
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
        justifyContent: 'space-between',
    },
    input: {
        fontSize: 24,
        width: '65%',
        height: 30,
        marginLeft: 10,
    },
    btnSubmit: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        marginTop:2,
        width: 50,
        borderRadius: 50,

    },
    submitImg: {
        width: 60,
        height: 60,
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