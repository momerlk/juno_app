import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform} from 'react-native';
import {Link} from "expo-router"
import {View} from "react-native";
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <View>
      <Link href="/sign-in">Sign in</Link>
      <Link href="/welcome">Sign in</Link>
    </View>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

function likedImage(){
  
}