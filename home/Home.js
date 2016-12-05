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
} from 'react-native';
import { Actions } from 'react-native-router-flux';

import MapView from 'react-native-maps';
import Icon from 'react-native-vector-icons/FontAwesome';

import homeStyle from '../../styles/home/home';

import StationMarker from './StationMarker';

import DestinationView from './Destination';
import RetailerView from './Retailer';
import MenuView from './Menu';

const mapApi = require("../../lib/mapApi");
const stations = require("../../models/stations");

const defaultLatitudeDelta = 0.0922;
const defaultLongitudeDelta = 0.0421;

const VSNearby = 0;
const VSSearchDestination = 1;
const VSNearDestination = 2;
const VSDisplayRetailer = 3;

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initCenterOnMe: true,
      viewState: VSNearby,
      destinationLocation: {},
      stations: [],
      myPosition: {},
    };
    this.onPressMarkerStation = this.onPressMarkerStation.bind(this);
  }

  componentWillMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var initialPosition = JSON.stringify(position);
        this.setState({initialPosition});
      },
      (error) => alert(error.message),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      if (this.state.initCenterOnMe) {
        this.setState({
          region: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: defaultLatitudeDelta,
            longitudeDelta: defaultLongitudeDelta,
          },
          initCenterOnMe: false,
          myPosition: position,
        });
      } else {
        this.setState({
          myPosition: position,
        });
      }
    });
  }

  centerOnMe(){
    var region = {
      latitude: this.state.myPosition.coords.latitude,
      longitude: this.state.myPosition.coords.longitude,
      latitudeDelta: defaultLatitudeDelta,
      longitudeDelta: defaultLongitudeDelta,
    };
    this.onRegionChangeComplete(region);
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  onMenuPressed(){
    this.refs.menuView.show();
  }

  onDestinationFocus(isFocused){
    if(isFocused && this.state.viewState != VSSearchDestination){
      this.setState({viewState: VSSearchDestination});
    } else if(isFocused == false && this.state.viewState == VSSearchDestination) {
      this.setState({viewState: VSNearby});
    }
  }

  onRetailerDismiss(){
    this.setState({viewState: this.state.previousViewState});
  }

  onPickDestination(location){
    this.setState({
      region: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: defaultLatitudeDelta,
        longitudeDelta: defaultLongitudeDelta,
      },
      viewState: VSNearDestination,
      destinationLocation: location,
    });
  }

  onClearDestination(location){
    this.setState({
      destinationLocation: {},
      //viewState: VSNearby,
    });
  }

  onRegionChangeComplete(region) {
    this.setState({region: region});
    if (this.state.viewState != VSDisplayRetailer) {
      stations.getStationsInRegion(region).then(function(resp){
        this.setState({stations: resp});
      }.bind(this)).catch((error) => {
        console.log("catch", error);
      });
    }
  }

  onPressMarkerStation(station){
    if (this.state.viewState == VSDisplayRetailer){
      return;
    }
    this.setState({
      previousViewState: this.state.viewState,
      viewState: VSDisplayRetailer,
    });
    this.refs.retailerView.show(station);
  }

  renderDestinationMarker(){
    if (this.state.destinationLocation.hasOwnProperty("coords")){
      return (
        <MapView.Marker
          coordinate={this.state.destinationLocation.coords}
        />
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <View style = {homeStyle.full}>
        <StatusBar
           backgroundColor="rgba(0, 0, 0, 0.3)"
           translucent={true}
         />
{/***********  MapView  **************/}
        <MapView
          style = {homeStyle.full}
          region={this.state.region}
          showsUserLocation={true}
          toolbarEnabled={false}
          showsCompass={false}
          onRegionChangeComplete={this.onRegionChangeComplete.bind(this)}>
          {this.renderDestinationMarker()}
          {this.state.stations.map(station => (
            <MapView.Marker
              coordinate={station.coords}
              key={station._id}
              onPress={() => {
                this.onPressMarkerStation(station);
              }}
              >
              <StationMarker
                station={station}
              />
            </MapView.Marker>
          ))}
        </MapView>
        <TouchableHighlight style={homeStyle.centerOnMe}
          onPress={this.centerOnMe.bind(this)}
          underlayColor='transparent'>
          <Image
            style={{flex: 1}}
            source={require('../../images/centerOnMe.png')}
          />
        </TouchableHighlight>
{/***********  MapView  **************/}
        <DestinationView
          onMenuPressed={this.onMenuPressed.bind(this)}
          onDestinationFocus={this.onDestinationFocus.bind(this)}
          onPickDestination={this.onPickDestination.bind(this)}
          onClearDestination={this.onClearDestination.bind(this)}
        />
        <RetailerView
          ref="retailerView"
          onRetailerDismiss={this.onRetailerDismiss.bind(this)}
        />
        <MenuView ref="menuView" />
      </View>
    );
  }
}
