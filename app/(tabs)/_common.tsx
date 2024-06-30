import React from "react"
import {Text , Image} from "react-native"

export function Logo(){
  const topMargin = 42;
    return (
    <>
        <Text style={{
          color : "white",
          position : "absolute",
          marginTop : topMargin,
          marginHorizontal : 52,
          fontSize : 25,
          fontFamily : "Poppins"
        }} 
      >
        JUNO
      </Text>


        <Image 
          source={require("../assets/juno_icon.png")} 
          style={{
            position : "absolute",
            left :10, 
            height : 40, 
            width : 40, 
            resizeMode : "cover", 
            alignSelf : "center", 
            marginTop : topMargin,
          }} 
        />
    </>
    )
}