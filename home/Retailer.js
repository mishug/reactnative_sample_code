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
  Linking,
  Platform,
  ActionSheetIOS,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard'

import Spinner from 'react-native-spinkit';
import Icon from 'react-native-vector-icons/FontAwesome';

import styles from '../../styles/home/retailer';
import paymentStyles from '../../styles/payment/payment';
import {SwipeRow,SwipeListView} from 'react-native-swipe-list-view';
import { Actions } from 'react-native-router-flux';

var vehicles = require('../../models/vehicles');
const services = require('../../lib/services');

export default class Retailer extends Component {
  constructor(props) {
    super(props);
    var deviceWidth = Dimensions.get('window').width;
    var deviceHeight = Dimensions.get('window').height;
    var optionHistory = [
      {
        key:'visa',
        title1:'VISA',
        title2:' **** **** 22222',
        icon: require('../../images/paymentIcon.png'),
      },
      {
        key:'master_card',
        title1:'MASTER CARD',
        title2:' **** 22222',
        icon: require('../../images/paymentIcon.png'),
      },
      {
        key:'add_payment',
        title1:'ADD NEW PAYMENT',
        title2:'',
        icon: require('../../images/plusIcon.png'),
      }
    ];
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      isFocused: false,
      naviBarTopspace: new Animated.Value(-80),
      detailContainerHeight: new Animated.Value(250),
      detailContainerBottomSpace: new Animated.Value(-250),
      detailContainerHeightValue: 250,
      listDataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      spin: false,
      station: null,
      buttons: {},
      deviceWidth: deviceWidth,
      dataSource1: ds.cloneWithRows(optionHistory),
      currentTab:'personal',
      showPaymentView: false,
      deviceHeight:deviceHeight,
    };
    this.productListPressRow = this.productListPressRow.bind(this);
    this.naviOnAppleMap = this.naviOnAppleMap.bind(this);
  }

  onBackButtonPress(){
    this.hide();
  }

  hide() {
    dismissKeyboard();
    Animated.parallel([
      Animated.timing(
        this.state.naviBarTopspace,
        {toValue: -80}
      ),
      Animated.timing(
        this.state.detailContainerBottomSpace,
        {toValue: - this.state.detailContainerHeightValue}
      )
    ]).start(() => {
      this.setState({isFocused: false});
      this.setState({buttons: {}});
      this.setState({showPaymentView:false});
      this.props.onRetailerDismiss();
    });
  }

  show(station){
    var heightValue = 141 + 51 * station.products.length;
    this.setState({
      isFocused: true,
      detailContainerHeightValue: heightValue,
      station: station,
      listDataSource: this.state.listDataSource.cloneWithRows(station.products),
    });
    Animated.parallel([
      Animated.timing(
        this.state.naviBarTopspace,
        {toValue: 0}
      ),
      Animated.timing(
        this.state.detailContainerHeight,
        {toValue: heightValue}
      ),
      Animated.timing(
        this.state.detailContainerBottomSpace,
        {toValue: 0}
      )
    ]).start();
  }

  productListPressRow(rowData,rowID){
  //  this.setState({buttons:{}});
    var fuelState = this.state.buttons;
    fuelState[rowID] = true;
    this.setState({buttons:fuelState});
    console.log(rowData);
  }

  naviOnAppleMap(coordStr){
    var appleMapURL = "http://maps.apple.com/?dirflg=d&daddr=" + coordStr;
    Linking.openURL(appleMapURL);
  }

  onPressStartNavi(){
    var coordStr = this.state.station.lat + "," + this.state.station.lng;
    if(Platform.OS === 'ios') {
      var googleMapURL = "comgooglemaps://?directionsmode=driving&daddr=" + coordStr;
      Linking.canOpenURL(googleMapURL).then(googleMapSupported => {
        var wazeMapURL = "waze://?navigate=yes&ll=" + coordStr;
        return Linking.canOpenURL(wazeMapURL).then(wazeSupported => {
          if (googleMapSupported || wazeSupported) {
            var buttons = ['Apple'];
            if (googleMapSupported) {
              buttons.push('Google');
            }
            if (wazeSupported) {
              buttons.push('Waze');
            }
            var buttonTexts = buttons.map(mapBrand => {
              return "Get Directions (" + mapBrand + ")";
            });
            buttonTexts.push('Cancel');
            ActionSheetIOS.showActionSheetWithOptions({
              options: buttonTexts,
              cancelButtonIndex: buttonTexts.length - 1,
            },
            (buttonIndex) => {
              console.log(buttonIndex);
            });
          } else {
            this.naviOnAppleMap(coordStr);
          }
        });
      });
    } else {
      var googleMapURL = "http://maps.google.com/maps?dirflg=d&daddr=" + coordStr;
      Linking.openURL(googleMapURL);
    }

  }

  renderListRow(rowData, sectionID, rowID, highlightRow){

    var isSelectedProduction = vehicles.selectedProduct() == rowData.name;
    var textColor = {color: isSelectedProduction ? 'black' : 'dimgray'};
    return (
      <TouchableHighlight underlayColor="transparent"
        onPress={() => {this.productListPressRow(rowData,rowID)}}>
        <View style={styles.listRow}>
          <Text style={[styles.productionName, textColor]}>
            {rowData.name.toUpperCase()}
          </Text>
          <View style={styles.productPrice}>
            <Text style={[{fontSize: 18}, textColor]}>
              {'$' + services.price2cent(rowData.price)}
            </Text>
            <View style={{height: 26}}>
              <Text style={[textColor, {fontSize: 12}]}>
                {services.millOfPrice(rowData.price)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
  renderList(rowData){
    if(rowData.key == 'add_payment'){
      return(
      <TouchableOpacity onPress={()=>Actions.payment()} style={{minHeight:40, flexDirection:'row',alignItems:'center',padding:5,marginTop:10,marginLeft:15,marginRight:15,borderWidth:1,borderColor:'#ccc'}}>
        <Image source={rowData.icon} style={{paddingLeft:5}}/>
        <Text style={{marginLeft:10}}>{rowData.title1}</Text>
        <Text style={{marginLeft:30}}>{rowData.title2}</Text>
      </TouchableOpacity>
    );
    }else{
    return(
    <View style={{flexDirection:'row',alignItems:'center',padding:5,marginTop:10,marginLeft:15,marginRight:15,borderWidth:1,borderColor:'#ccc'}}>
      <Image source={rowData.icon} style={{paddingLeft:5}}/>
      <Text style={{marginLeft:10}}>{rowData.title1}</Text>
      <Text style={{marginLeft:30}}>{rowData.title2}</Text>
    </View>
  );
 }
}

  onPressPayNow(rowID){
      this.setState({showPaymentView:true});
  }
  _renderPaymentView(){

    if(this.state.currentTab == 'personal'){
      var personalTabBackgrund = '#000000';
      var businessTabBackground = '#FFFFFF';
      var personalTextColor = "#FFFFFF";
      var businessTextColor = "#E2E2E2";

    }else{
      var personalTabBackgrund = '#FFFFFF';
      var businessTabBackground = '#000000';
      var personalTextColor = "#E2E2E2";
      var businessTextColor = "#FFFFFF";
    }
      let paymentIcon = require('../../images/paymentIcon.png');
      var deviceWidth = Dimensions.get('window').width;
    return(

      <View style={paymentStyles.paymentContainer}>
        <View>
         <View style={paymentStyles.tabsContainer}>

            <TouchableHighlight style={[paymentStyles.tabs,{backgroundColor:personalTabBackgrund}]} onPress={()=>this.setState({currentTab:'personal'})}>
                <Text style={[paymentStyles.tabsText,{color:personalTextColor}]}>PERSONAL</Text>
            </TouchableHighlight>

            <TouchableHighlight style={[paymentStyles.tabs,{backgroundColor:businessTabBackground}]} onPress={()=>this.setState({currentTab:'business'})}>
                 <Text style={[paymentStyles.tabsText,{color:businessTextColor}]}>BUSINESS</Text>
            </TouchableHighlight>
          </View>
        </View>

          <ListView
          style={[styles.list,{marginTop:20}]}
          dataSource = {this.state.dataSource1}
          renderRow = {this.renderList.bind(this)}

          />
      </View>
    );
  }

  render() {

    if (this.state.isFocused) {
      return (
        <View style={[styles.full,this.state.showPaymentView?styles.hidelayout:null]}
          pointerEvents="box-none">
          <StatusBar
             backgroundColor="transparent"
             barStyle="light-content"
             translucent={true}
           />
          <Animated.View style={[styles.naviBar, {top: this.state.naviBarTopspace}]} >
            <View style={styles.titleBackView}>
              <Icon.Button name="chevron-left"
                backgroundColor="transparent"
                color="white"
                style={styles.backButton}
                onPress={this.onBackButtonPress.bind(this)}
                underlayColor="transparent"
              />
              <Text style={styles.titleText}>
                {vehicles.selectedProduct()}
              </Text>
              <Icon.Button name="chevron-left"
                backgroundColor="transparent"
                color="transparent"
                style={styles.placeholderButton}
                onPress={this.onBackButtonPress.bind(this)}
                underlayColor="transparent"
              />
            </View>
          </Animated.View>
          <Animated.View style={[
              styles.detailContainer,
              {
                bottom: this.state.detailContainerBottomSpace,
                height: this.state.detailContainerHeight,
                opacity: this.state.showPaymentView ? 0.7 : 1,

              }
            ]}>
            <View style={[styles.seperator, {marginTop: 39}]} />
            <View style={styles.brandProfileBack}>
              <Image source={{uri:"https://www.exit7c.com/wp-content/uploads/images/" + this.state.station.brand.toLowerCase() + "Fuel.png"}}
                style={styles.brandLogoImage}
                resizeMode='contain'
                />
              <View style={styles.brandInfoBack}>
                <Text style={styles.brandNameLabel} numberOfLines={1}>
                  {this.state.station.brand}
                </Text>
                <Text style={styles.brandAddressLabel} numberOfLines={2}>
                  {this.state.station.address + "\n" + this.state.station.fullAddress}
                </Text>
              </View>
            </View>
            <View style={styles.seperator} />
            <ListView style={styles.list}
              dataSource={this.state.listDataSource}
              renderRow={this.renderListRow.bind(this)}
              keyboardShouldPersistTaps={true}
              keyboardDismissMode="on-drag"
              scrollEnabled={false}
              renderSeparator={(sectionID, rowID, adjacentRowHighlighted)=>{
                return (
                  <View key={rowID}>
                  {this.state.buttons[rowID]?
                  <View style={styles.payNowContainer}>
                  <Text style={[styles.productionName,{flex:2}]}>Pump#</Text>
                  <TouchableHighlight style={styles.payNowBtn} onPress={() => {this.onPressPayNow(rowID)}}>
                  <Text style={styles.payNowText}>PayNow</Text>
                  </TouchableHighlight>
                  </View>
                : null}
                  <View style={styles.seperator} key={rowID} />
                  </View>
                );
              }}
            />
            <TouchableHighlight style={styles.startNaviButton}
              onPress={this.onPressStartNavi.bind(this)}
              underlayColor='transparent'>
              <Image
                style={{flex: 1}}
                source={require('../../images/startNaviArrow.png')}
              />
            </TouchableHighlight>


          </Animated.View>
          {this.state.showPaymentView?
          <View style={{backgroundColor:'#FFFFFF',width:this.state.deviceWidth,minHeight:100,opacity:1,top:this.state.deviceHeight-260,left:0,right:0,position:'absolute'}}>
            {this._renderPaymentView()}
          </View>
          :null}

        </View>
      );
    } else {
      return null;
    }
  }
}
