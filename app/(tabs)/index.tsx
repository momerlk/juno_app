import { LinearGradient } from "expo-linear-gradient";
import React , {useRef, useState, useEffect} from "react"
import {
  ScrollView , View , Text, StyleSheet, Image, ImageBackground,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import * as size from "react-native-size-matters";
import { BlurView } from 'expo-blur';
import InstagramStories from '@birdwingo/react-native-instagram-stories';


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
  gradientRing: {
    height: size.scale(80),
    width: size.scale(80),
    borderRadius: size.scale(40),
    justifyContent: 'center',
    alignItems: 'center',
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
    <LinearGradient style={styles.category} colors={props.colors}>
      <Text style={{color : "white" , fontSize : size.moderateScale(30) , fontWeight : "bold"}}>
        {props.title}
      </Text>
      <Image source={props.image} style={{resizeMode : "cover", height : size.verticalScale(props.height), width : size.verticalScale(props.width), alignSelf : "flex-end" ,}}/>
    </LinearGradient>
    </Pressable>
  )
}


function Story(props : any){
 const spinValue = useRef(new Animated.Value(0)).current;


  const startAnimation = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });


  return (
    <Pressable onPress={startAnimation}>
      <Animated.View style={[styles.gradientRing, { transform: [{ rotate : spin }] }]}>
        <LinearGradient
          colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
          style={styles.gradientRing}
        >
          <Image
            source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9spkCid8NhfhtV_Y-0xMs5N1V5xB_NQHe9w&s" }}
            style={styles.image}
          />
        </LinearGradient>
      </Animated.View>
      <Text style={{textAlign : "center"}}>{props.user}</Text>
    </Pressable>
  )
}

// TODO : Add backend data gettting logic
// TODO : Add save progress logic
const stories = [{
    id: 'user1',
    name: '   ralphlauren    ',
    imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9spkCid8NhfhtV_Y-0xMs5N1V5xB_NQHe9w&s',
    stories: [
      { id: 'story1', source: { uri: 'https://w0.peakpx.com/wallpaper/410/733/HD-wallpaper-godfather-michael-corleone-vito-corleone.jpg' } },
      { id: 'story2', source: { uri: 'https://mfiles.alphacoders.com/985/985719.jpg' }},
    ]},

    {
    id: 'user2',
    name: '   hugoboss    ',
    imgUrl: 'https://brandpulse.ch/wp-content/uploads/2021/08/Work_Case_HB_Header2-2000x800.jpg',
    stories: [
      { id: 'story3', source: { uri: 'https://w0.peakpx.com/wallpaper/410/733/HD-wallpaper-godfather-michael-corleone-vito-corleone.jpg' } },
      { id: 'story4', source: { uri: 'https://mfiles.alphacoders.com/985/985719.jpg' }},
    ]},
    
  ];

// TODO : Dark Mode
export default class Home extends React.Component {
  constructor(props : any){
    super(props);
  }

  render(){
    return (
      <ScrollView style={{backgroundColor : "#121212"}}>

        {/* <View style={{margin : size.moderateScale(23) , marginTop : size.verticalScale(30)}}>
        <InstagramStories
          stories={stories}
          showName={true}
          avatarSize={size.verticalScale(60)}
          storyAvatarSize={size.verticalScale(27)}
          headerStyle={{}}
          avatarListContainerStyle={{marginTop : 15}}
          containerStyle={{}}
          nameTextStyle={{marginTop : 5, fontWeight : "400"}}
          textStyle={{color : "white", fontWeight : "bold" , fontSize : 13}}
        />
        </View>

        <Category 
          title="DISCOVER" 
          image={require("../assets/rocket.png")}
          colors={["#FF8200" , "#BF0A0A"]}
          route="/discover"
          height={100}
          width={100}
        />

        <Text style={{
          marginHorizontal : size.moderateScale(23) , 
          fontSize : size.moderateScale(30),
          fontWeight : "500"
        }}
        >Spotlight</Text>


        <Pressable style={{
          height: size.verticalScale(450),
          marginHorizontal : size.scale(30),
          marginVertical : size.verticalScale(15),
        }}
        onPress={() => router.navigate("/feed")} 
        >

          <ImageBackground
            source={{
              uri : "https://cdn.shopify.com/s/files/1/0620/8788/9062/files/DWEA2426GreenFront.jpg?v=1715939755"
            }} 
            imageStyle={{borderRadius : size.scale(20), height : size.verticalScale(450)}}
            style={styles.imageBackground}
          >
            <View style={styles.container}>
              <BlurView intensity={100} style={styles.blurContainer}>
                <Text style={styles.text}>Ethnic New Outfits</Text>
              </BlurView>
            </View>
          </ImageBackground>
        </Pressable> */}
        
        <View style={{marginVertical : size.verticalScale(10)}}></View>

        <Text style={{
          marginHorizontal : size.moderateScale(23) , 
          fontSize : size.moderateScale(30),
          fontWeight : "500",
          color : "white",
        }}
        > Categories</Text>
        {/* <Category 
          title="GROCERIES" 
          image={require("../assets/groceries.webp")}
          colors={["#73C615" , "#006D2C"]}
          route="/feed"
          height={90}
          width={70}
        /> */}
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