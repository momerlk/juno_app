import React from 'react';
import { StyleSheet, Text, View, Animated, PanResponder, Dimensions, Image, ImageBackground } from 'react-native';
import Button from "./components/Button";
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {Appearance, ColorSchemeName} from 'react-native';
import {useState, useEffect} from "react"
import * as size from "react-native-size-matters"
import { TouchableHighlight } from 'react-native-gesture-handler';



  



const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./(tabs)/Poppins-Medium.ttf'),
    'Montserrat': require('./(tabs)/Montserrat.ttf'),
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
  "description": "Net Embellished + Embroidered Front + Back Body (0.66 M)Net Embellished + Embroidered Front & Back Panels (14 PCS)Net Embroidered Sleeves (0.66 Meters)Net EMBROIDERED SLEEVES BORDER (1 Meters)Raw Silk Embroidered Sleeves Border (1 Meters)Raw Silk Embroidered Front + Back Border (4.57 Meters)Net Embroidered Dupatta 4 Side Border (7.91 Meters)Net Embroidered Dupatta (2.63 Meters)",
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
  PanResponder: any;

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
    };

    fetchFonts();
  }

  async componentDidMount() {
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
          alert(`failed to get new recommendations, message = ${parsed["message"]}`);
          return;
        }

        if (parsed === null || parsed === undefined){
            return;
        }
        if(parsed["products"] === null || parsed["products"] == undefined){
            return;
        }

        let products = parsed["products"];
       
        if (products === undefined){
          this.setState({currentIndex : 0})
        } else { 
          this.setState({ currentIndex: 0, cards: products }); 
        }
      };

      this.setState({ socket: socket });
    }, 500);

    let token = null; // token null before loading
      try {
        token = await AsyncStorage.getItem("token");
        // no token so returns user to sign in again
        if (token == null){
          alert(`failed to get authentication token, sign in again!`)
          //router.replace("/sign-in");
          return;
        }
      } catch(e){
        alert(`failed to get authentication token, sign in again!`)
        //router.replace("/sign-in");
        return;
      }

    setTimeout( // initial authentication to socket
      () => this.state.socket.send(JSON.stringify({
        token : token,
        action_type : "open" // handshake/webscoket open action
      })) , 1000)
  }

  UNSAFE_componentWillMount() {
    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        this.handleSwipe(gestureState);
      },
    });
  }

  async handleSwipeAction(action : string){
    let token = null;
    try {
      token = await AsyncStorage.getItem("token")
    } catch(e){
      alert(`failed to update feed, reload or login again , error = ${e}`)
    }
    this.state.socket.send(JSON.stringify({
      token : token,
      action_type : action,
      action_timestamp : new Date().toJSON(),
      product_id : this.state.cards[this.state.currentIndex]["product_id"], 
    }))
  }

  handleSwipe = (gestureState : any) => {
    if (gestureState.dx > 120) {
      // Swipe right
      Animated.spring(this.position, {
        toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
        useNativeDriver: true,
      }).start(() => {
        this.handleSwipeAction("liked")
        this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
          this.position.setValue({ x: 0, y: 0 });
        });
      });
    } else if (gestureState.dx < -120) {
      // Swipe left
      Animated.spring(this.position, {
        toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
        useNativeDriver: true,
      }).start(() => {
        this.handleSwipeAction("disliked")
        this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
          this.position.setValue({ x: 0, y: 0 });
        });
      });
    } else if (gestureState.dy < -120) {
      // Swipe up
      Animated.spring(this.position, {
        toValue: { x: gestureState.dx, y: -SCREEN_HEIGHT - 100 },
        useNativeDriver: true,
      }).start(() => {
        this.handleSwipeAction("added_to_cart")
        this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
          this.position.setValue({ x: 0, y: 0 });
        });
      });
    } else {
      // If the swipe is not significant, reset position
      Animated.spring(this.position, {
        toValue: { x: 0, y: 0 },
        friction: 4,
        useNativeDriver: true,
      }).start();
    }
  };

  shouldComponentUpdate(nextProps : any , nextState : any) {
    return this.state.currentIndex !== nextState.currentIndex ||
      this.state.cards !== nextState.cards;
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
                position: 'absolute',
                top: 50,
                left: 40,
                zIndex: 1000,
              }}
            >
              <Image
                source={{ uri: 'https://via.placeholder.com/100.png?text=Like'
              }}
                style={{ width: 100, height: 100 }}
              />
            </Animated.View>

            <Animated.View
              style={{
                opacity: this.dislikeOpacity,
                position: 'absolute',
                top: 50,
                right: 40,
                zIndex: 1000,
              }}
            >
              <Image
              style={styles.backgroundImage} source={{ uri: 'https://via.placeholder.com/100.png?text=Dislike' }}
              />
            </Animated.View>

            <Animated.View
              style={{
                opacity: this.superLikeOpacity,
                position: 'absolute',
                bottom: 50,
                left: SCREEN_WIDTH / 2 - 50,
                zIndex: 1000,
              }}
            >
              <Image
                source={{ uri: 'https://via.placeholder.com/100.png?text=SuperLike' }}
                style={{ width: 100, height: 100 }}
              />
            </Animated.View>

            <Image
              style={{
                flex: 1,
                height: null,
                width: null,
                resizeMode: 'cover',
                borderRadius: 20,
              }}
              source={{ uri: ensureURLScheme(item.image_url) }}
            />
            <>
            <Button>
              
            </Button>
            </>
            <View style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginHorizontal: 10,
              marginTop: 10,
            }}>
              <Text style={{
                fontSize: 22, fontFamily: "Montserrat",
              }}>{item.vendor}</Text>
              <Text style={{
                fontSize: 17, marginVertical: 5,
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

            <View style={{ marginBottom: 60 }}>
              <Text></Text>
            </View>
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
            <Image
              style={{
                flex: 1,
                height: null,
                width: null,
                resizeMode: 'cover',
                borderRadius: 20,
              }}
              source={{ uri: ensureURLScheme(item.image_url) }}
            />
          </Animated.View>
        );
      }
    }).reverse();
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 60 }}></View>
        <View style={{ flex: 1 }}>{this.renderProducts()}</View>
        <Button
          style={{
            marginVertical: 8,
            marginHorizontal: 20,
          }}
          title="View Details"
          onPress={() => {
            router.navigate({
              pathname: "/details",
              params: this.state.cards[this.state.currentIndex]
            })
          }}
          filled={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  backgroundImage:{
    
  }
})