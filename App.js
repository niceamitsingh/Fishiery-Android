import React from 'react';
import { StyleSheet, Alert, AppRegistry, Text, TextInput, View, Dimensions, Image, TouchableOpacity } from 'react-native';

import bgImage from './assets/jioback.jpg'
import pageMain from './screens/main'
import pageActivity from './screens/activity'
import pageLanding from './screens/Landing_2'
import testPage from './screens/test_sound'


const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
class LoginPage extends React.Component {


  constructor(props) {
    super(props)
    this.state = {
 
      TextInputNumber: '',
    }
  }
  CheckTextInputIsEmptyOrNot = () =>{
    const { TextInputNumber }  = this.state ;
 
    if(TextInputNumber == '')
    {
      Alert.alert("Please Enter a Number.");
    }
    else if(this.state.TextInputNumber.length != 10 || TextInputNumber.includes(',') || TextInputNumber.includes('.') || TextInputNumber.includes(' ')){
      Alert.alert("Please Enter a Valid 10 digit Number.");
    }
    else{
      this.props.navigation.navigate("Main")
    }
  }


    render() {
    var { navigate } = this.props.navigation;
    return (
        <View >
          <View style={styles.containerInside}>
              <Image style={{width: 80, height: 82,marginTop:20}}
                source={require('./assets/images/icon_main.png')}
              />
              <Text style={styles.welcome}>
                Hi there
              </Text>
              <Text style={styles.phNo}>
                What's your phone number ?
              </Text>
          </View>
          <View style={styles.inputNo}>
            <TextInput
                style={styles.input}
                keyboardType = 'numeric'
                maxLength={10}
                placeholderTextColor={'rgba(0,0,0, 0.7)'}
                underlineColorAndroid='transparent'
                onChangeText={TextInputNumber => this.setState({TextInputNumber})}
              />
              <TouchableOpacity style={styles.btnSubmit} onPress={this.CheckTextInputIsEmptyOrNot}>
              <Image style={{width: 60, height: 60}}
                source={require('./assets/images/green_left.png')}
              />
              </TouchableOpacity>
            </View>
      </View>
    );
  }
}

import { createStackNavigator, createAppContainer } from 'react-navigation';
const RootStack = createStackNavigator(
  {
    Home: LoginPage,
    Main: pageMain,
    Activity: pageActivity,
    landing: pageLanding,
    test: testPage, 
  },
  {
    initialRouteName: 'Home',
  }
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
    justifyContent:'center',
    marginTop: '30%',
  },
  welcome: {
    marginTop:30,
    fontSize: 24,
    width:DEVICE_WIDTH,
    textAlign:'center',
    justifyContent:'center',
    color:'#aaaaaa',
    fontWeight:'bold',

  },
  phNo: {
    marginTop:30,
    fontSize: 34,
    width:DEVICE_WIDTH,
    textAlign:'center',
    color:'#000000',
    fontWeight:'bold',

  },
  inputNo:{
    marginTop:30,
    backgroundColor: '#fff',
    alignItems: 'center',
    width:'75%',
    alignSelf:'center',
    padding:30,
    borderRadius: 50,
    borderColor: '#f4f4f4',
    borderWidth: 3,
    flex:1,
    flexDirection: 'row',
  },
  input: {
    fontSize:24,
    width:150,
    height:30,
    fontWeight:'bold',
  },
  btnSubmit:{
    alignItems:'center',
    justifyContent:'center',
    height:50,
    width:50,
    marginTop:5,
    borderRadius: 50,
    marginLeft:65,

  },
});