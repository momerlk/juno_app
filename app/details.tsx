import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView } from 'react-native';
import * as Font from "expo-font";
import { useWindowDimensions } from 'react-native';


import {router, useLocalSearchParams} from "expo-router";

import { ImageBackground, Pressable } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';

import PinchableCarousel from "./_image"


function toTitle(str : string) : string {
  if(str === undefined){
    return "";
  }
  str = str.replaceAll("_" , " ");
  const words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" "); 
}

// TODO : take params from router navigation

const ProductDetail: React.FC<any> = () => {
  const params = useLocalSearchParams();

  const { 
    title, vendor, description , images , variants , price, image_url , product_url
  } = params; // TODO : cannot send arrays in params
  
  const images_arr = (images as string).split(",");

  // swipe left to go back.

  const _renderBottom = () => {
    return (
      <View style={{...styles.bottomButtons, backgroundColor : "#121212"}}>
        <Pressable
          onPress={() => {
            router.navigate(product_url as string);
          }}
          style={{
            ...styles.addButton,
            backgroundColor : "white",
          }}>
          <Text style={styles.buttonLabel}>Check Website</Text>
        </Pressable>
        <Text style={styles.price}>{`Rs. ${price}`}</Text>
      </View>
    );
  };

  return (
    <>
      <ScrollView style={{...styles.container , backgroundColor : "#121212"}}>
        <PinchableCarousel images={images_arr}/>

        <View style={{...styles.detailsContainer , backgroundColor : "#121212"}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={{fontSize : 28, marginBottom : 20,color : "white"}}>
            By {toTitle(vendor as string)}</Text>

          {/* <View style={styles.sizeAndColorContainer}>
            <View style={styles.sizeContainer}>
              <Text style={styles.label}>Size</Text>
              <Text style={styles.value}>XL</Text>
            </View>

            <View style={styles.sizeContainer}>
              <Text style={styles.label}>Colour</Text>
              <View style={styles.itemColor} />
            </View>
          </View> */}

          <View style={{...styles.section}}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* <View>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Pressable onPress={() => router.navigate('WriteReview')}>
              <Text style={styles.writeReview}>Write your review</Text>
            </Pressable>

            <Text>Review Component</Text>
          </View> */}
        </View>
      </ScrollView>
      {_renderBottom()}
    </>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(0),
  },
  imageBackground: {
    height: verticalScale(500),
    width: '100%',
  },
  topBar: {
    marginTop: scale(40),
    paddingHorizontal: scale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wishlistButton: {
    borderRadius: scale(25),
    backgroundColor: 'white',
    height: scale(45),
    width: scale(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    paddingHorizontal: scale(20),
    marginBottom: scale(100),
  },
  title: {
    color : "white",
    fontWeight: '700',
    fontSize: scale(30),
    paddingVertical: scale(20),
  },
  sizeAndColorContainer: {
    paddingVertical: scale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sizeContainer: {
    flex: 0.47,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(20),
    borderWidth: scale(0.4),
    borderColor: 'gray',
  },
  label: {
    fontSize: scale(15),
  },
  value: {
    fontWeight: '700',
    fontSize: scale(15),
  },
  itemColor: {
    height: scale(20),
    width: scale(20),
    backgroundColor: '#FF6347', // Replacing appColors.primary with '#FF6347'
    borderRadius: scale(5),
  },
  section: {
    paddingVertical: scale(20),
  },
  sectionTitle: {
    fontSize: scale(20),
    color : "white",
    fontWeight: '700',
  },
  description: {
    color : "white",
    fontSize: scale(14),
    lineHeight: scale(25),
    paddingVertical: scale(20),
  },
  writeReview: {
    paddingVertical: scale(10),
    fontSize: scale(14),
    color: '#FF6347', // Replacing appColors.primary with '#FF6347'
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
  },
  addButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(5),
  },
  buttonLabel: {
    fontSize: scale(18),
  },
  price: {
    color : "white",
    fontSize: scale(22),
  },
});
