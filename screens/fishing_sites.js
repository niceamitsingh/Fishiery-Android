import React from 'react';
import { StyleSheet, Text, TextInput, View, Image, Dimensions, ImageBackground, TouchableOpacity, PermissionsAndroid, NetInfo, Alert } from 'react-native';

import { StackNavigator } from 'react-navigation';

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

    static navigationOptions = {
        header: null
    }
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
                    {this.cityAll()}
                </View>
            );
        }
    }

    cityAll() {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
            }}>
                {this.cityTopRow()}
                {this.cityBottomRow()}
            </View>
        );
    }
    cityTopRow() {
        return (
            <View style={styles.horizontalFlex}>
                <View>
                </View>
                {this.city_1()}
                {this.city_2()}
                <View>
                </View>
            </View>
        );
    }

    cityBottomRow() {
        return (
            <View style={[styles.horizontalFlex, { marginTop: 50 }]}>
                <View>
                </View>
                {this.city_3()}
                {this.city_4()}
                <View>
                </View>
            </View>
        );
    }
    city_1() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.btnFlex}>
                <TouchableOpacity style={styles.btn}
                    onPress={
                        () => {
                            navigate("page_forecast", { cityOBJ: this.state.cityTxt_1 })
                        }}>
                    {this.pannelView1()}
                </TouchableOpacity>
            </View>
        );
    }

    pannelView1() {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.emptybox}></View>
                <Text style={styles.text}>{this.state.cityTxt_1}</Text>
            </View>
        );
    }


    city_2() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.btnFlex}>
                <TouchableOpacity style={styles.btn}
                    onPress={
                        () => {
                            navigate("page_forecast", { cityOBJ: this.state.cityTxt_2 })
                        }}>
                    {this.pannelView2()}
                </TouchableOpacity>
            </View>
        );
    }
    pannelView2() {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.emptybox}></View>
                <Text style={styles.text}>{this.state.cityTxt_2}</Text>
            </View>
        );
    }
    city_3() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.btnFlex}>
                <TouchableOpacity style={styles.btn}
                    onPress={
                        () => {
                            navigate("page_forecast", { cityOBJ: this.state.cityTxt_3 })
                        }}>
                    {this.pannelView3()}
                </TouchableOpacity>
            </View>
        );
    }
    pannelView3() {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.emptybox}></View>
                <Text style={styles.text}>{this.state.cityTxt_3}</Text>
            </View>
        );
    }
    city_4() {
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.btnFlex}>
                <TouchableOpacity style={styles.btn}
                    onPress={
                        () => {
                            navigate("page_forecast", { cityOBJ: this.state.cityTxt_4 })
                        }}>
                    {this.pannelView4()}
                </TouchableOpacity>
            </View>
        );
    }
    pannelView4() {
        return (
            <View style={{ flex: 1 }}>
                <View style={styles.emptybox}></View>
                <Text style={styles.text}>{this.state.cityTxt_4}</Text>
            </View>
        );
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
        width: 80,
        height: 82,
      },
});