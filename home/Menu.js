'use strict';

import React, { Component } from 'react';
import {
  Text,
  Navigator,
  View,
  DeviceEventEmitter,
  Image,
  TextInput,
  ListView,
  Animated,
  TouchableHighlight,
  StatusBar,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/FontAwesome';
var Smooch = require('react-native-smooch');

import styles from '../../styles/home/menu';

var users = require('../../models/users');

const menuIcons = {
  Garage: require('../../images/garageIcon.png'),
  RoundUp: require('../../images/roundUp.png'),
  Help: require('../../images/helpIcon.png'),
  Feedback: require('../../images/feedbackIcon.png'),
  Settings: require('../../images/settingsIcon.png'),
  Legal: require('../../images/legalIcon.png'),
  Promotion: require('../../images/promotionIcon.png'),
  Payment: require('../../images/paymentIcon.png'),
}

export default class Menu extends Component {
  constructor(props) {
    super(props);
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    var options = ["Payment","Feedback","Help","Legal"];
    //var options = ["Payment","RoundUp","Promotion","Garage","Feedback","Help","Settings","Legal"];
    this.state = {
      isFocused: false,
      menuViewLeftSpace: new Animated.Value(-250),
      shadowOpacity: new Animated.Value(0),
      dataSource: ds.cloneWithRows(options),
      userName: "Sign In",
      shallSequeToGarage: false,
      shallSequeToPayment: false,
    };
  }

  onShadowPress(){
    this.hide();
  }


  updateUserNameText() {
    if (users.isLoggedIn()) {
      var userName = users.getName();
      if (userName && userName.length > 0) {
        this.setState({userName: userName});
      } else {
        this.setState({userName: "Edit Profile"});
      }
    } else {
      this.setState({userName: "Sign In"});
    }
  }

  componentWillMount() {
    this.updateUserNameText();
  }

  hideMenu() {
    console.log("menu hide");
    Animated.parallel([
      Animated.timing(
        this.state.menuViewLeftSpace,
        {toValue: -250}
      ),
      Animated.timing(
        this.state.shadowOpacity,
        {toValue: 0}
      )
    ]).start(() => {
      this.setState({isFocused: false});
    });
  }

  show(){
    this.setState({
      isFocused: true,
    });
    Animated.parallel([
      Animated.timing(
        this.state.menuViewLeftSpace,
        {toValue: 0}
      ),
      Animated.timing(
        this.state.shadowOpacity,
        {toValue: 0.6}
      )
    ]).start();
  }

  onPressListRow(rowData){
    switch (rowData) {
      case 'Garage':
        if (users.isLoggedIn()) {
          Actions.garageList();
        } else {
          this.setState({shallSequeToGarage: true});
          Actions.signin({onUserLogginStateChange: this.onUserLogginStateChange.bind(this)});
        }
        break;
      case 'Help':
          Smooch.show();
        break;
      case 'Settings':
          users.logout();
        break;
      case 'Feedback':
          Actions.feedbackEntry();
        break;
      case 'Legal':
        Actions.legal();
        break;
      case 'Promotion':
        Actions.promotion();
        break;
      case 'Payment':
        if (users.isLoggedIn()) {
          Actions.payment();
        } else {
          this.setState({shallSequeToPayment: true});
          Actions.signin({onUserLogginStateChange: this.onUserLogginStateChange.bind(this)});
        }
        break;
      default:
    }
  }

  onPressProfile(){
    if(users.isLoggedIn()){
      Actions.myProfile({onUserLogginStateChange: this.onUserLogginStateChange.bind(this)});
    } else {
      Actions.signin({onUserLogginStateChange: this.onUserLogginStateChange.bind(this)});
    }
  }

  onUserLogginStateChange() {
    this.updateUserNameText();
    if(this.state.shallSequeToGarage) {
      this.setState({shallSequeToGarage: false});
      if (users.isLoggedIn()) {
        setTimeout(Actions.garageList, 1000);
      }
    }
    if(this.state.shallSequeToPayment) {
      this.setState({shallSequeToPayment: false});
      if (users.isLoggedIn()) {
        setTimeout(Actions.payment, 1000);
      }
    }
  }

  renderListRow(rowData){
    return (
      <TouchableHighlight underlayColor="transparent"
        onPress={() => {this.onPressListRow(rowData)}}>
        <View style={styles.listRow}>
          <Image style={styles.listIcon}
            resizeMode="contain"
            source={menuIcons[rowData]}
            />
          <Text style={{fontSize: 14}}>
            {rowData}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    if (this.state.isFocused) {
      return (
        <View style={styles.full}>
          <StatusBar
             backgroundColor="transparent"
             barStyle="light-content"
             translucent={true}
            />
          <Animated.View style={[
              styles.full,
              {opacity: this.state.shadowOpacity, backgroundColor: 'black'}
            ]}>
            <TouchableHighlight style={{flex:1}}
              underlayColor="transparent"
              onPress={this.hideMenu.bind(this)}>
              <View style={{flex:1}}/>
            </TouchableHighlight>
          </Animated.View>
          <Animated.View style={[styles.contentContainer, {left: this.state.menuViewLeftSpace}]} >
            <TouchableHighlight underlayColor="transparent"
              onPress={this.onPressProfile.bind(this)}>
              <View style={{height: 150, backgroundColor: 'black'}}>
                <Image style={{flex: 1, width: 250, height: 150}}
                  source={require('../../images/menuProfileBG.png')}
                  resizeMode="stretch" />
                <View style={styles.profileContainer}>
                  <Image style={styles.profileAvatar}
                    source={require('../../images/defaultAvatar.png')}
                    />
                  <Text style={styles.profileDescription}>
                    {this.state.userName}
                  </Text>
                </View>
              </View>
            </TouchableHighlight>
            <ListView style={styles.list}
              dataSource={this.state.dataSource}
              renderRow={this.renderListRow.bind(this)}
              keyboardShouldPersistTaps={true}
              keyboardDismissMode="on-drag"
              renderSeparator={(sectionID, rowID, adjacentRowHighlighted)=>{
                return (<View style={styles.listSeperator} key={rowID} />);
              }}
            />
          </Animated.View>
        </View>
      );
    } else {
      return null;
    }
  }
}
