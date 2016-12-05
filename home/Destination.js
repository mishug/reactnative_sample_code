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
} from 'react-native';
import dismissKeyboard from 'dismissKeyboard'

import Spinner from 'react-native-spinkit';
import Icon from 'react-native-vector-icons/FontAwesome';

import destinationStyle from '../../styles/home/destination';

const mapApi = require("../../lib/mapApi");


export default class Destination extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocused: false,
      destinationOpacity: new Animated.Value(0),
      destinationDataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}),
      spin: false,
    };
    this.destinationListPressRow = this.destinationListPressRow.bind(this);
  }

  menuPressed(){
    this.props.onMenuPressed();
  }

  crossPressed(){
    console.log("cross pressed");
    this.setState({
      destinationText: "",
    });
    this.props.onClearDestination();
    this.refs.textInput.focus();
  }

  hideDestination() {
    dismissKeyboard();
    Animated.timing(
      this.state.destinationOpacity,
      {toValue: 0}
    ).start(() => {
      this.setState({isFocused: false});
      this.props.onDestinationFocus(false);
    });
  }

  showDestination(){
    Animated.timing(
      this.state.destinationOpacity,
      {toValue: 1,}
    ).start();
  }

  destinationBackPressed(){
    this.hideDestination();
  }

  onChangeDestinationText(text) {
    mapApi.autocomplete(text, function(predictions){
      this.setState({destinationDataSource: this.state.destinationDataSource.cloneWithRows(predictions)});
    }.bind(this));
    this.setState({destinationText: text});
  }

  onDestinationTextFocus(){
    if (this.state.isFocused == false){
      this.setState({isFocused: true});
      this.showDestination();
      this.props.onDestinationFocus(true);
    }
  }

  destinationListPressRow(rowData){
    console.log(rowData);
    this.setState({
      spin: true,
      destinationText: rowData.description,
    });
    mapApi.getCoordinate(rowData, function(coords){
      //console.log(rowData, location);
      rowData.coords = coords;
      this.setState({
        spin: false,
      });
      this.props.onPickDestination(rowData);
    }.bind(this));
    this.hideDestination();
  }

  renderDestinationListRow(rowData){
    return (
      <TouchableHighlight underlayColor="transparent"
        onPress={() => {this.destinationListPressRow(rowData)}} >
        <View style={destinationStyle.destinationListRow}>
          <Image style={destinationStyle.destinationListRowBorder}
            source={require('../../images/destinationBorderLeft.png')}
            resizeMode={Image.resizeMode.stretch}
          />
          <Icon size={22}
            name="map-marker"
            backgroundColor="transparent"
            color="#696969"
            style={{marginLeft: 15, marginRight: 25}}
          />
          <View style={{flex: 1}}>
            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text numberOfLines={1}
                lineBreakMode="tail">
                {rowData.description}
              </Text>
            </View>
            <View style={destinationStyle.destinationListSeperator} />
          </View>
          <Image style={destinationStyle.destinationListRowBorder}
            source={require('../../images/destinationBorderRight.png')}
            resizeMode={Image.resizeMode.stretch}
          />
        </View>
      </TouchableHighlight>
    );
  }

  renderDestinationList(){
    if(this.state.destinationDataSource.getRowCount() == 0){
      return null;
    } else {
      return (
        <ListView style={destinationStyle.destinationList}
          dataSource={this.state.destinationDataSource}
          renderRow={this.renderDestinationListRow.bind(this)}
          keyboardShouldPersistTaps={true}
          keyboardDismissMode="on-drag"
          renderHeader={() => {
            return (
              <Image style={destinationStyle.destinationListHeader}
                source={require('../../images/destinationBorderTop.png')}
                capInsets={{top: 0, left: 15, bottom: 0, right: 15}}
                resizeMode={Image.resizeMode.stretch}
              />
            );
          }}
          renderFooter={() => {
            return (
              <Image style={destinationStyle.destinationListFooter}
                source={require('../../images/destinationBorderBottom.png')}
                capInsets={{top: 0, left: 15, bottom: 0, right: 15}}
                resizeMode={Image.resizeMode.stretch}
              />
            );
          }}
        />
      )
    }
  }

  renderDestinationView(){
    var destinationViewStyle = [destinationStyle.full, destinationStyle.destinationBackgroundView,
      {opacity: this.state.destinationOpacity}
    ];
    if (this.state.isFocused){
      return (
        <Animated.View style={destinationViewStyle}>
          {this.renderDestinationList()}
        </Animated.View>
      );
    } else {
      return null;
    }
  }

  renderMenuOrBack(){
    if (this.state.isFocused) {
      return (
        <Icon.Button name="chevron-left"
          backgroundColor="transparent"
          color="black"
          style={destinationStyle.menu}
          onPress={this.destinationBackPressed.bind(this)}
          underlayColor="transparent"
        />
      )
    } else {
      return (
        <Icon.Button name="navicon"
          backgroundColor="transparent"
          color="black"
          style={destinationStyle.menu}
          onPress={this.menuPressed.bind(this)}
          underlayColor="transparent"
        />
      )
    }
  }

  renderCrossOrSpinner(){
    if (this.state.spin) {
      return (
        <Spinner style={{marginRight: 15}}
          isVisible={true}
          size={20}
          type='ChasingDots'
          color='#696969'
        />)
    } else {
      return (
        <Icon.Button name="remove"
          backgroundColor="transparent"
          color="black"
          style={destinationStyle.crossDestination}
          onPress={this.crossPressed.bind(this)}
          underlayColor="transparent"
        />
      )
    }
  }

  render() {
    return (
      <View style={destinationStyle.full}
        pointerEvents="box-none">
        {this.renderDestinationView()}
        <Image style={destinationStyle.destinationBorder}
          source={require('../../images/destinationBorder.png')}
          capInsets={{top: 15, left: 15, bottom: 15, right: 15}}
          resizeMode={Image.resizeMode.stretch}
        />
        <View style = {destinationStyle.destinationContainer}>
          {this.renderMenuOrBack()}
          <TextInput ref="textInput"
            style={destinationStyle.destinationTextInput}
            onChangeText={this.onChangeDestinationText.bind(this)}
            placeholder="Enter or Drop Destination"
            value={this.state.destinationText}
            lineBreakMode="tail"
            underlineColorAndroid="transparent"
            onFocus={this.onDestinationTextFocus.bind(this)}
          />
          {this.renderCrossOrSpinner()}
        </View>
      </View>
    );
  }
}
