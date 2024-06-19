import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, Pressable, ImageBackground} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native';
import * as size from "react-native-size-matters"
import { Ionicons , Entypo} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const styles2 = StyleSheet.create({
  category : {
    height : size.verticalScale(120),
    margin : size.moderateScale(20),
    borderRadius : size.scale(23),
    paddingVertical : size.moderateScale(10),
    paddingHorizontal : size.moderateScale(33),
  },
   imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',  // Aligns children to the bottom
  },
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    height: size.scale(70),
    width: size.scale(70),
    borderRadius: size.scale(35),
  },

  text: {
    fontSize: size.verticalScale(15),
    textAlign: 'center',
  },
})

function Category(props : any){
  return (
    <Pressable onPress={() => router.navigate(props.route)}
      style={{
        marginHorizontal : size.scale(15),
        marginVertical : size.verticalScale(15),
      }} 
    >
      <ImageBackground source={props.image}
        style={{borderRadius : 8,}}
        imageStyle={{borderRadius : 8}} 
      >
    <LinearGradient style={{
      height : 200,
      padding : 20,
      borderRadius : 8,
    }} colors={["rgba(0,0,0,0.6)", "transparent" , ]}>
      <Text style={{color : "white" , fontSize : size.moderateScale(30) , fontFamily : "Poppins"}}>
        {props.title}
      </Text>
    </LinearGradient>
    </ImageBackground>
    </Pressable>
  )
}

// TODO : Add header
// TODO : Add proper token

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('../assets/fonts/Poppins-Medium.ttf'),
    "Montserrat" : require("../assets/fonts/Montserrat.ttf"),
  });
};


export default function TabTwoScreen() {
  const [data, setData] = useState<any>([]);
  const [req , setReq] = useState(0);
  fetchFonts();

  useEffect(() => {
    
  }, []); // Empty dependency array to run only once when the component mounts

  return (
    <ScrollView style={{backgroundColor : "#121212"}}>
      <Search></Search>
      <Category 
          title="CLOTHES" 
          image={{uri : "https://enews.hamariweb.com/tpl_assets/2023/05/19390895_1380758115349376_6758442144746647951_o-22w6h5b.jpg"}}
          colors={["#5DE0E6" , "#004AAD"]}
          route="/(tabs)/feed"
          height={90}
          width={70}
        />
        <Category 
          title="ACCESSORIES" 
          image={{uri : "https://karltayloreducation.com/wp-content/uploads/2020/09/Fashion-accessories-unretouched.jpg"}}
          route="/(tabs)/feed"
        />
        <Category 
          title="SHOES" 
          image={{uri : "https://www.visittruro.org.uk/wp-content/uploads/elementor/thumbs/iStock-1397720527-q1kjbg4vhc7yvdfise5d47gkkajd3c052frz7xaiww.jpg"}}
          route="/(tabs)/feed"
        />
    </ScrollView>
  );
}



export const Search = () => {
  const [val, setVal] = useState("")
  const [cross , setCross] = useState(true)

  useEffect(() => {
    if (val === ""){
      setCross(false)
    }
  } , [val])

  return(
    <View style={{alignItems: 'center', display : "flex" , flexDirection : "row", 
    width: size.scale(350),}}>
      <TextInput style={styles.enterText} onChangeText={t => {
        setVal(t)
        setCross(true)
      }} placeholder="What do you want to buy?" value={val}/>
        <Ionicons size={25} name="search" color="black" style={{position : "absolute", marginLeft : 60,}}/>

        {cross ? 
        
        <Pressable onPress={() => setVal("")} style={{
          position : "absolute", right : 60,
          padding : 10,
        }}><Entypo size={25} name="cross" color="black" /></Pressable> : <></>}
        
    </View>
 
  )
}

const styles = StyleSheet.create({
  enterText: {
    flex : 1,
    height: size.verticalScale(40), // height
    marginHorizontal: size.moderateScale(46), // margin or padding
    marginVertical : size.verticalScale(15),
    paddingLeft : 50,
    fontFamily : "Poppins",
    borderRadius: 20,
    borderColor: 'white',
    borderWidth: 2,
    backgroundColor : "#d3d3d3",
    color : "black",
  },

})
