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

import styles from '../../styles/register/verifySMS';

var users = require("../../models/users");
const services = require("../../lib/services");
const api = require("../../lib/api");


export default class VerifySMS extends Component {
  constructor(props) {
    super(props);
    this.state = {
      digits: "",
    };
  }

  componentWillMount() {

  }

  onPressVerify(){
    console.log("onPressVerify");
  }

  onPressResend(){
    console.log("onPressResend");
  }

  render() {
    return (
      <NaviView titleText="Verification">
        <View style={styles.container}>
          <Text style={styles.descriptionText}
            numberOfLines={0}>
            Exit 7C just sent a verification code via text message (SMS). The verification code is a 6-digit number.
          </Text>
          <View style={styles.circleContainer}>
            <Icon name='circle-thin'
            style={styles.circle}
            color="black"
            size={20} />
            <Icon name='circle-thin'
            style={styles.circle}
            color="black"
            size={20} />
            <Icon name='circle-thin'
            style={styles.circle}
            color="black"
            size={20} />
            <Icon name='circle-thin'
            style={styles.circle}
            color="black"
            size={20} />
            <Icon name='circle-thin'
            style={styles.circle}
            color="black"
            size={20} />
            <Icon name='circle-thin'
            style={styles.circle}
            color="black"
            size={20} />
          </View>
          <RectButton
            titleText="Verify"
            onPress={this.onPressVerify.bind(this)}
            />
          <View style={{height: 15}} />
          <RectButton
            containerStyle={styles.resendButton}
            textColor="black"
            backgroundColor='white'
            titleText="Resend Code"
            onPress={this.onPressResend.bind(this)}
            />
          <TextInput style={styles.textInput}
            keyboardType="phone-pad"
            autoFocus={true}
            />
        </View>
      </NaviView>
    );
  }
}
