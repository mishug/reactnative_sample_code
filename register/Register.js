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

import styles from '../../styles/register/register';

var users = require("../../models/users");
const services = require("../../lib/services");
const api = require("../../lib/api");


export default class Register extends Component {
  constructor(props) {
    super(props);
    var listOptions = [
      {
        refName: "firstName",
        placeHolder: "First Name",
        keyboardType: "default",
      },
      {
        refName: "lastName",
        placeHolder: "Last Name",
        keyboardType: "default",
      },
      {
        refName: "email",
        placeHolder: "Email",
        keyboardType: "email-address",
      },
      {
        refName: "phoneNumber",
        placeHolder: "Phone Number",
        keyboardType: "phone-pad",
      },
      {
        refName: "password",
        placeHolder: "Password",
        keyboardType: "default",
        secureTextEntry: true,
      },
      {
        refName: "legal",
        checked: true,
      },
      {
        refName: "button",
        enabled: true,
      }
    ];
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows(listOptions),
      inputs: {},
      checkedAgree: true,
      listOptions: listOptions,
    };
    this.onChangeText = this.onChangeText.bind(this);
  }

  componentWillMount() {

  }

  onChangeText(refName, text){

    var inputs = this.state.inputs;
    inputs[refName] = text;
    if(refName == 'phoneNumber'){
      inputs['countryCode'] = "+91";
    }
    this.setState({inputs: inputs});
  }

  onPressAgreement(){

  }

  onPressSiginUp(){
    if(!this.state.listOptions.slice(-1)[0].enabled){
      return;
    }
    if(!services.validateEmail(this.state.inputs.email)){
      Alert.alert('', "Please enter valid Email address" + this.state.inputs.email);
      return;
    }
    if(!services.validatePassword(this.state.inputs.password)){
      Alert.alert('', "Password shall be 6+ alphanumeric(letters and numerals)" + this.state.inputs.password);
      return;
    }
    api.siginUpWithEmail(this.state.inputs).then(function(responseJson){
      if (users.loggin(responseJson.user)) {
        this.props.onUserLogginStateChange();
        Actions.pop({popNum: 2});
      } else {
        Alert.alert("System busy");
      }
    }.bind(this)).catch(responseJson => {
      Alert.alert('', api.errorDescription(responseJson));
    });
  }

  onPressCheckedBox(){
    var checked = !this.state.checkedAgree;
    var newDs = this.state.listOptions.slice(0);
    newDs[newDs.length - 2] = {
      refName: "legal",
      checked: checked,
    };
    newDs[newDs.length - 1] = {
      refName: 'button',
      enabled: checked,
    }
    this.setState({
      checkedAgree: checked,
      dataSource: this.state.dataSource.cloneWithRows(newDs),
      listOptions: newDs,
    });
  }

  renderListRow(rowData){
    if(rowData.refName == 'legal'){
      return (
        <View style={styles.legalView}>
          <Icon.Button name={rowData.checked ? "check-square-o" : "square-o"}
            backgroundColor="transparent"
            color="black"
            onPress={this.onPressCheckedBox.bind(this)}
            style={styles.naviButton}
            underlayColor="transparent"
          />
          <TouchableHighlight onPress={this.onPressAgreement.bind(this)}
            underlayColor="transparent">
            <View style={styles.agreementView}>
              <Text style={styles.agreementText}>
                Agree to Exit 7C
              </Text>
              <Text style={styles.termsText}>
                Terms & Conditions
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      );
    } else if (rowData.refName == 'button') {
      var buttonColor = {
        backgroundColor: rowData.enabled ? 'black' : 'gray',
      }
      return (
        <View style={{alignItems: 'center'}}>
          <TouchableHighlight onPress={this.onPressSiginUp.bind(this)}>
            <View style={[styles.signUpButton, buttonColor]}>
              <Text style={styles.signupText}>
                Sign Up
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      );
    } else {
      if(Platform.OS == 'ios'){
        var flexVal = 1;
      }else{
        var flexVal = 0;
      }
      return (
        <View style={styles.listRow}>
          <TextInput ref={rowData.refName} style={[styles.textInput,{flex:flexVal}]}
            keyboardType={rowData.keyboardType}
            placeholder={rowData.placeHolder}
            value={this.state.inputs[rowData.refName]}
            placeholderTextColor="#818181"
            onChangeText={(text) => {this.onChangeText(rowData.refName, text)}}
            secureTextEntry={rowData.secureTextEntry ? true : false}
            />
        </View>
      );
    }
  }


  render() {
    return (
      <NaviView titleText="Register">
        <View style={{flex: 1}}>
          <ListView style={{flex: 1}}
            dataSource={this.state.dataSource}
            renderRow={this.renderListRow.bind(this)}
            keyboardShouldPersistTaps={true}
            keyboardDismissMode="on-drag"
            >

          </ListView>
          <TouchableHighlight style={styles.footerView}
            onPress={() => {Actions.pop()}}>
            <View style={styles.footerView}>
              <Text style={{fontSize: 14, marginRight: 5}}>
                Already have an account?
              </Text>
              <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                Sign In
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      </NaviView>
    );
  }
}
