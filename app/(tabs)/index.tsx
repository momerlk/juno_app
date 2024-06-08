import { LinearGradient } from "expo-linear-gradient";
import React , {useRef, useState, useEffect} from "react"
import {
  ScrollView , View , Text, StyleSheet, Image, ImageBackground,
  FlatList,
  Pressable,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import * as size from "react-native-size-matters";
import { BlurView } from 'expo-blur';
import InstagramStories from '@birdwingo/react-native-instagram-stories';
import * as Font from "expo-font";
const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./Poppins-Medium.ttf'),
    'Montserrat': require('./Montserrat.ttf'),
  });
};

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

const item = {
  "product_id": "ef380375-0766-4476-9636-3312908c7b7a",
  "product_url": "https://www.mariab.pk/products/mb-ea24-83-black",
  "shopify_id": {
    "$numberLong": "8133789122726"
  },
  "handle": "mb-ea24-83-black",
  "title": "Printed Arabic Lawn Co Ord Set | Mb Ea24 83",
  "vendor": "maria_b",
  "vendor_title": "Maria B",
  "category": "",
  "product_type": "M.Basics Casuals",
  "image_url": "https://cdn.shopify.com/s/files/1/0620/8788/9062/files/MB-EA24-83Black_fbe0ab6d-d366-4ea5-bbfe-647052531500.jpg?v=1716022716",
  "description": "TopButton Down Loose Fit TopPrinted Front & BackColor: BlackFabric: Arabic LawnTrousersPrinted Dhaka TrousersElasticated WaistbandColor: BlackFabric: Arabic lawnModel is wearing size xsNote: Only Dry Clean",
  "price": "5990",
  "currency": "PKR",
  "options": [
    {
      "name": "Size",
      "position": 1,
      "values": [
        "XS",
        "S",
        "M",
        "L",
        "XL"
      ]
    },
    {
      "name": "Color",
      "position": 2,
      "values": [
        "Black"
      ]
    }
  ],
  "tags": [
    "14-May-24",
    "_label_New",
    "dhlcode:6104 1900",
    "dhldes:Women Casual Shirt",
    "Item_Tax_Rate:15",
    "M.Basics",
    "M.Basics Casuals",
    "M.Basics New Arrivals",
    "M.Basics Ready to Wear",
    "M.Basics-Shirts",
    "Printed",
    "Shirts",
    "women-size-guide"
  ],
  "available": true
}

function toTitle(str : string) : string {
    if (str === undefined){
      return ""
    }
    str = str.replaceAll("_" , " ");
    const words = str.split(" ");
    for (let i = 0; i < words.length; i++) {
      try {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1);
      } catch(e){
        return ""
      }
    }

    return words.join(" "); 
  }

  function shortTitle(str : string) : string {
    if (str === undefined){
      return ""
    }
    
    const strTitle = toTitle(str);
    str = (strTitle == "") ? str : strTitle;

    const words = str.split(" ");
    if(words.length < 3){
      return str;
    }

    let three_words = [];

    for(let i = 0;i < 3;i++){
      if (words[i][0] === "("){
        continue;
      }
      three_words.push(words[i])
    }
    return three_words.join(" ") + " ..." 
  }


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
        onPress={() => router.navigate("/(tabs)/feed")} 
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
    
// TODO : Dark Mode
function Card(props : any){
  return (
    <Pressable>
      <ImageBackground
              style={{
                height : size.verticalScale(250), 
                marginHorizontal : size.moderateScale(3),
                marginVertical : size.verticalScale(5),
              }}
              imageStyle={{
                borderRadius : 8,
              }}
              source={{ uri: props.item.image_url }}
            >
                {/* Implement background color detection and make that the background of the feed screen */}
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.7)"]} style={{
                marginTop : size.verticalScale(170) , 
                height : size.verticalScale(80),
                // backgroundColor : "rgba(52, 52, 52, 0.3)",
                borderBottomLeftRadius : 8,
                borderBottomRightRadius : 8,
                
              }}
                >
                  <View style={{marginTop : size.verticalScale(20),}}>
                <Text style={{
                  color : "white",
                  marginHorizontal : 10,
                  fontSize : 16,
                  fontFamily : "Poppins"
                  }}>{shortTitle(props.item.title as string)}</Text> 
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 10,
                }}>
                  
                  <Text style={{
                    fontSize: 15, fontFamily: "Poppins",
                    color : "white"
                  }}>{toTitle(props.item.vendor as string)}</Text>
                  {/* <Text style={{
                    fontSize: 13, marginVertical: 5,
                    color : "white",
                    fontFamily : "Poppins",
                  }}>Rs. {(() => {
                      let l = props.item.price.length;
                      let pos = (l) - 3;
                      if (pos > 0) {
                        const firstPart = props.item.price.slice(0, pos);
                        const secondPart = props.item.price.slice(pos);

                        // Concatenate the first part, substring, and second part
                        const newString = firstPart + "," + secondPart;
                        return newString;
                      } else {
                        return props.item.price
                      }
                    })()}</Text> */}
                </View>
                </View>
              </LinearGradient>
            </ImageBackground>
    </Pressable>
  )
}

