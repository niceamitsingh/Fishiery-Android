import React, { Component } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, AsyncStorage } from 'react-native';
import { Constants, Permissions, Notifications } from 'expo';

import { Button } from 'react-native-elements';
import '@expo/vector-icons';

const BASE_URL = 'http://guru.southindia.cloudapp.azure.com:8007/api/device';

const initialState = {
  appId: null,
  notificationsEnabled: false,
  fetching: false,
  notification: null,
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.togglePushNotifications = this.togglePushNotifications.bind(this);
  }

  async componentWillMount() {
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
    const notificationState = await this.getPersistedState();
    this.setState(notificationState);
  }

  async getPersistedState() {
    return JSON.parse(await AsyncStorage.getItem('the-state'));
  }

  setPersistedState() {
    return AsyncStorage.setItem('the-state', JSON.stringify(this.state));
  }

  _handleNotification = notification => {
    this.setState({ notification: notification });
  };

  async enablePushNotifications() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    let token = await Notifications.getExpoPushTokenAsync();
    console.log(token);
    this.setState(state => {
      return {
        ...state,
        fetching: true,
      };
    });
    console.log(token);
    const resp = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: '9876543210_Ram', 
        notifToken: token, 
        os: 'Android'
       // pushToken: token,
      }),
    });
    const { id } = resp.json();
    this.setState(state => {
      return {
        ...state,
        notificationsEnabled: !state.notificationsEnabled,
        fetching: false,
        deviceId: id,
      };
    });
  }
  async disablePushNotifications() {
    // Todo this
  }
  togglePushNotifications() {
    if (!this.state.notificationsEnabled) {
      return this.enablePushNotifications();
    }
    return this.disablePushNotifications();
  }
  render() {
    const buttonData = this.state.notificationsEnabled
      ? {
          text: 'Disable Push Notifications',
          color: 'red',
        }
      : {
          icon: 'check-circle',
          text: 'Enable Push Notifications',
          color: 'teal',
        };
    return (
      <View style={styles.container}>
        <Button
          onPress={() =>
            this.setState(initialState, this.setPersistedState.bind(this))}
          title="Reset"
        />
        <Text style={styles.paragraph}>
          Expo Push Notification Example
        </Text>
        {this.state.notification &&
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Origin: {this.state.notification.origin}</Text>
            <Text>Body: {this.state.notification.body}</Text>
            <Text>Data: {JSON.stringify(this.state.notification.data)}</Text>
          </View>}
        {this.state.fetching && <ActivityIndicator size="large" />}
        <Button
          onPress={this.togglePushNotifications}
          icon={{ name: buttonData.icon, size: 32 }}
          buttonStyle={{ backgroundColor: buttonData.color, borderRadius: 10 }}
          textStyle={{ textAlign: 'center' }}
          title={buttonData.text}
        />
        <Text>{this.state.hello}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});
