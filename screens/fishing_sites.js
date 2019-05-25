import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Image, Dimensions, ImageBackground, TouchableOpacity, PermissionsAndroid, NetInfo, Alert, AsyncStorage, FlatList, Platform } from 'react-native';
import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';
import { StackNavigator } from 'react-navigation';
import request from '../components/util/apirequest';
import Loader from '../components/util/loader';

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const cityNames = ["Karaikal", "Nagapatinam", "Poompuhar", "Vedarnyam"];

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
      cityTxt_1: cityNames[0],
      cityTxt_2: cityNames[1],
      cityTxt_3: cityNames[2],
      cityTxt_4: cityNames[3],
      isConnected: true,
      dataSource: [],
      landing_sites: [],
      selected_landing_site:[],
      loading: false,
    }
  }

  async componentWillMount() {
    await this.apiCallForLandingSites();
  }

  async apiCallForLandingSites() {
    var coordinates = {
      "coordinates": {
        "latitude": "23.812975",
        "longitude": "68.723988"
      }
    };
    var dataSource = await request("http://104.211.204.132/osf/engine/get_landing_centre/", coordinates);
    console.log("Return Value: " + JSON.stringify(dataSource));
    this.setState({ dataSource: dataSource });
  }

  selectItem = (data) => {
    if(this.state.selected_landing_site != null){
      this.state.selected_landing_site.pop();
    }
     this.state.selected_landing_site.push(data.item);
     console.log("Selected Data: "+  JSON.stringify(data.item));
    const { navigate } = this.props.navigation;

    this.btnContinueTapped();
  };

  GetGridViewItem(item) {
    this.setState({ landing_sites: item });
  }

  btnContinueTapped() {
      this.state.loading=true;
    console.log("Selected Site: "+ JSON.stringify(this.state.landing_sites));
    AsyncStorage.setItem(
      "USERSELECTEDSITE",
      JSON.stringify(this.state.landing_sites)
    );
    console.log('Landing Sites: '+this.state.selected_landing_site);
    console.log('Landing Sites Count: '+this.state.selected_landing_site.length);
    const { navigate } = this.props.navigation;
    this.state.loading=false;
   navigate('page_forecast',{"Landing_Sites":this.state.dataSource, "Selected_Site":this.state.selected_landing_site});
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
  fish_sitesList() {
    return (
      <FlatList
        style={styles.GridContainer}
        data={this.state.dataSource}
        renderItem={(item) => this.renderItem(item)}
        extraData={this.state}
        numColumns={3}
        backgroundColor="#f2f2f2"
        //keyExtractor={"landing_centre_ID"}
        keyExtractor= {(item, index) => item.landing_centre_ID}
      />
    );
  }


  renderItem = (data) => (
    <TouchableOpacity
      style={[styles.list, data.item.selectedClass]}
      onPress={() => this.selectItem(data)}
    >
      <Text
        style={(styles.GridViewInsideTextItemStyle, styles.languageSelected)}
      >
        {data.item.landing_centre}
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
    else {
      return (
        <View style={styles.containerMain}>
          <Image style={styles.iconMain}
            source={require('../assets/images/icon_main.png')}
          />
          <Text style={styles.header}>Where do you fish?   </Text>
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
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 23,
    letterSpacing: 0,
    //textAlign: 'center',
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
    flex: 0.333,
    alignItems: 'center',
    height: 100,
    width: widthPercentageToDP("30%"),
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
