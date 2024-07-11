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

export default function SettingsPage() {
  // TODO : Get User details from backend
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#121212' }}>
      <Back text="Settings"/>
      <View style={{marginTop : 100}}></View>

    </ScrollView>
  );
}
