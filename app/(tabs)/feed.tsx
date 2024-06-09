import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Animated, PanResponder, Dimensions, Image, ImageBackground, Pressable } from 'react-native';
import Button from "../components/Button";
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Appearance, ColorSchemeName, ActivityIndicator, Modal, PanResponderInstance, GestureResponderEvent, PanResponderGestureState} from 'react-native';
import * as size from "react-native-size-matters"
import { TouchableHighlight } from 'react-native-gesture-handler';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./Poppins-Medium.ttf'),
    'Montserrat': require('./Montserrat.ttf'),
  });
};

const Users = [{
  "product_id": "027bb7aa-d705-4544-8ff4-8f4ce91c2bec",
  "product_url": "https://www.afrozeh.com/products/mahjabeen-1",
  "shopify_id": {
    "$numberLong": "8002372829418"
  },
  "handle": "mahjabeen-1",
  "title": "Mahjabeen 22",
  "vendor": "afrozeh",
  "vendor_title": "Afrozeh",
  "category": "",
  "product_type": "",
  "image_url": "https://cdn.shopify.com/s/files/1/0052/2030/2897/products/5.jpg?v=1668433218",
  "description": "Net Embellished + Embroidered Front + Back Body (0.66 M)Net Embellished + Embroidered Front & Back Panels (14 PCS)Net Embroidered Sleeves (0.66 Meters)Net EMBROIDERED SLEEVES BORDER (1 Meters)Raw Silk Embroidered Sleeves Border (1 Meters)Raw Silk Embroidered Front + Back Border (4.57 Meters)Net Embroidered Dupatta 4 Side Border (7.91 Meters)Net Embroidered Dupatta (2.63 Meters)",
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
  "tags": [
    "14-07-2023",
    "22-07-2023",
    "22-8-23'",
    "24-7-2023-SALE",
    "Afrozeh Brides’22",
    "Mahjabeen",
    "New In",
    "Peshwas & Lehngas",
    "products_from_sheet",
    "saleafrozehjan",
    "xs_xl"
  ],
  "available": true
}]

interface AppState {
  currentIndex: number;
  cards: any[];
  socket: WebSocket;
  loading : boolean;
  modalVisible : boolean;
}

