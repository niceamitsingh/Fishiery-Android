import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Image, Dimensions, ImageBackground, TouchableOpacity, PermissionsAndroid, NetInfo, Alert, AsyncStorage, FlatList, Platform } from 'react-native';
import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';
import { Constants, Location, Permissions } from 'expo';
import { StackNavigator } from 'react-navigation';
import request from '../components/util/apirequest';
import Loader from '../components/util/loader';
import getObjectForKey from '../components/util/title.localization';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
var selectedState='';

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
export default class main extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      cityTxt_1: "",
      cityTxt_2: "",
      cityTxt_3: "",
      cityTxt_4: "",
      isConnected: true,
      dataSource: [],
      landing_sites: [],
      selected_landing_site: [],
      loading: false,
      fishing_page_title: '',
      location: null,
      errorMessage: null,
      latitude_site:'',
      longitude_site:'',
    }
  }

  async componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }
  _getLocationAsync = async () => {
  let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }
    this.setState({ loading: true });
    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
    console.log('location:' +JSON.stringify(this.state.location));
    this.setState({
      latitude_site:this.state.location.coords.latitude,
      longitude_site:this.state.location.coords.longitude
    });
    console.log("Latitude: "+this.state.latitude_site);
    console.log("Longitude: "+this.state.longitude_site);
    var lat=this.state.latitude_site.toString();
    var long=this.state.longitude_site.toString();
   await AsyncStorage.setItem(
      "DEFAULT_LAT",
      lat
    );
    await AsyncStorage.setItem(
      "DEFAULT_LONG",
      long
    );
    await this.apiCallForLandingSites();
    this.setState({ loading: false });
  };


async apiCallForLandingSites() {
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
  console.log(lat+ "    "  +lon);
  var coordinates = {
    "latitude": lat,
    "longitude": lon
  };
  var dataSource = await request("http://104.211.204.132/osf/engine/get_nearest_landing_centres/", coordinates);
  console.log("Return Value: " + JSON.stringify(dataSource));
  if(dataSource == "timeout of 60000ms exceeded") {
    Alert.alert('Please try after some time');
  } else {
    this.setState({ dataSource: dataSource });
  }
  this.setState({ loading: false });
}

selectItem = (data) => {
  if (this.state.selected_landing_site != null) {
    this.state.selected_landing_site.pop();
  }
  this.state.selected_landing_site.push(data.item);
  console.log("Selected Data: " + JSON.stringify(data.item));
  selectedState=data.item.state;
  const { navigate } = this.props.navigation;

  this.btnContinueTapped();
};

GetGridViewItem(item) {
  this.setState({ landing_sites: item });
}

btnContinueTapped() {
  this.setState({ loading: true });
  console.log("Selected Site: " + JSON.stringify(this.state.landing_sites));
  console.log("Selected State : "+selectedState);
  AsyncStorage.setItem(
    "USERSELECTEDSITE",
    JSON.stringify(this.state.landing_sites)
  );
  console.log('Landing Sites: ' + this.state.selected_landing_site);
  console.log('Landing Sites Count: ' + this.state.selected_landing_site.length);
  const { navigate } = this.props.navigation;
  this.setState({ loading: false });
  navigate('page_forecast', { "Landing_Sites": this.state.dataSource, "Selected_Site": this.state.selected_landing_site, "Selected_State": selectedState });
}

