import React, { useState, useEffect } from 'react';
import { StyleSheet,
  TouchableOpacity, ImageBackground, Dimensions, FlatList, Image, View, Text, ScrollView, Pressable, Button} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import * as size from "react-native-size-matters";
import {Logo, Loading, fmtPrice} from "../components/_common"

import * as api from "../backend/api"

import {DropDown as DropDownPicker, toTitle, shortTitle} from '../components/_common';
import { fetchFonts } from '../backend/util';

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

export default function CartPage() {
  const [data, setData] = useState<any>({});
  const [req , setReq] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [loading , setLoading] = useState(true);
  fetchFonts();
  
  useEffect(() => {
    (async() => {
      const cart = await api.getCart();
      if(cart !== null){
        setData(cart)
        setLoading(false)
      }
    })()
  }, [])

  if(loading === true){
    return <Loading />
  }

  return (
    <View style={{flex : 1, backgroundColor : "#121212"}}>
      <Logo />
      <View style={{marginTop : 100}}></View>
     <FlatList
          contentContainerStyle={{}}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={data}
          keyExtractor={(item) => item.vendor}
          renderItem={({ item }) => <Cart item={item}/>}
          // TODO : Test this fully
          onRefresh={async () => {
            setRefresh(true);
            const cart = await api.getCart();
            if(cart !== null){
              setData(cart)
            }
            setRefresh(false);
          }}
          refreshing={refresh}
        />
    </View>
  );
}


// TODO : create an api endpoint /cartupdate which just updates the cart based on these actions

const deleteAction = "deleted_from_cart"

export function Cart (props : any) { 
  const vendor_data = props.item
  const [items, setItems] = useState(props.item.items);
  // TODO : replace with actual shopify permalink
  const [uri, setUri] = useState("")

  const [order, setOrder] = useState<any>({})

  const handleDelete = async (productId : string) => {
    // Filter out the item to be deleted
    await api.postAction({
        "user_id" : "",
        "action_type" : deleteAction,
        "action_timestamp" : "",
        "product_id" : `${productId}`
    }) 
    const updatedItems = items.filter((item : any) => item.product_id !== productId);
    setItems(updatedItems);
  }; 


  // TODO : add delete and update functions and connect them to server

  return(
    <View style={{marginTop : 40 , paddingBottom : 50}}>
      
        <Text style={{marginTop : 10, color : "white", fontSize : 24, marginLeft : 14, fontFamily : "Poppins_400Regular", }}>
          {toTitle(vendor_data.vendor)}</Text>
        <FlatList
          contentContainerStyle={{alignSelf: 'flex-start',marginLeft : 4, flexGrow : 1}}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={items}
          keyExtractor={(item) => {
            const p_url : string = item.product_url;
            const urlObject = new URL(p_url);
            const base_url = `${urlObject.protocol}//${urlObject.host}`;
            setUri(base_url);
            return item.product_id;
          }}
          renderItem={({ item }) => <Card item={item}
              onDelete={() => handleDelete(item.product_id)}
              onChange={(id : string , quantity : number) => {
                
                if (id !== "null" && id !== null){
                  const product = {
                    "variant" : id,
                    "quantity" : quantity,
                  }
                  order[item.product_id] = product
                  setOrder(order)
                }

              }} 
          />} 
          style={{zIndex : 2000}}
        />
        <Pressable
        style={[
          {
            paddingBottom: 14,
            paddingVertical: 8,
            marginHorizontal : 14,
            marginTop : 20,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex : 0,
          },
          { backgroundColor: "white" },
        ]}
        onPress={() => {
          
          const items = []
          for (const product of Object.values(order)){
            items.push(product)
          }

          const cartItems = items.map((item : any) => `${item.variant}:${item.quantity}`).join(',');
          const orderUrl = `${uri}/cart/${cartItems}`;
          router.navigate({
            pathname : "/browser",
            params : {
              uri : orderUrl,
            }
          })
        }}
      >
        <Text style={{ fontSize: 18, color: "black", fontFamily : "Poppins_400Regular" }}>Checkout</Text>
      </Pressable>
      </View>
  )
}

