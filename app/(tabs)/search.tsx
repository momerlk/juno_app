import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, Pressable} from 'react-native';
import * as Font from "expo-font";
import {router} from "expo-router";
import Button from '../components/Button';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native';
import * as size from "react-native-size-matters"
import AntDesign from '@expo/vector-icons/AntDesign';
import { Entypo } from '@expo/vector-icons';
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
    <Pressable onPress={() => router.navigate(props.route)}>
    <LinearGradient style={styles2.category} colors={props.colors}>
      <Text style={{color : "white" , fontSize : size.moderateScale(30) , fontWeight : "bold"}}>
        {props.title}
      </Text>
      <Image source={props.image} style={{resizeMode : "cover", height : size.verticalScale(props.height), width : size.verticalScale(props.width), alignSelf : "flex-end" ,}}/>
    </LinearGradient>
    </Pressable>
  )
}

// TODO : Add header
// TODO : Add proper token

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./Poppins-Medium.ttf'),
    "Montserrat" : require("./Montserrat.ttf"),
  });
};


export default function TabTwoScreen() {
  const [data, setData] = useState<any>([]);
  const [req , setReq] = useState(0);
  fetchFonts();

  useEffect(() => {
    const fetchData = async () => {
      const myHeaders = new Headers();
      // TODO : Replace with actual token
      let token = null
      try {
        token = await AsyncStorage.getItem("token")
      } catch (e){
        alert(`failed to get authentication token! Sign in again`)
        router.replace("/sign-in")
      }
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
      };

      try {
        const response = await fetch("http://192.168.18.16:3000/user/liked", requestOptions);const result = await response.json();
        if(response.status !== 200){
          alert(`failed to get liked products. error : ${result.message}`)
          return;
        }
        setData(result);
      } catch (error) {
        console.log(`Error fetching data: ${error}`);
        setReq(1);
      }
    };

    if(req == 0){
      fetchData();
    }
  }, []); // Empty dependency array to run only once when the component mounts

  return (
    <ScrollView>
      <Search></Search>
      <Category 
          title="CLOTHES" 
          image={require("../assets/clothes.png")}
          colors={["#5DE0E6" , "#004AAD"]}
          route="/(tabs)/feed"
          height={90}
          width={70}
        />
        <Category 
          title="ACCESSORIES" 
          image={require("../assets/accessories.png")}
          colors={["#CB6CE6" , "#FF3BBC"]}
          route="/(tabs)/feed"
          height={100}
          width={100}
        />
        <Category 
          title="SHOES" 
          image={require("../assets/shoes.webp")}
          colors={["#FF7A00" , "#FFD65B"]}
          route="/(tabs)/feed"
          height={100}
          width={100}
        />
    </ScrollView>
  );
}



const Search = () => {
  return(
    <>
    <View style={{alignItems: 'center'}}>
      <TextInput style={styles.enterText} placeholder="             What do you want to buy?"/>
    </View>
    <>
          <AntDesign style={{left: 65, bottom: 83}} name="search1" size={20} color="black" />
    </>
    <>
    <Entypo style={{bottom: 107, left: 310, }} name="cross" size={25} color="black" />
    </>
    </>
  )
}

const styles = StyleSheet.create({
  enterText: {
    width: size.scale(270), // width
    height: size.verticalScale(40), // height
    margin: size.moderateScale(46), // margin or padding
    borderRadius: 20,
    borderColor: 'black',
    borderWidth: 2,

  },

})
