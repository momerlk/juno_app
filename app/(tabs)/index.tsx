import { LinearGradient } from "expo-linear-gradient";
import React from "react"
import {ScrollView , View , Text, StyleSheet, Pressable, Image} from "react-native";
import * as size from "react-native-size-matters";

import {router} from "expo-router";

const styles = StyleSheet.create({
  category : {
    height : size.verticalScale(120),
    margin : size.moderateScale(20),
    borderRadius : size.scale(23),
    paddingVertical : size.moderateScale(10),
    paddingHorizontal : size.moderateScale(33),
  },
})

function Category(props : any){
  return (
    <Pressable onPress={() => router.navigate(props.route)}>
    <LinearGradient style={styles.category} colors={props.colors}>
      <Text style={{color : "white" , fontSize : size.moderateScale(30) , fontWeight : "bold"}}>
        {props.title}
      </Text>
      <Image source={props.image} style={{resizeMode : "cover", height : size.verticalScale(90), width : size.verticalScale(70), alignSelf : "flex-end"}}/>
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
        />
        <Text style={{
          marginHorizontal : size.moderateScale(23) , 
          fontSize : size.moderateScale(30),
          fontWeight : "500"
        }}
        > Categories</Text>
        <Category 
          title="CLOTHES" 
          image={require("../assets/clothes.png")}
          colors={["#5DE0E6" , "#004AAD"]}
          route="/feed"
        />
        <Category 
          title="ACCESSORIES" 
          image={require("../assets/accessories.png")}
          colors={["#CB6CE6" , "#FF3BBC"]}
          route="/feed"
        />
        <Category 
          title="ACCESSORIES" 
          image={require("../assets/accessories.png")}
          colors={["#CB6CE6" , "#FF3BBC"]}
          route="/feed"
        />
      </ScrollView>
    )
  }
}