import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  Text,
  Pressable,
  Switch,
  Image,
} from 'react-native';
import {router} from "expo-router"
import { 
  FontAwesome, FontAwesome6, MaterialIcons, Feather,
  Ionicons,
} from '@expo/vector-icons';
import * as size from "react-native-size-matters"
import {Back} from "../_common"

import * as api from "../api"

const aboutText = "Juno is dedicated to making online shopping easier and more personalized.\n\n\nOur platform allows users to connect with brands, receive tailored recommendations, and discover new products effortlessly.\n\n\nWith a focus on privacy and security, Juno is a trusted space for women to sell homemade products and small businesses to thrive.\n\n\nJoin Juno today and experience the future of e-commerce!"

export default function SettingsPage() {
  // TODO : Get User details from backend
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#121212', paddingBottom : 100,}}>
      <Back text="Settings"/>
      <Text style={{
          marginHorizontal : 20,
        color : "white", 
        fontSize : 24,
        fontFamily : "Poppins",
        fontWeight : "bold",
        marginVertical : 40,
        }}>
        About Juno
        </Text>
      <Text style={{marginHorizontal : 20, color : "white", fontSize : 20,fontFamily : "Poppins"}}>
        {aboutText}
      </Text>
    </ScrollView>
  );
}
