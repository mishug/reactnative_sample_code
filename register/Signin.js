'use strict';

import React, { Component } from 'react';
import {
  Text,
  Navigator,
  View,
  Image,
  TextInput,
  ListView,
  Animated,
  TouchableHighlight,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';


const FBSDK = require('react-native-fbsdk');
const FBLoginManager = FBSDK.LoginManager;
const {
  GraphRequest,
  GraphRequestManager,
} = FBSDK;

import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinkit';

import styles from '../../styles/register/signin';

var users = require("../../models/users");
const services = require("../../lib/services");
const api = require("../../lib/api");

export default class Signin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailText: "",
      passwordText: "",
      errMessage: "",
      spin: false
    };
  }

  componentWillMount() {

  }

  onCancel(){
    Actions.pop();
  }

  onRegister(){
    Actions.register({onUserLogginStateChange: this.props.onUserLogginStateChange});
  }

  displayError(errMessage) {
    this.setState({
      spin: false,
      errMessage: errMessage,
    });
  }

  onSigninPress(){
    if (!services.validateEmail(this.state.emailText)){
      this.displayError("Please enter valid email address");
      this.refs.emailInput.focus();
      return;
    }
    if (!services.validatePassword(this.state.passwordText)){
      this.displayError("Password shall be 6+ alphanumeric");
      this.refs.passwordInput.focus();
      return;
    }
    if (!services.validateEmail(this.state.emailText)){
      this.refs.emailInput.focus();
      return;
    }
    this.setState({
      errMessage: "",
      spin: true,
    });
    api.siginWithEmail(this.state.emailText, this.state.passwordText).then(function(responseJson){
      if (users.loggin(responseJson.user)) {
        this.props.onUserLogginStateChange();
        Actions.pop();
      } else {
        this.displayError("System busy");
      }
    }.bind(this)).catch(responseJson => {
      this.displayError(api.errorDescription(responseJson));
    });
  }

  facebookResponseInfoCallback(error: ?Object, result: ?Object){
    if (error) {
      this.displayError("Fail to login with facebook");
    } else {
      //Alert.alert(JSON.stringify(result));
      api.siginWithFacebook(result).then(function(responseJson){
        if (users.loggin(responseJson.user)) {
          this.props.onUserLogginStateChange();
          Actions.pop();
        } else {
          this.displayError("System busy");
        }
      }.bind(this)).catch(responseJson => {

        this.displayError(api.errorDescription(responseJson));
      });
    }
  }
  onFacebookPress(){
    this.setState({
      errMessage: "",
      spin: true,
    });
    FBLoginManager.logInWithReadPermissions(["public_profile"]).then(result => {
      var infoRequest = new GraphRequest(
        '/me?fields=id,name,link,first_name,last_name,picture.type(large),email,birthday,bio,location,friends,hometown,friendlists',
        null,
        this.facebookResponseInfoCallback.bind(this),
      );
      //infoRequest.addStringParameter('',"fields");
      new GraphRequestManager().addRequest(infoRequest).start();
    });
  }


  onForgotPasswordPress() {
    Actions.forgotPassword();
  }

  renderSigninButtonContent(){
    if (this.state.errMessage.length > 0){
      return (
        <Text style={styles.errorText}>
          {this.state.errMessage}
        </Text>
      )
    }
    if (this.state.spin) {
      return(
        <Spinner
          isVisible={true}
          size={20}
          type='ChasingDots'
          color='#DEDEDE'
        />
      );
    }
    return (
      <Text style={styles.signinText}>
        SIGN IN
      </Text>
    );
  }

  renderFacebook() {
   // if(Platform.OS === 'ios') {
      return (
        <TouchableHighlight onPress={this.onFacebookPress.bind(this)}>
          <View style={styles.facebookButton}>
            <Icon size={22}
              name="facebook"
              backgroundColor="transparent"
              color="white"
              style={{marginRight: 15}}
            />
            <Text style={styles.facebookText}>
              SIGN IN WITH FACEBOOK
            </Text>
          </View>
        </TouchableHighlight>
      );
   // } else {
     // return null;
    //}
  }

  renderPassword() {
    if (this.state.passwordText.length > 0) {
      return null;
    } else {
      return(
        <Text style={styles.forgotPassword}
          onPress={this.onForgotPasswordPress.bind(this)}>
          Forgot Password?
        </Text>
      );
    }
  }

  render() {
    return (
      <View style = {styles.full}>
        <StatusBar hidden={true}  />
        <Image source={require('../../images/siginBackgroundImg.png')}
          style={styles.backgroundImage}
          resizeMode='stretch' />
        <View style={[styles.full, styles.container]}>
          <View />
          <Text style={styles.logoText}>
            Exit 7C
          </Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput ref="emailInput"
                style={styles.inputText}
                placeholder="Email"
                lineBreakMode="tail"
                keyboardType="email-address"
                underlineColorAndroid="transparent"
                placeholderTextColor="#CCCCCC"
                value={this.state.emailText}
                onChangeText={(text) => this.setState({emailText: text})}
              />
            </View>
            <View style={styles.seperator} />
            <View style={styles.inputWrapper}>
              <TextInput ref="passwordInput"
                style={styles.inputText}
                placeholder="Password"
                lineBreakMode="tail"
                underlineColorAndroid="transparent"
                secureTextEntry={true}
                placeholderTextColor="#CCCCCC"
                value={this.state.passwordText}
                onChangeText={(text) => this.setState({passwordText: text})}
              />
              {this.renderPassword()}
            </View>
            <View style={styles.seperator} />
          </View>
          <TouchableHighlight onPress={this.onSigninPress.bind(this)}>
            <View style={styles.signinButton}>
              {this.renderSigninButtonContent()}
            </View>
          </TouchableHighlight>
          {this.renderFacebook()}
          <View style={styles.footerContainer}>
            <View style={styles.seperator} />
            <View style={styles.footerRow}>
              <TouchableHighlight onPress={this.onRegister.bind(this)} style={styles.registerView}>
                <View style={styles.registerView}>
                  <Text style={styles.registerText}>
                    Register
                  </Text>
                </View>
              </TouchableHighlight>
            </View>
          </View>
        </View>
        <View style={styles.cancelButtonContainer}>
          <Icon.Button name="remove"
            backgroundColor="transparent"
            color="lightgray"
            size={25}
            style={styles.cancelButton}
            onPress={this.onCancel.bind(this)}
          />
        </View>
      </View>
    );
  }
}
