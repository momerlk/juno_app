import { LinearGradient } from "expo-linear-gradient";
import React from "react"
import {
  ScrollView , View , Text, StyleSheet, Image, ImageBackground,
  Pressable
} from "react-native";
import * as size from "react-native-size-matters";
import { BlurView } from 'expo-blur';

import {router} from "expo-router";

const styles = StyleSheet.create({
  category : {
    height : size.verticalScale(120),
    margin : size.moderateScale(20),
    borderRadius : size.scale(23),
    paddingVertical : size.moderateScale(10),
    paddingHorizontal : size.moderateScale(33),
  },
   imageBackground: {
    flex: 1,
    height : size.verticalScale(400),
    justifyContent: 'flex-end',  // Aligns children to the bottom
  },
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blurContainer: {
    width: '90%',  // Adjust width as needed
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'lightgray',
    overflow: 'hidden',
  },
  text: {
    fontSize: size.verticalScale(15),
    textAlign: 'center',
  },
})

function Category(props : any){
  return (
    <Pressable onPress={() => router.navigate(props.route)}>
    <LinearGradient style={styles.category} colors={props.colors}>
      <Text style={{color : "white" , fontSize : size.moderateScale(30) , fontWeight : "bold"}}>
        {props.title}
      </Text>
      <Image source={props.image} style={{resizeMode : "cover", height : size.verticalScale(props.height), width : size.verticalScale(props.width), alignSelf : "flex-end" ,}}/>
    </LinearGradient>
    </Pressable>
  )
}

export default class Home extends React.Component {
  constructor(props : any){
    super(props);
  }

  render(){
    return (
      <ScrollView>
        <View style={{margin : size.moderateScale(40) , display : "flex" , flexDirection : "row"}}>
          <Image source={{uri : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9spkCid8NhfhtV_Y-0xMs5N1V5xB_NQHe9w&s"}} 
          style={{height : size.scale(70), width : size.scale(70), borderRadius : size.scale(50)}}/>
          <Image source={{uri : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9spkCid8NhfhtV_Y-0xMs5N1V5xB_NQHe9w&s"}} 
          style={{height : size.scale(70), width : size.scale(70), borderRadius : size.scale(50)}}/>
          <Image source={{uri : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9spkCid8NhfhtV_Y-0xMs5N1V5xB_NQHe9w&s"}} 
          style={{height : size.scale(70), width : size.scale(70), borderRadius : size.scale(50)}}/>
        </View>
        <Category 
          title="DISCOVER" 
          image={require("../assets/rocket.png")}
          colors={["#FF8200" , "#BF0A0A"]}
          route="/feed"
          height={100}
          width={100}
        />

        {/* Picks for you section */}
        <Text style={{
          marginHorizontal : size.moderateScale(23) , 
          fontSize : size.moderateScale(30),
          fontWeight : "500"
        }}
        > Picks For You</Text>


        <Pressable style={{
          height: size.verticalScale(400),
          marginHorizontal : size.scale(30),
        }}
        onPress={() => alert("top picks clicked!")} 
        >

          <View style={{marginVertical : size.verticalScale(10)}}></View>

        {/* TODO : Make this a component */}
        <ImageBackground
        source={{
          uri : "https://cdn.shopify.com/s/files/1/0620/8788/9062/files/MBFS23303Offwhite.jpg?v=1716290767"
        }} 
        imageStyle={{borderRadius : size.scale(20)}}
        style={styles.imageBackground}
        >
          <View style={styles.container}>
          <BlurView intensity={100} style={styles.blurContainer}>
            <Text style={styles.text}>Ethnic New Outfits</Text>
          </BlurView>
        </View>
        </ImageBackground>
        </Pressable>
        {/* Picks for you end */}

        <View style={{marginVertical : size.verticalScale(20)}}></View>

        <Text style={{
          marginHorizontal : size.moderateScale(23) , 
          fontSize : size.moderateScale(30),
          fontWeight : "500"
        }}
        >️‍🔥 Categories</Text>
        <Category 
          title="CLOTHES" 
          image={require("../assets/clothes.png")}
          colors={["#5DE0E6" , "#004AAD"]}
          route="/feed"
          height={90}
          width={70}
        />
        <Category 
          title="ACCESSORIES" 
          image={require("../assets/accessories.png")}
          colors={["#CB6CE6" , "#FF3BBC"]}
          route="/feed"
          height={100}
          width={100}
        />
        <Category 
          title="SHOES" 
          image={require("../assets/shoes.webp")}
          colors={["#FF7A00" , "#FFD65B"]}
          route="/feed"
          height={100}
          width={100}
        />
      </ScrollView>
    )
  }
}