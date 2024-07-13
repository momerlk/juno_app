import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView } from 'react-native';
import * as Font from "expo-font";
import { useWindowDimensions } from 'react-native';

import {router, useLocalSearchParams} from "expo-router";

import { ImageBackground, Pressable, TouchableOpacity } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PinchableCarousel from "./_image"
import { Back , toTitle, fmtPrice, DropDown as DropDownPicker, PrimaryButton, SecondaryButton, asyncTimeout} from './_common';

import * as size from "react-native-size-matters"
import * as api from "./api"

function DropDown(props : any){
  const [open , setOpen] = useState(false);
  const [value , setValue] = useState(null);
  const [items, setItems] = useState(props.data);

  return (
    <View style={{
      marginTop : size.verticalScale(10),
      marginBottom : 0,
      zIndex : open ? 3000 : 1,
    }}>

      <DropDownPicker
        data={items.map((item : any) => {
          try {
          if (props.data === undefined || props.data === null){
            return
          }} catch(e){ return }
            return  {label : item["title"] , value : item["id"]} 
          })
        } 
        title={"Options"}
        onChange={props.onChange}
        multiple={false}
        selected={null}
        range={{min : [], max : []}}
        onPress={() => {}}
        containerStyle={{
          marginHorizontal : 0,
        }}
        buttonStyle={{
          width : size.scale(120),
          marginHorizontal : 0,
        }}
      />
    </View>
  )
}

// TODO : take params from router navigation

const ProductDetail: React.FC<any> = () => {
  const params = useLocalSearchParams();

  const { 
    data
  } = params; // TODO : cannot send arrays in params

  const item = JSON.parse(data as string)
  const { title, vendor, description , images , variants, discount, compare_price , price, image_url , product_url, product_id} = item

  const [quantity , setQuantity] = useState(1)

  let discountNum = 0;
  if (discount !== undefined){
    discountNum = parseInt(discount as string);
  }
  
  const images_arr = images;

  // swipe left to go back.

  const _renderBottom = () => {
    return (
      <View style={{...styles.bottomButtons, backgroundColor : "#121212", borderTopWidth : 1, borderColor : "white"}}>
        <PrimaryButton
          onPress={() => {
              router.navigate({
                pathname : "/browser",
                params : {
                  uri : product_url as string,
                }
              })
            }}
          style={{
            marginVertical : 0,
          }} 
          text="Check Website" 
        />
        
      </View>
    );
  };

  const height = 400;

  // TODO : 

  return (
    <>
      <ScrollView style={{...styles.container , backgroundColor : "#121212"}}>
        <Back text="Go Back"/>

        <PinchableCarousel images={images_arr}/>

        <View style={{...styles.detailsContainer , backgroundColor : "#121212"}}>
          {/* TODO : totTitle doesn't work in some cases */}
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
                        marginLeft : 20,
                        fontFamily : "Poppins",
                        color : "white",
                        textDecorationLine : "line-through",
                      }}>{fmtPrice(parseInt(compare_price as string))}</Text>
                  </View>
                  
                  
                  
                  <Text style={{
                    fontSize: 24,
                    fontWeight : "bold",
                    fontFamily : "Poppins",
                    color : "#FF1D18",
                  }}>{discount}% Off</Text>
                  </>
                )
              } else {
                return (
                  <Text style={{
                    fontSize: 24,
                    color : "white",
                    fontFamily : "Poppins",
                  }}>Rs. {fmtPrice(parseInt(price as string))}</Text>
                )
              }
            })()}
          </View>

          <DropDown 
            title="Options"
            onChange={(id : string) => {
            }}
            data={variants} 
          />
          <SecondaryButton
          onPress={async () => {
              await api.postAction(
                {
                    "user_id" : "",
                    "action_type" : "added_to_cart",
                    "action_timestamp" : "",
                    "product_id" : `${product_id}`,
                }
              )
              setTimeout(() => router.navigate("/(tabs)/cart"), 120)
            }}
          style={{
            marginVertical : 0,
          }} 
          text="Add to Cart" 
        />

          <View style={{...styles.section}}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Text style={[styles.description , {fontFamily : "Poppins"}]}>{description}</Text>
          </View>

          

          
        </View>
        
      </ScrollView>
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
    paddingHorizontal: scale(20),
    paddingBottom : 10,
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
