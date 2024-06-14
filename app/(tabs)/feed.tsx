import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Animated, PanResponder, Dimensions, Image, ImageBackground, Pressable } from 'react-native';
import Button from "../components/Button";
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Appearance, ColorSchemeName, ActivityIndicator, Modal, PanResponderInstance, GestureResponderEvent, PanResponderGestureState, TouchableWithoutFeedback} from 'react-native';
import * as size from "react-native-size-matters"
import { TouchableHighlight } from 'react-native-gesture-handler';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('../assets/fonts/Poppins-Medium.ttf'),
    'Montserrat': require('../assets/fonts/Montserrat.ttf'),
  });
};

const Users = [{}]

interface AppState {
  currentIndex: number;
  cards: any[];
  socket: WebSocket;
  loading : boolean;
  modalVisible : boolean;
  shareVisible : boolean;
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
      shareVisible : false,
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

  // TODO : tap to scroll between between image and video of the product Eureka :)
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

  ItemCard(props: any){
    const item = props.item;
    return (
      <ImageBackground
              style={{
                height : size.verticalScale(620), 
              }}
              imageStyle={{
                borderTopLeftRadius : 20,
                borderTopRightRadius : 20,
              }}
              source={{ uri: ensureURLScheme(item.image_url) }}
            >
                {/* Implement background color detection and make that the background of the feed screen */}
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.4)"]} style={{
                marginTop : size.verticalScale(390) , 
                height : size.verticalScale(230),
                // backgroundColor : "rgba(52, 52, 52, 0.3)",
                
              }}
                >
                  <View style={{marginTop : size.verticalScale(85),}}>
                 <Text style={{
                  color : "white",
                  marginHorizontal : 10,
                  fontSize : 17,
                  fontFamily : "Poppins"
                  }}>{shortTitle(item.title as string)}</Text> 
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginHorizontal: 10,
                }}>
                  
                  <Text style={{
                    fontSize: 22, fontFamily: "Poppins",
                    color : "white"
                  }}>{toTitle(item.vendor as string)}</Text>
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
    )
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

            <this.ItemCard item={item}/>
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
            <this.ItemCard item={item}/>
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
        <View style={{ flex: 1 }}>{this.renderProducts()}</View>
        <Filter 
          modalVisible={this.state.modalVisible} 
          setModalVisible={(v: boolean) => this.setState({modalVisible : v})}
        />
        <Sharing 
          modalVisible={this.state.shareVisible} 
          setModalVisible={(v: boolean) => this.setState({shareVisible : v})}
        />
        <View style={{
          display : "flex", flexDirection : "row", 
          bottom : size.verticalScale(10),
          justifyContent : "space-evenly",
          }}>
          <Pressable style={{
              marginHorizontal: 15,
              width: size.scale(45),
              height: size.scale(47),
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
          {/* <Pressable style={{
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
            </Pressable> */}
          <Pressable style={{
              marginHorizontal: 15,
              width: size.scale(45),
              height: size.scale(45),
              borderRadius: size.scale(25), // Half of the width/height to make it a circle
              backgroundColor: "white",
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
            onPress={() => {
                // TODO : add share functionality 
                this.setState({shareVisible : true})
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

interface ModalProps {
  setModalVisible : Function;
  modalVisible : boolean;
}

function Filter(props : ModalProps){
  return (
    
     <Modal
        animationType="none"
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

function Sharing(props : ModalProps){
  // TODO : Implement swipe to bring down like instagram
  return (
    
     <Modal
        animationType="slide"
        transparent={true}
        visible={props.modalVisible}
        onRequestClose={() => {
          props.setModalVisible(false);
        }}
        onDismiss={() => {
          props.setModalVisible(false);
        }}
        onAccessibilityEscape={() => {
          props.setModalVisible(false);
        }}


           
      >
        <Pressable 
            style={{position : "absolute" , bottom : SCREEN_HEIGHT * 0.4, height : SCREEN_HEIGHT, backgroundColor : "transparent", width : SCREEN_WIDTH}} 
            onPress={() => props.setModalVisible(false)}
          ></Pressable> 
        <View 
          style={{
            backgroundColor : "#121212",
            flex : 1,
            marginTop : SCREEN_HEIGHT * 0.6,
            borderTopLeftRadius : 30,
            borderTopRightRadius : 30,
          }}
        >
            <Text style={{color : "white", fontSize : 30, alignSelf : "center", fontFamily : "Poppins", marginTop: 20,}}>
              SHARE
            </Text>
            {/* <Pressable
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
            </Pressable> */}
            </View>
      </Modal>
   
  )
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