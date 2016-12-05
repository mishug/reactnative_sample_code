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
  ScrollView,

} from 'react-native';


import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-spinkit';

import NaviView from '../common/NaviView';

import styles from '../../styles/register/myProfile';

var users = require("../../models/users");
const services = require("../../lib/services");
const api = require("../../lib/api");


export default class MyProfile extends Component {
  constructor(props) {
    super(props);
    var currentUserData = users.getUserData();

    console.log(JSON.stringify(currentUserData));

      var ststeArray = {
        firstName:currentUserData.firstName,
        lastName:currentUserData.lastName,
        email:currentUserData.email,
        phoneNumber: "" + currentUserData.phoneNumber,
        countryCode:currentUserData.countryCode,
      };

    var listOptions = [
      {
        refName: "firstName",
        placeHolder: "First Name",
        keyboardType: "default",
        value: currentUserData.firstName,
        label: "First Name",

      },
      {
        refName: "lastName",
        placeHolder: "Last Name",
        keyboardType: "default",
        value: currentUserData.lastName,
        label: "Last Name",
      },

      {
        refName: "phoneNumber",
        placeHolder: "Phone Number",
        keyboardType: "default",
        value: "" + currentUserData.phoneNumber,
        label: "Phone Number",
      },


      {
        refName: "button",
        enabled: true,
      }
    ];
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      dataSource: ds.cloneWithRows(listOptions),
      inputs: ststeArray,
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
      inputs['countryCode'] = "+1";
    }
    this.setState({inputs: inputs});
  }

  onPressLogout() {
    users.logout();
    this.props.onUserLogginStateChange();
    Actions.pop();
  }

  onPressUpdateProfile(){


    // if(!services.validateEmail(this.state.inputs.email)){
    //   Alert.alert('', "Please enter valid Email address" + this.state.inputs.email);
    //   return;
    // }

    api.updateProfile(this.state.inputs).then( function(responseJson){
      if (responseJson.status == 'ok') {
        Alert.alert("Updated succesfully");
        Actions.pop({popNum: 1});

      } else {
        Alert.alert("System busy");
      }
    }.bind(this)).catch(responseJson => {
      Alert.alert('', api.errorDescription(responseJson));
    });
  }



  renderListRow(rowData){
     if (rowData.refName == 'button') {
      var buttonColor = {
        backgroundColor: rowData.enabled ? 'black' : 'gray',
      }
      return (
        <View style={{alignItems: 'center'}}>
          <TouchableHighlight onPress={this.onPressUpdateProfile.bind(this)}>
            <View style={[styles.updateProfileButton, buttonColor]}>
              <Text style={styles.updateProfileButtonText}>
                Save
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      );
    } else {

      return (
        <View style={styles.listRow}>
          <Text style={styles.label}>{rowData.label}</Text>
            <TextInput ref={rowData.refName} style={styles.textInput}
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
      <NaviView titleText="Edit Account"
        rightButton={{
          type: 'text',
          name: "Logout",
          onPress: this.onPressLogout.bind(this),
        }}>

        <View style={{flex:1}}>
          <View style={styles.container}>
            <View style={styles.profileContainer}>
              <Image source={require('../../images/roundEdit.png')}/>
            </View>

            <View>

              <ScrollView>
                <View style={styles.listRow}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput style={styles.textInput}
                    onChangeText={(text) => {this.onChangeText("firstName", text)}}
                    value={this.state.inputs["firstName"]}
                    />
                </View>

                <View style={styles.listRow}>
                  <Text style={styles.label}>Last Name</Text>

                  <TextInput style={styles.textInput}
                  onChangeText={(text) => {this.onChangeText("lastName", text)}}
                  value={this.state.inputs["lastName"]}
                  />
               </View>


               <View style={styles.listRow}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput style={[styles.textInput]}
                  onChangeText={(text) => {this.onChangeText("phoneNumber", text)}}
                  value={this.state.inputs["phoneNumber"]}
                  />
              </View>

              <View style={{alignItems: 'center'}}>
                  <TouchableHighlight onPress={this.onPressUpdateProfile.bind(this)}>
                  <View style={[styles.signUpButton, {backgroundColor:"#333"}]}>
                    <Text style={styles.signupText}>
                      Save
                    </Text>
                  </View>
                  </TouchableHighlight>
               </View>


            </ScrollView>

          </View>
        </View>

    </View>
  </NaviView>
    );
  }
}
