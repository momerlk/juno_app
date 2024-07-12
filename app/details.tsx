import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView } from 'react-native';
import * as Font from "expo-font";
import { useWindowDimensions } from 'react-native';


import {router, useLocalSearchParams} from "expo-router";

import { ImageBackground, Pressable } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PinchableCarousel from "./_image"
import { Back , toTitle, fmtPrice} from './(tabs)/_common';



// TODO : take params from router navigation

const ProductDetail: React.FC<any> = () => {
  const params = useLocalSearchParams();

  const { 
    title, vendor, description , images , variants, discount, compare_price , price, image_url , product_url
  } = params; // TODO : cannot send arrays in params

  let discountNum = 0;
  if (discount !== undefined){
    discountNum = parseInt(discount as string);
  }
  
  const images_arr = (images as string).split(",");

  // swipe left to go back.

  const _renderBottom = () => {
    return (
      <View style={{...styles.bottomButtons, backgroundColor : "#121212"}}>
        <Pressable
          onPress={() => {
            router.navigate({
              pathname : "/browser",
              params : {
                uri : product_url as string,
              }
            })
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

  const height = 400;

  return (
    <>
      <ScrollView style={{...styles.container , backgroundColor : "#121212"}}>
        <Back text="Go Back"/>

        <PinchableCarousel images={images_arr}/>

        <View style={{...styles.detailsContainer , backgroundColor : "#121212"}}>
          <Text style={[styles.title , {fontFamily : "Poppins"}]}>{toTitle(title as string)}</Text>
          <Text style={{fontSize : 28, marginBottom : 20,color : "white" , fontFamily : "Poppins"}}>
            By {toTitle(vendor as string)}</Text>

          <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}>

                  {(() => {
                    if (discountNum > 0 && parseInt(compare_price as string) > 0){
                      return (
                        <>

                        <View style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}>
                          <Text style={{
                            fontSize: 24,
                            color : "white",
                            fontFamily : "Poppins",
                          }}>Rs. {fmtPrice(parseInt(price as string))}</Text>
                          
                          <Text style={{
                              fontSize: 24,
                              fontWeight : "bold",
                              fontFamily : "Poppins",
                              color : "white",
                              marginHorizontal : 10,
                              textDecorationLine : "line-through",
                            }}>{fmtPrice(parseInt(compare_price as string))}</Text>
                        </View>
                        
                        
                        
                        <Text style={{
                          fontSize: 24,
                          fontWeight : "bold",
                          fontFamily : "Poppins",
                          color : "#FF1D18",
                          marginHorizontal : 10,
                        }}>{discount}% Off</Text>
                        </>
                      )
                    } else {
                      return (
                        <Text style={{
                          fontSize: 24,
                          color : "white",
                          fontFamily : "Poppins",
                          marginHorizontal : 10,
                        }}>Rs. {fmtPrice(parseInt(price as string))}</Text>
                      )
                    }
                  })()}
                </View>

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
            <Text style={[styles.description , {fontFamily : "Poppins"}]}>{description}</Text>
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
  },
  imageBackground: {
    height: verticalScale(500),
    width: '110%',
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
