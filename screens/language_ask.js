import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Image, Dimensions, ImageBackground, TouchableOpacity, PermissionsAndroid, NetInfo, Alert, AsyncStorage, FlatList, Platform,} from 'react-native';
import {
    widthPercentageToDP,
    heightPercentageToDP,
} from 'react-native-responsive-screen';
import { StackNavigator } from 'react-navigation';
import request from '../components/util/apirequest';
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
export default class main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isConnected: true,
            dataSource: [],
            languages: [],
            selected_language: [],
            loading: false,
            fishing_page_title: '',
            //ph_number:'',
        }
    }

    async componentWillMount() {
        var state;
        try {
            //console.log("Label"+ JSON.stringify(sText));
            state = await AsyncStorage.getItem('IS_USER_LOGGED_IN');
            if (state == 'false'){
              console.log(state);
              this.props.navigation.navigate("page_forecast");
            }
          } catch (error) {
            // Error retrieving data
            console.log("Not logged in yet !")
          }
        await this.apiCallForLandingSites();
    }

    async apiCallForLandingSites() {
        var dataSource =
        [/*{
               "language": "English",
           },*/
           {
               "language": "తెలుగు",
           },
           {
               "language": "தமிழ்",
           }];    
        console.log("Return Value: " + JSON.stringify(dataSource));
        this.setState({ dataSource: dataSource });
    }

    selectItem = (data) => {
        if (this.state.selected_language != null) {
            this.state.selected_language.pop();
        }
        this.state.selected_language.push(data.item);
        var languageSelected = data.item.language;
        if(languageSelected=='English'){
            languageSelected='English';
        }
        else if(languageSelected=='తెలుగు'){
            languageSelected='Telugu';
        }
        else
        {
            languageSelected='Tamil';
        }
        console.log("Selected Data: " + languageSelected);
        const { navigate } = this.props.navigation;

        this.btnContinueTapped(languageSelected);
    };

    async btnContinueTapped(languageSelected) {
        this.setState({ loading: true });
        const { navigate } = this.props.navigation;
        AsyncStorage.setItem(
            "DEFAULT_LANGUAGE",
            languageSelected
          );
        this.setState({ loading: false });
        navigate('login_page', {/* "language": languageSelected , "ph_no":this.state.ph_number*/});
    }

    async componentDidMount() {
        NetInfo.isConnected.addEventListener('connectionChange', this.handleConnectivityChange);
        //var labelText = await getObjectForKey('Fishing_Sites_Title');
        var labelText = ' Select a language'
        const { navigation } = this.props;
        //const phone_number = navigation.getParam('ph_no');
        this.setState({
            ph_number:"NaN",
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
                keyExtractor={(item, index) => item.language}
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
                {data.item.language}
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
                    <Text style={styles.header}>{this.state.fishing_page_title}  </Text>
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
        marginTop: heightPercentageToDP('20%'),
    },
    text: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },

    header: {
        marginTop: heightPercentageToDP('10%'),
        fontWeight: 'bold',
        fontSize: 32,
        textAlign:'center',
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
        marginTop: heightPercentageToDP('10%'),
        marginBottom: heightPercentageToDP('5%'),
        width: widthPercentageToDP("90%"),
        height: heightPercentageToDP("75%"),
        marginLeft: widthPercentageToDP("5%"),
        marginRight: widthPercentageToDP("5%"),
        color: '#cc0000',
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