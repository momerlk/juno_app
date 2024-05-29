import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView } from 'react-native';
import * as Font from "expo-font";

import {router} from "expo-router";

import { ImageBackground, Pressable } from 'react-native';
import { scale } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';

interface Item {
  id: string;
  title: string;
  name: string;
  description: string;
  detail: string;
  price: number;
  size: string;
  color: string;
  image: string;
  isFav: boolean;
  rating: number;
}

interface Props {
  navigation: any;
  route: { params: { item: Item } };
}

// TODO : take params from router navigation

const ProductDetail: React.FC<Props> = () => {
  const { title, vendor, description, price, image_url , product_url} = mockData[0];

  const onAddToCart = () => {
    // Handle add to cart functionality
  };

  const _renderBottom = () => {
    return (
      <View style={styles.bottomButtons}>
        <Pressable
          onPress={() => {
            onAddToCart();
            router.navigate(product_url);
          }}
          style={styles.addButton}>
          <Text style={styles.buttonLabel}>Check Website</Text>
        </Pressable>
        <Text style={styles.price}>{`Rs. ${price}`}</Text>
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <ImageBackground
          style={styles.imageBackground}
          resizeMode="cover"
          source={{ uri: image_url }}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={styles.wishlistButton}>
              <Feather
                name="chevron-left"
                size={scale(20)}
                color={'#C80321'} // Replacing appColors.primary with '#FF6347'
              />
            </Pressable>

            <Pressable
              onPress={() => {
                // Handle add to wishlist functionality
              }}
              style={styles.wishlistButton}>
              <Feather
                name="heart"
                size={scale(20)}
                color={'#C80321'} // Replacing appColors.primary with '#FF6347'
              />
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={{fontSize : 28, marginBottom : 20}}>By {vendor}</Text>

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

          <View style={styles.section}>
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
    height: scale(400),
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
    fontWeight: '700',
  },
  description: {
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
    borderTopWidth: scale(1),
    borderColor: 'gray',
  },
  addButton: {
    backgroundColor: '#C80321', // Replacing appColors.primary with '#FF6347'
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(5),
  },
  buttonLabel: {
    color: 'white',
    fontSize: scale(18),
  },
  price: {
    fontSize: scale(18),
    fontWeight: '700',
  },
});


const mockData = [{
  "_id": {
    "$oid": "6650985355cb0cafd49c14c2"
  },
  "product_id": "cc0143d6-acfd-442f-83c4-658f9567b2d2",
  "product_url": "https://www.afrozeh.com/products/mahjabeen-1",
  "shopify_id": {
    "$numberLong": "8002372829418"
  },
  "handle": "mahjabeen-1",
  "title": "MAHJABEEN-22",
  "vendor": "afrozeh",
  "category": "",
  "image_url": "https://cdn.shopify.com/s/files/1/0052/2030/2897/products/5.jpg?v=1668433218",
  "description": "net embellished embroidered front back body mnet embellished embroidered front back panel pcsnet embroidered sleeve metersnet embroidered sleeve border metersraw silk embroidered sleeve border metersraw silk embroidered front back border metersnet embroidered dupatta side border metersnet embroidered dupatta meter",
  "price": "29900",
  "currency": "PKR",
  "options": [
    {
      "name": "Type",
      "position": 1,
      "values": [
        "Unstitched",
        "Stitched"
      ]
    }
  ],
  "tags": [],
  "available": true
}]