async componentDidMount() {
  NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
  var labelText = await getObjectForKey('Fishing_Sites_Title');
  this.setState({
    fishing_page_title: labelText,
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
fish_sitesList() {
  return (
    <FlatList
      style={styles.GridContainer}
      data={this.state.dataSource}
      renderItem={(item) => this.renderItem(item)}
      extraData={this.state}
      numColumns={2}
      backgroundColor="#fff"
      //keyExtractor={"landing_centre_ID"}
      keyExtractor={(item, index) => item.landing_centre_ID}
    />
  );
}


renderItem = (data) => (
  <TouchableOpacity
    style={[styles.list, data.item.selectedClass]}
    onPress={() => this.selectItem(data)}
  >
    <Text
      style={(styles.GridViewInsideTextItemStyle)}
    >
      {data.item.landing_centre}
      {"\n"}
      {data.item.distance_km} Km
      </Text>
  </TouchableOpacity>
);


  static navigationOptions = {
  header: null
};
render() {
  const { navigate } = this.props.navigation;
  if (!this.state.isConnected) {
    return <MiniOfflineSign />;
  }
  if (this.state.errorMessage) {
    text = this.state.errorMessage;
  }
  else {
    return (
      <View style={styles.containerMain}>
        <Image style={styles.iconMain}
          source={require('../assets/images/icon_main.png')}
        />
        <Text style={styles.header}>{this.state.fishing_page_title}</Text>
        {this.fish_sitesList()}
        <Loader loading={this.state.loading} />
      </View>
    );
  }
}


}

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },



  iconMain: {
    width: 80, height: 82,
    marginTop: '20%',
  },
  horizontalFlex: {
    width: DEVICE_WIDTH,
    justifyContent: 'space-between',
    height: 150,
    flexDirection: 'row',
  },
  btnFlex: {
    width: 150,
    height: 150,
    alignItems: 'center'
  },
  btn: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderColor: '#f4f4f4',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    color: 'rgba(255,255,255,0.7)',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },

  header: {
    fontWeight: 'bold',
    fontSize: 32,
    textAlign: 'center',
    marginTop: '8%',
  },
  emptybox: {
    borderRadius: 10,
    marginTop: 2,
    height: 110,
    width: 140,
    backgroundColor: '#f1f1f1'
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




  GridContainer: {
    marginTop: 40,
    marginBottom: heightPercentageToDP('5%'),
    width: widthPercentageToDP("90%"),
    height: heightPercentageToDP("75%"),
    marginLeft: widthPercentageToDP("5%"),
    marginRight: widthPercentageToDP("5%"),
    color: '#cc0000',
  },

  GridViewBlockStyle: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    width: widthPercentageToDP("30%"),
    height: 100,
    margin: 2.5,
    borderRadius: 4,
    backgroundColor: '#eeeeee',
  },
  GridViewInsideTextItemStyle: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    width:widthPercentageToDP("40%"),
    lineHeight: 30,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  NativeLanguageTextStyle: {
    marginTop: 0,
    marginLeft: 10,
    width: 340,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#009e7e',
  },
  selectedTapAnotherToSelectMoreText: {
    width: 293,
    height: 22,
    marginTop: 0,
    marginLeft: 10,
    //fontFamily: "CircularStd",
    fontSize: 17,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'left',
    color: 'rgba(0, 0, 0, 0.6)',
  },
  continueButtonStyle: {
    marginTop: heightPercentageToDP('8%'),
    marginBottom: heightPercentageToDP('3.33%'),
    marginLeft: widthPercentageToDP('5.85%'),
    width: widthPercentageToDP('88.3%'),
    height: 54,
    borderRadius: 8,
    backgroundColor: '#009e7e',
    borderWidth: 0,
  },
  continueButtonTextStyle: {
    opacity: 1,
    //fontFamily: "CircularStd",
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 19,
    letterSpacing: 0.23,
    textAlign: 'center',
    color: '#ffffff',
  },

  list: {
    justifyContent: 'center',
    flex: 0.5,
    alignItems: 'center',
    height: 100,
    width: widthPercentageToDP("50%"),
    margin: 3,
    borderRadius: 4,
    backgroundColor: '#009e7e',
    color: '#fb3d3c',
  },
  selected: {
    backgroundColor: '#fb3d3c',
    color: '#fff',
  },
  languageSelected: {
    color: '#fff',
    textAlign: 'center',
  },
});