const listData = [
  {id : "1"},
  {id : "2"},
  {id : "3"},
  {id : "4"},
]

async function getProducts(n : number){
  const myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOTZlOTNjOWItODI1Mi00NjM5LWJkMGUtOWQ2ZjE2NmRjYzg0IiwiaWF0IjoxNzE3ODM0NTkxLCJleHAiOjE3MTc4NDUzOTF9.9EW7pbKqFPyO6q2aYv8ATr8HvmOUd1QGVtHcZXFRj7Y");


  const requestOptions = {
    method: "GET",
    headers: myHeaders,
   };

  try {
    const resp = await fetch(`http://192.168.18.16:3000/user/products?n=${n}`, requestOptions);
    const data = await resp.json();

    return data;
  } catch(e){
    alert(`failed to get data = ${e}`)
    return null;
  }
}

interface HomeState {
  spotlight : any;
  products : any[];
  loading : boolean;
}

export default class Home extends React.Component<{},HomeState> {
  constructor(props : any){
    super(props);
    this.state = {
      spotlight : item,
      products : [item, item, item, item, item], 
      loading : true,
    }
  }

  async componentDidMount(){
    await fetchFonts();
    const products = await getProducts(7);
    if (products === null){
      this.setState({loading : false})
      return;
    }
    else {
      this.setState({spotlight : products[0] , products : products , loading : false})
    }
  }

  render(){
    if (this.state.loading){
      return <View style={{flex : 1,backgroundColor : "black", paddingTop : 40, paddingLeft : 20}}>
            
            <ActivityIndicator style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: [{ translateX: -50 }, { translateY: -50 }],
            }} size={60} color="white"/>
        </View>
    }
    // TODO : Add activity indicator when loading
    return (
      <ScrollView style={{backgroundColor : "#121212"}}>

        <Image source={require("./juno_icon.png")} 
        style={{height : 100, width : 100, resizeMode : "cover", alignSelf : "center"}} />

        

        <ImageBackground
              style={{
                height : size.verticalScale(350), 
                marginHorizontal : size.moderateScale(30),
                marginVertical : size.verticalScale(10),
              }}
              imageStyle={{
                borderRadius : 20,
              }}
              source={{ uri: this.state.spotlight.image_url }}
            >
                {/* Implement background color detection and make that the background of the feed screen */}
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.7)"]} style={{
                marginTop : size.verticalScale(270) , 
                height : size.verticalScale(80),
                // backgroundColor : "rgba(52, 52, 52, 0.3)",
                borderBottomLeftRadius : 20,
                borderBottomRightRadius : 20,
                
              }}
                >
                  <View style={{marginTop : size.verticalScale(20),}}>
                <Text style={{
                  color : "white",
                  marginHorizontal : 10,
                  fontSize : 17,
                  fontFamily : "Poppins"
                  }}>{shortTitle(this.state.spotlight.title as string)}</Text> 
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 10,
                }}>
                  
                  <Text style={{
                    fontSize: 22, fontFamily: "Poppins",
                    color : "white"
                  }}>{toTitle(this.state.spotlight.vendor as string)}</Text>
                  <Text style={{
                    fontSize: 22, marginVertical: 5,
                    color : "white",
                    fontFamily : "Poppins",
                  }}>Rs. {(() => {
                    let l = 0
                    try {
                      l = this.state.spotlight.price.length;
                    } catch (e){
                      return "N/A"
                    }
                      let pos = (l) - 3;
                      if (pos > 0) {
                        const firstPart = this.state.spotlight.price.slice(0, pos);
                        const secondPart = this.state.spotlight.price.slice(pos);

                        // Concatenate the first part, substring, and second part
                        const newString = firstPart + "," + secondPart;
                        return newString;
                      } else {
                        return this.state.spotlight.price
                      }
                    })()}</Text>
                </View>
                </View>
              </LinearGradient>
            </ImageBackground>
        
        <View style={{marginVertical : size.verticalScale(10)}}></View>
        
        <Text style={{color : "white", fontFamily : "Poppins", fontSize : 18 , marginLeft : 20}}>For You</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          directionalLockEnabled={true}
          alwaysBounceVertical={false}
          contentContainerStyle={{flexGrow: 1,}}
        >
        <FlatList
          contentContainerStyle={{alignSelf: 'flex-start',marginLeft : 4}}
          numColumns={4}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={this.state.products}
          keyExtractor={(item) => item.product_id}
          renderItem={({ item }) => <Card item={item}/>} 
        />
        </ScrollView>
      </ScrollView>
    )
  }
}