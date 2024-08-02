import React, { useState, useEffect } from 'react';
import { StyleSheet, ImageBackground, FlatList, Image, View, Text, ScrollView, Pressable, Button} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import * as size from "react-native-size-matters";
import { BACKGROUND_COLOR } from '@birdwingo/react-native-instagram-stories/src/core/constants';
import { EvilIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';

import {Back} from "../../components/_common"

export default function ProfilePage(){
  return (
    <View style={{backgroundColor : "#121212"}}>
      <Back text="Settings"/>
      <Text style={{fontSize : 30 , color : "white"}}>Hello World</Text>
    </View>
  )
}