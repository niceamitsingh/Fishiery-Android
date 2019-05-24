import React from 'react';
import { StyleSheet, Alert, AppRegistry, Text, TextInput, View, Dimensions, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, NetInfo } from 'react-native';

import site from './screens/fishing_sites'
import playSound from './screens/play_sound'
import forecast from './screens/forecast'
import soundTest from './screens/soundTest'
import request from './components/util/apirequest';
import APIConfig from './components/config/APIconfig';
import Loader from './components/util/loader';

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
            source={require('./assets/images/no_connection.png')}
          />
        </View>
    </View>
  );
}

class LoginPage extends React.Component {
  static navigationOptions = {
    header: null
  }

  constructor(props) {
    super(props)
    this.state = {
      isConnected: true,
      TextInputNumber: '',
      loading: false,
    }
  }

  componentDidMount() {
    NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
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

  componentDidUnMount() {
    this.setState({ loading: false });
  }

  CheckTextInputIsEmptyOrNot = () => {
    const { TextInputNumber } = this.state;

    if (TextInputNumber == '') {
      Alert.alert("Please Enter a Number.");
    }
    else if (this.state.TextInputNumber.length != 10 || TextInputNumber.includes(',') || TextInputNumber.includes('.') || TextInputNumber.includes(' ')) {
      Alert.alert("Please Enter a Valid 10 digit Number.");
    }
    else {
      this.checkUser(this.state.TextInputNumber);
    }
  }

  async checkUser(TextInputNumber) {
    this.setState({ loading: true });
    console.log(TextInputNumber);
    var data = {
      "phone": TextInputNumber,
    }; console.log("Request Body: " + JSON.stringify(data));
    var response = await request(
      APIConfig.Base_URL + APIConfig.Get_User_Profiles_API.urlPath,
      data
    );
    console.log(JSON.stringify(response));
    if (response['users'].length == 0) {
      this.setState({ loading: false });
      Alert.alert("You are not registered !");
    }
    else {
      this.setState({ loading: false });
      this.props.navigation.navigate("fishing_site");
    }
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
      <View style={styles.inputNo}>
        {this.inputBar()}
        <TouchableOpacity style={styles.btnSubmit} onPress={this.CheckTextInputIsEmptyOrNot}>
          <Image style={styles.submitImg}
            source={require('./assets/images/green_left.png')}
          />
        </TouchableOpacity>
      </View>
    );
  }
  header() {
    return (
      <View style={styles.containerInside}>
        <Image style={styles.titleIcon}
          source={require('./assets/images/icon_main.png')}
        />
        {this.headerTextHi()}
        <Text style={styles.phNo}>
          What's your phone number ?
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
  headerTextHi() {
    return (
      <Text style={styles.welcome}>
        Hi there
            </Text>
    );
  }
  inputBar() {
    return (
      <TextInput
        style={styles.input}
        keyboardType='numeric'
        maxLength={10}
        placeholderTextColor={'rgba(0,0,0, 0.7)'}
        underlineColorAndroid='transparent'
        onChangeText={TextInputNumber => this.setState({ TextInputNumber })}
      />
    );
  }
}



import { createStackNavigator, createAppContainer } from 'react-navigation';
const RootStack = createStackNavigator(
  {
    login_page: LoginPage,
    fishing_site: site,
    forcastAudio: playSound,
    page_forecast: forecast,
    sound: soundTest,
  },
  {
    initialRouteName: 'login_page',
  }
  , { headerMode: 'none' }
);

const AppContainer = createAppContainer(RootStack);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
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
  welcome: {
    marginTop: 30,
    fontSize: 24,
    width: DEVICE_WIDTH,
    textAlign: 'center',
    justifyContent: 'center',
    color: '#aaaaaa',
    fontWeight: 'bold',

  },
  phNo: {
    marginTop: 30,
    fontSize: 34,
    width: DEVICE_WIDTH,
    textAlign: 'center',
    color: '#000000',
    fontWeight: 'bold',

  },
  inputNo: {
    marginTop: 30,
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
    marginBottom: '20%',
  },
  input: {
    fontSize: 24,
    width: 150,
    height: 30,
    fontWeight: 'bold',
  },
  btnSubmit: {
    alignItems: 'center',
    marginTop: 3,
    justifyContent: 'center',
    height: 50,
    width: 50,
    borderRadius: 50,

  },
  submitImg: {
    width: 60,
    height: 60,
  },
  offlineContainer:{
    flex:1,
  },
  offlineNotification: {
    backgroundColor: '#b52424',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: DEVICE_WIDTH,
    position: 'absolute',
    bottom:10
  },
  offlineText: { 
    color: '#fff',
    fontSize:16,
   },
   offlineIconContainer:{
     height:'90%',
     width:DEVICE_WIDTH,
     alignItems:'center',
     justifyContent:'center',
   },
   offlineIcon: {
    width: 180,
    height: 182,
  },
});