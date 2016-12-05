'use strict';

import React, { Component } from 'react';
import {
  Text,
  Navigator,
  View,
  Image,
  TouchableHighlight,
  StatusBar,
  Platform,
  ListView,
  TextInput,
  Alert,
} from 'react-native';


import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinkit';

import NaviView from '../common/NaviView';
import RectButton from '../common/RectButton';

import styles from '../../styles/register/forgotPassword';

var users = require("../../models/users");
const services = require("../../lib/services");
const api = require("../../lib/api");


export default class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mobilePhoneNumber: "",
    };
  }

  componentWillMount() {

  }

  onPressSend(){
    Actions.verifySMS();
  }

  render() {
    return (
      <NaviView titleText="Forgot Password">
        <View style={styles.container}>
          <Text style={styles.descriptionText}
            numberOfLines={0}>
            Please enter the phone number connected with your Exit 7C account.
          </Text>
          <TextInput style={styles.textInput}
            keyboardType="phone-pad"
            autoFocus={true}
            placeholder="Enter Mobile Number"
            placeholderTextColor="gray"
            />
          <View style={styles.seperator} />
          <RectButton
            titleText="Send"
            onPress={this.onPressSend.bind(this)}
            />
        </View>
      </NaviView>
    );
  }
}