// Function to ensure URLs have the correct scheme
const ensureURLScheme = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default class App extends React.Component<{}, AppState> {
  position: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation<string>;
  rotateAndTranslate: { transform: any[] };
  likeOpacity: Animated.AnimatedInterpolation<number>;
  dislikeOpacity: Animated.AnimatedInterpolation<number>;
  superLikeOpacity: Animated.AnimatedInterpolation<number>;
  nextCardOpacity: Animated.AnimatedInterpolation<number>;
  nextCardScale: Animated.AnimatedInterpolation<number>;
  PanResponder: PanResponderInstance;
  startTime : number;
  endTime : number;
  lastTap: number | null;
  tapTimeout: NodeJS.Timeout | null;
  

  constructor(props: any) {
    super(props);

    this.position = new Animated.ValueXY();

    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-30deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });

    this.rotateAndTranslate = {
      transform: [
        {
          rotate: this.rotate,
        },
        ...this.position.getTranslateTransform(),
      ],
    };

    this.likeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    });

    this.dislikeOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp',
    });

    this.superLikeOpacity = this.position.y.interpolate({
      inputRange: [-SCREEN_HEIGHT / 2, 0, SCREEN_HEIGHT / 2],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp',
    });

    this.nextCardOpacity = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp',
    });

    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp',
    });

    this.state = {
      currentIndex: 0,
      cards: Users,
      socket: new WebSocket("http://192.168.18.16:9001/feed"),
      loading : true,
      modalVisible : false,
    };

    // Pan Responder for handling taps and swipes
    this.startTime = 0;
    this.endTime = 0;
    this.lastTap = null;
    this.tapTimeout = null;

    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => true,
      onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        this.startTime = new Date().getTime();
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        this.endTime = new Date().getTime();
        const timeDiff = this.endTime - this.startTime;

        // Detect tap if movement is minimal
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5 && timeDiff < 200) {
          this.handleTap();
        } else {
          this.handleSwipe(gestureState);
        }
      },
    });

  }

  async componentDidMount() {
    await fetchFonts();
    try {
      const value = await AsyncStorage.getItem("authenticated");
      if (value === null || value === "false") {
        //router.navigate("/welcome");
      }
    } catch (e) {
      alert(`error = ${e}`);
    }

    setTimeout(async () => {
      // connecting to feed websocket
      const socket = new WebSocket("ws://192.168.18.16:9001/feed");

      socket.onmessage = (ev: MessageEvent<any>) => {
        const parsed = JSON.parse(ev.data);
        // no products
        // TODO : Create an error logger system which logs errors users face
        if (parsed["products"] === undefined && parsed["status"] !== 200) {
          if (parsed["message"] === "Invalid token"){
            router.replace("/sign-in")
            return;
          }
          else {
            alert(`failed to get new recommendations, message = ${parsed["message"]}`);
            return;
          }
        }

        if (parsed === null || parsed === undefined) {
          return;
        }
        if (parsed["products"] === null || parsed["products"] == undefined) {
          return;
        }

        let products = parsed["products"];

        if (products === undefined) {
          this.setState({ currentIndex: 0 })
        } else {
          this.setState({ currentIndex: 0, cards: products });
        }

        this.setState({loading : false})
      };

      this.setState({ socket: socket });
    }, 500);

    let token = null; // token null before loading
    try {
      token = await AsyncStorage.getItem("token");
      // no token so returns user to sign in again
      if (token == null) {
        alert(`failed to get authentication token, sign in again!`)
        router.replace("/sign-in");
        return;
      }
    } catch (e) {
      alert(`failed to get authentication token, sign in again!`)
      router.replace("/sign-in");
      return;
    }

    setTimeout( // initial authentication to socket
      () => {
        try {
        this.state.socket.send(JSON.stringify({
            token: token,
            action_type: "open" // handshake/webscoket open action
        }))
        } catch (e){
            alert(`failed to connect, error = ${e}`)
        }
    
    }, 1000)
  }

  

  async handleSwipeAction(action: string) {
    let token = null;
    try {
      token = await AsyncStorage.getItem("token")
    } catch (e) {
      alert(`failed to update feed, reload or login again , error = ${e}`)
    }
    this.state.socket.send(JSON.stringify({
      token: token,
      action_type: action,
      action_timestamp: new Date().toJSON(),
      product_id: this.state.cards[this.state.currentIndex]["product_id"],
    }))
  }

  handleSwipe = (gestureState: any) => {
    if (gestureState.dx > 120) {
      // Swipe right
      Animated.spring(this.position, {
        toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
        useNativeDriver: true,
      }).start(() => {
        this.setState(
          { currentIndex: this.state.currentIndex + 1 },
          async () => {
            this.position.setValue({ x: 0, y: 0 });
            await this.handleSwipeAction("like");
          }
        );
      });
    } else if (gestureState.dx < -120) {
      // Swipe left
      Animated.spring(this.position, {
        toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
        useNativeDriver: true,
      }).start(() => {
        this.setState(
          { currentIndex: this.state.currentIndex + 1 },
          async () => {
            this.position.setValue({ x: 0, y: 0 });
            await this.handleSwipeAction("dislike");
          }
        );
      });
    } else if (gestureState.dy < -120) {
      // Swipe up
      Animated.spring(this.position, {
        toValue: { x: gestureState.dx, y: -SCREEN_HEIGHT - 100 },
        useNativeDriver: true,
      }).start(() => {
        this.setState(
          { currentIndex: this.state.currentIndex + 1 },
          async () => {
            this.position.setValue({ x: 0, y: 0 });
            await this.handleSwipeAction("added_to_cart");
          }
        );
      });
    } else {
      // Reset position if no significant swipe
      Animated.spring(this.position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
    }
  }

  handleTap(){
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 500;

    if (this.lastTap && (now - this.lastTap) < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      if (this.tapTimeout) {
        clearTimeout(this.tapTimeout);
      }
      console.log(`double tap detected`)
      router.navigate({
        pathname: "/details",
        params: this.state.cards[this.state.currentIndex]
      })
    } else {
      // Single tap detected, wait to confirm if it is a double tap
      this.lastTap = now;
      this.tapTimeout = setTimeout(() => {
        console.log(`single tap detected`);
      }, DOUBLE_PRESS_DELAY);
    }
  }

  toTitle(str : string) : string {
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

  shortTitle(str : string) : string {
    if (str === undefined){
      return ""
    }
    
    const strTitle = this.toTitle(str);
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

  renderProducts = () => {
    return this.state.cards.map((item, i) => {
      if (i < this.state.currentIndex) {
        return null;
      } else if (i === this.state.currentIndex) {
        return (
          <Animated.View
            {...this.PanResponder.panHandlers}

            key={item.product_id}
            style={[
              this.rotateAndTranslate,
              {
                height: SCREEN_HEIGHT - 120,
                width: SCREEN_WIDTH,
                padding: 10,
                position: 'absolute',
              },
            ]}
          >
            <Animated.View
              style={{
                opacity: this.likeOpacity,
                transform: [{ rotate: '-15deg' }],
                position: 'absolute',
                top: 50,
                left: 40,
                zIndex: 1000,
              }}
            >
              <Image style={{height : 160, width : 160}} 
              source={require("../assets/heart.png")}/>
            </Animated.View>

            <Animated.View
              style={{
                opacity: this.dislikeOpacity,
                transform: [{ rotate: '20deg' }],
                position: 'absolute',
                top: 50,
                right: 40,
                zIndex: 1000,
              }}
            >
              <Image style={{height : 160, width : 160}} 
              source={require("../assets/cross.png")}/>
            </Animated.View>

            <Animated.View
              style={{
                opacity: this.superLikeOpacity,
                transform: [{ rotate: '0deg' }],
                position: 'absolute',
                bottom: 150,
                left: SCREEN_WIDTH * 0.24,
                zIndex: 1000,
              }}
            >
              <Image style={{height : 200, width : 200}} 
              source={require("../assets/basket.png")}/>
            </Animated.View>      

            <ImageBackground
              style={{
                height : size.verticalScale(600), 
              }}
              imageStyle={{
                borderRadius : 20,
              }}
              source={{ uri: ensureURLScheme(item.image_url) }}
            >
                {/* Implement background color detection and make that the background of the feed screen */}
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.4)"]} style={{
                marginTop : size.verticalScale(385) , 
                height : size.verticalScale(215),
                // backgroundColor : "rgba(52, 52, 52, 0.3)",
                borderBottomLeftRadius : 20,
                borderBottomRightRadius : 20,
                
              }}
                >
                  <View style={{marginTop : size.verticalScale(85),}}>
                 <Text style={{
                  color : "white",
                  marginHorizontal : 10,
                  fontSize : 17,
                  fontFamily : "Poppins"
                  }}>{this.shortTitle(item.title as string)}</Text> 
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 10,
                }}>
                  
                  <Text style={{
                    fontSize: 22, fontFamily: "Poppins",
                    color : "white"
                  }}>{this.toTitle(item.vendor as string)}</Text>
                  <Text style={{
                    fontSize: 22, marginVertical: 5,
                    color : "white",
                    fontFamily : "Poppins",
                  }}>Rs. {(() => {
                      let l = item.price.length;
                      let pos = (l) - 3;
                      if (pos > 0) {
                        const firstPart = item.price.slice(0, pos);
                        const secondPart = item.price.slice(pos);

                        // Concatenate the first part, substring, and second part
                        const newString = firstPart + "," + secondPart;
                        return newString;
                      } else {
                        return item.price
                      }
                    })()}</Text>
                </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </Animated.View>
        );
      } else {
        return (
          <Animated.View
            key={item.product_id}
            style={[
              {
                opacity: this.nextCardOpacity,
                transform: [{ scale: this.nextCardScale }],
                height: SCREEN_HEIGHT - 120,
                width: SCREEN_WIDTH,
                padding: 10,
                position: 'absolute',
              },
            ]}
          >
            <ImageBackground
              style={{
                height : size.verticalScale(600), 
              }}
              imageStyle={{
                borderRadius : 20,
              }}
              source={{ uri: ensureURLScheme(item.image_url) }}
            >
                {/* Implement background color detection and make that the background of the feed screen */}
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.4)"]} style={{
                marginTop : size.verticalScale(385) , 
                height : size.verticalScale(215),
                // backgroundColor : "rgba(52, 52, 52, 0.3)",
                borderBottomLeftRadius : 20,
                borderBottomRightRadius : 20,
                
              }}
                >
                  <View style={{marginTop : size.verticalScale(85),}}>
                <Text style={{
                  color : "white",
                  marginHorizontal : 10,
                  fontSize : 17,
                  fontFamily : "Poppins"
                  }}>{this.shortTitle(item.title as string)}</Text> 
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 10,
                }}>
                  
                  <Text style={{
                    fontSize: 22, fontFamily: "Poppins",
                    color : "white"
                  }}>{this.toTitle(item.vendor as string)}</Text>
                  <Text style={{
                    fontSize: 22, marginVertical: 5,
                    color : "white",
                    fontFamily : "Poppins",
                  }}>Rs. {(() => {
                      let l = item.price.length;
                      let pos = (l) - 3;
                      if (pos > 0) {
                        const firstPart = item.price.slice(0, pos);
                        const secondPart = item.price.slice(pos);

                        // Concatenate the first part, substring, and second part
                        const newString = firstPart + "," + secondPart;
                        return newString;
                      } else {
                        return item.price
                      }
                    })()}</Text>
                </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </Animated.View>
        );
      }
    }).reverse();
  };

  render() {
    if(this.state.loading){
        return <View style={{flex : 1,backgroundColor : "black", paddingTop : 30, paddingLeft : 10}}>
            
            <ActivityIndicator style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: [{ translateX: -50 }, { translateY: -50 }],
            }} size={60} color="white"/>
        </View>
    } else {
    return (
      <View style={{ flex: 1,backgroundColor: "black", paddingTop : SCREEN_HEIGHT * 0.042}}>
        {/* <View style={{display : "flex" , flexDirection : "row"}}>
        <Pressable style={{
              marginHorizontal: 15,
              marginTop : size.scale(5),
              width: size.scale(33),
              height: size.scale(33),
              borderRadius: size.scale(25), // Half of the width/height to make it a circle
              backgroundColor: "white",
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
            onPress={() => router.back()} 
            >
                <Ionicons name="arrow-back" size={size.scale(25)} color="black" />
        </Pressable>
            <Text
            style={{
                    fontSize: 22, fontFamily: "Poppins",
                    color : "white",
                    marginTop : 5,
                  }}
            >Feed</Text>
        </View> */}
        <View style={{ flex: 1 }}>{this.renderProducts()}</View>
        <Filter 
          modalVisible={this.state.modalVisible} 
          setModalVisible={(v: boolean) => this.setState({modalVisible : v})}
        />
        <View style={{
          display : "flex", flexDirection : "row", 
          bottom : size.verticalScale(10),
          alignSelf : "center",

          }}>
          <Pressable style={{
              marginHorizontal: 15,
              width: size.scale(40),
              height: size.scale(42),
              borderRadius: size.scale(25), // Half of the width/height to make it a circle
              backgroundColor: "white",
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
            onPress={() => {
                // TODO : Add undo swipe/action functionality limit of 2 undos
                alert(`undid to the previous product`)
            }} 
            >
                <Ionicons name="refresh" size={size.scale(26)} color="black" />
            </Pressable>


            <Pressable style={{
              marginHorizontal: 20,
              width: size.scale(60),
              height: size.scale(60),
              borderRadius: size.scale(30), // Half of the width/height to make it a circle
              backgroundColor: "white",
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
            onPress={() => {
                // TODO : Add filter functionality
                this.setState({modalVisible : true})
            }} 
            >
                <Ionicons name="filter-sharp" size={size.scale(30)} color="black" />
            </Pressable>
          <Pressable style={{
              marginHorizontal: 20,
              width: size.scale(60),
              height: size.scale(60),
              borderRadius: size.scale(30), // Half of the width/height to make it a circle
              backgroundColor: "white",
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
            onPress={() => {
              router.navigate({
                pathname: "/details",
                params: this.state.cards[this.state.currentIndex]
              })
            }} 
            >
              <Entypo name="magnifying-glass" size={size.scale(40)} color="black" />
            </Pressable>
          <Pressable style={{
              marginHorizontal: 15,
              width: size.scale(40),
              height: size.scale(40),
              borderRadius: size.scale(25), // Half of the width/height to make it a circle
              backgroundColor: "white",
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
            onPress={() => {
                // TODO : add share functionality 
                alert(`shared product`)
            }} 
            >
              <Entypo name="paper-plane" size={size.scale(26)} color="black" />
            </Pressable>
        </View>
      </View>
    );
    }
  }
}

interface FilterProps {
  setModalVisible : Function;
  modalVisible : boolean;
}

function Filter(props : FilterProps){
  return (
    
     <Modal
        animationType="slide"
        transparent={true}
        visible={props.modalVisible}
        onRequestClose={() => {
          props.setModalVisible(!props.modalVisible);
        }}
           
      >
        <View 
          style={{
            backgroundColor : "#121212",
            flex : 1,
            marginBottom: size.verticalScale(140),
            marginTop : size.verticalScale(70),
            marginHorizontal : 20,
            borderRadius : 8,
          }}
        >
            <Text style={{color : "white", fontSize : 30, alignSelf : "center", fontFamily : "Poppins", marginTop: 20,}}>
              FILTER
            </Text>
            <Pressable
              style={[
                {
                  paddingBottom: 16,
                  paddingVertical: 10,
                  paddingTop : 15,
                  marginHorizontal : 14,
                  marginTop : 20,
                  borderRadius: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf : "center",
                  width : size.scale(200),
                  position : "absolute",
                  bottom : 40,
                },
                { backgroundColor: "white" },
              ]}
              onPress={() => props.setModalVisible(false)}
            >
              <Text style={{ fontSize: 18, color: "black", fontFamily : "Poppins" }}>
                Confirm
              </Text>
            </Pressable>
            </View>
      </Modal>
   
  )
}