import React, { Component } from 'react';
import { StyleSheet, Button, Text, ScrollView, TextInput, View, Dimensions, Image, TouchableOpacity, AppRegistry, TouchableHighlight, Animated, Alert, NetInfo, AsyncStorage } from 'react-native';
import { StackNavigator } from 'react-navigation';

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
              source={require('./assets/images/no_connection.png')}
            />
          </View>
      </View>
    );
  }

  class ask_location 