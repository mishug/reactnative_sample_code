'use strict';

import React, { Component } from 'react';
import {View, Image, Text } from 'react-native';

import markersStyle from '../../styles/home/markers';

const services = require('../../lib/services');
var stations = require('../../models/stations');

export default class Signin extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  shouldDisplayBadge(){
    return this.props.station.mergedStationCount > 1;
  }

  renderBadge() {
    if (!this.shouldDisplayBadge()) {
      return null;
    } else {
      return (
        <Text style={markersStyle.badge} >
          {this.props.station.mergedStationCount}
        </Text>
      )
    }
  }

  renderMill() {
    var mill = services.millOfPrice(this.props.station.selectedProduct.price);
    if (mill == 0) {
      return null;
    } else {
      return (
        <Text style={markersStyle.mill} >
          {mill}
        </Text>
      )
    }
  }

  render() {
    return (
      <View style={this.shouldDisplayBadge() ? markersStyle.markerBackBadge : markersStyle.markerBack}>
        <Image style={{flex:1}}
          source={this.shouldDisplayBadge() ? require('../../images/markerBackBadge.png') : require('../../images/markerBack.png')}
          />
        <View style={[markersStyle.markerBackPosition, this.shouldDisplayBadge() ? markersStyle.markerBackBadge : markersStyle.markerBack]}>
          <View style={{flexDirection: 'row'}}>
            <Text style={this.shouldDisplayBadge() ? markersStyle.brandBadge : markersStyle.brand}
              numberOfLines = {1}  >
              {this.props.station.brand}
            </Text>
            {this.renderBadge()}
          </View>
          <View style={{flexDirection: 'row'}}>
            <Text style={markersStyle.price}
              numberOfLines = {1} >
              {services.price2cent(this.props.station.selectedProduct.price)}
            </Text>
            {this.renderMill()}
          </View>
        </View>
      </View>
    );
  }
}

/*
<Image style={markersStyle.markerBubble}
  source={require('../../images/markerBack.png')}
  resizeMode={Image.resizeMode.stretch}
/>

*/