function DropDown(props : any){
  const [open , setOpen] = useState(false);
  const [value , setValue] = useState(null);
  const [items, setItems] = useState(props.data);

  return (
    <View style={{
      marginLeft : 5,
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
        selected={null}
        multiple={false}
        range={{min : [], max : []}}
        onPress={() => {}}
        containerStyle={{
          marginHorizontal :0,
        }}
        buttonStyle={{
          width : size.scale(120),
          marginHorizontal : 0,
          paddingVertical : 8,
        }}
        textStyle={{
          fontSize : 16
        }}
      />
    </View>
  )
}


function Card(props : any){
  // TODO : make this navigate to /details on press

  // TODO : add proper quantity connected to backend
  const [quantity , setQuantity] = useState(1);
  const [id , setId] = useState("")
  const [price , setPrice] = useState(props.item.price)
  


  return (
    <View style={{display : "flex", flexDirection : "row"}}>
      <Image
              style={{
                minHeight : size.verticalScale(200), 
                width : SCREEN_WIDTH/2,
                marginHorizontal : size.moderateScale(8),
                marginVertical : size.verticalScale(5),
                borderRadius : 8,
              }}
              source={{ uri: props.item.image_url }}
            />
      <View style={{display : "flex" , flexDirection : "column"}}>
        <View style={{marginTop : size.verticalScale(20),}}>
          <Text style={{
            color : "white",
            marginHorizontal : 10,
            fontSize : 18,
            fontFamily : "Poppins_400Regular",
            width : size.scale(140),
            }}>
              {shortTitle(props.item.title)}
            </Text> 

            <Text style={{
            color : "gray",
            marginHorizontal : 10,
            marginVertical : 6,
            fontSize : 18,
            fontFamily : "Poppins_400Regular",
            width : size.scale(140),
            }}>
              By {toTitle(props.item.vendor)}
            </Text> 
          <View style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 10,
          }}>
            
            <Text style={{
              fontSize: 15, fontFamily: "Poppins_400Regular",
              color : "white"
            }}>Rs. {fmtPrice(price * quantity)}</Text>
          </View>
        </View>

        
        
        <DropDown 
          title="Options"
          onChange={(idParam : string) => {
            setId(idParam) 

            // update to price to match option
            const variants = props.item.variants;
            const idParsed = JSON.parse(idParam)
            for(let i = 0;i < variants.length;i++){
              const vId = parseInt(variants[i].id)
              if (vId === idParsed){
                setPrice(variants[i].price);
              }
            }


            props.onChange(idParam , quantity)
          }}
          data={props.item.variants} 
        />

        <TouchableOpacity style={{marginLeft : 10}} onPress={props.onDelete}>
          <Text style={{

              fontSize: 18, fontFamily: "Poppins_400Regular",
              color : "#FF2C2C",
            }}>Delete</Text>
        </TouchableOpacity>

        <View style={{
          marginTop : size.verticalScale(60),
          marginHorizontal : 10, 
          display : "flex" , 
          flexDirection : "row",
          backgroundColor : "black",
          borderColor : "white",
          borderWidth : 1,
          borderRadius : 10,
          width : size.scale(100),
        }}>
          <TouchableOpacity style={{width : size.scale(35), height : size.scale(35), borderRadius : 6}}
            onPress={() => {
              if (quantity < 1){
                return
              }
              if (quantity === 1){
                return
              }
              setQuantity(quantity - 1)
              props.onChange(id , quantity - 1)
            }}
          >
            <Text style={{color : "gray", fontSize : 27, alignSelf : "center"}}>-</Text>
          </TouchableOpacity>
          <Text style={{marginHorizontal : 10, color : "white", fontSize : 20, alignSelf : "center"}}>{quantity}</Text>
          <TouchableOpacity style={{width : size.scale(35), height : size.scale(35), borderRadius : 6}}
            onPress={() => {
              if (quantity > 8){
                return
              }
              setQuantity(quantity + 1)
              props.onChange(id , quantity + 1)
            }} 
          >
            <Text style={{color : "gray", fontSize : 27, alignSelf : "center"}}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

