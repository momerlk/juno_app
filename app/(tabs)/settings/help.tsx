import { Link } from "expo-router";
import {Back} from "../_common"

import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function HelpPage() {
  // TODO : Add call links, website links
  return (
    <>
    <View style={{backgroundColor : "#121212", paddingBottom : 10,}}>
    <Back text="Settings"/>
    </View>
    <ScrollView style={styles.container}>
      

      <Text style={styles.heading}>Welcome to Juno!</Text>

      <Text style={styles.subheading}>Getting Started</Text>
      <Text style={styles.text}>Swipe to Shop: Swipe up to add to cart, left if you dislike the product and right if you like it.</Text>
      <Text style={styles.text}>Explore: Browse products, discover brands and use the search feature to find what you need.</Text>
      <Text style={styles.text}>Filter : Use the filter button at the bottom to select brands,colors and other fields</Text>

      <Text style={styles.subheading}>Upcoming Features</Text>
      <Text style={styles.text}>Messaging Forum: Connect with other users and share experiences.</Text>
      <Text style={styles.text}>Image Search: Find products by uploading a photo.</Text>
      <Text style={styles.text}>Direct Messaging: Communicate directly with brands and creators.</Text>

      <Text style={styles.subheading}>Privacy and Security</Text>
      <Text style={styles.text}>Only verified users can sign up.</Text>
      <Text style={styles.text}>Your data is safe with us, and explicit content is strictly prohibited.</Text>

      <Text style={styles.subheading}>Need Help?</Text>
      <Text style={styles.text}>Visit our FAQ section on our website or contact our founder on +92 300 0856955</Text>
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    paddingBottom : 100,
  },
  heading: {
    fontSize: 24,
    fontFamily : "Poppins",
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 20,
    fontFamily : "Poppins",
    color: 'white',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
});

