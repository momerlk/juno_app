import React from 'react';
import {StyleSheet, Text, View, StyleProp, ViewStyle, ImageBackground} from 'react-native';
import Button from "../components/Button"
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import {Dimensions, Image, Animated, PanResponder } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width
import LottieView from 'lottie-react-native';


const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./Poppins-Medium.ttf'),
    "Montserrat" : require("./Montserrat.ttf"),
  });
};

interface State {
  cards: any[];
  swipedAllCards: boolean;
  swipeDirection: string;
  cardIndex: number;
  socket : WebSocket;
}

interface AppData extends React.Component {
  position : any
}


// TODO : Change users to products
const Users : any[] = [{
        "product_id": "92649134-f9dd-4a47-8c88-346dd54fdd52",
        "product_url": "https://www.afrozeh.com/products/mahjabeen-1",
        "shopify_id": 34324234324324,
        "handle": "mahjabeen-1",
        "title": "MAHJABEEN-22",
        "vendor": "Afrozeh",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0052/2030/2897/products/5.jpg?v=1668433218",
        "description": "net embellished embroidered front back body mnet embellished embroidered front back panel pcsnet embroidered sleeve metersnet embroidered sleeve border metersraw silk embroidered sleeve border metersraw silk embroidered front back border metersnet embroidered dupatta side border metersnet embroidered dupatta meter",
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
        "tags": [],
        "available": true
}]
interface AppState {
  currentIndex: number;
}

// TODO : If token/not authorised redirect to Welcome page
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
    this.state = {
      currentIndex: 0,
    };

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
      outputRange: [1, 0, 1],
      extrapolate: 'clamp',
    });

    this.nextCardScale = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [1, 0.8, 1],
      extrapolate: 'clamp',
    });

    fetchFonts();
  }

  UNSAFE_componentWillMount() {
    this.PanResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderMove: (evt, gestureState) => {
        this.position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 120) {
          Animated.spring(this.position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            useNativeDriver: false,
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
          });
        } else if (gestureState.dx < -120) {
          Animated.spring(this.position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            useNativeDriver: false,
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
          });
        } else if (gestureState.dy < -120) {
          Animated.spring(this.position, {
            toValue: { x: gestureState.dx, y: -SCREEN_HEIGHT - 100 },
            useNativeDriver: false,
          }).start(() => {
            this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
              this.position.setValue({ x: 0, y: 0 });
            });
          });
        } else {
          Animated.spring(this.position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false,
          }).start();
        }
      },
    });
  }

  renderUsers = () => {
    return Users.map((item, i) => {
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
              <LottieView
                source={require('./heart.json')}
                autoPlay
                loop={false}
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
              <LottieView
                source={require('./heart_broken.json')}
                autoPlay
                loop={false}
                style={{ width: 100, height: 100 }}
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
              <LottieView
                source={require('./add_to_cart.json')}
                autoPlay
                loop={false}
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
              source={{ uri: item.image_url }}
            />

            <View style={{
              display : "flex" , 
              flexDirection : "row" , 
              justifyContent : "space-between",
              marginHorizontal : 10,
              marginTop : 10,
            }}>
              <Text style={{
                fontSize : 22, fontFamily : "Montserrat",
                }}>{item.vendor}</Text>
              <Text style={{
                fontSize : 17, marginVertical : 5,
                }}>Rs. {(() => {
                  let l = item.price.length;
                  let pos = (l) - 3;
                  if(pos > 0){
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

            <View style={{marginBottom : 60}}>
              <Text></Text>
            </View>
            
          </Animated.View>
        );
      } else {
        return (
          <Animated.View
            key={item.id}
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
              source={{ uri: item.uri }}
            />
          </Animated.View>
        );
      }
    }).reverse();
  };

  render() {
    return (
      <View style={{ flex: 1}}>
        <View style={{ height: 60 }}></View>
        <View style={{ flex: 1}}>{this.renderUsers()}</View>
        <Button 
              style={{
                marginVertical : 8,
                marginHorizontal : 20,
              }}
              title="View Details" 
              onPress={() => {
                router.navigate({
                  pathname : "/details",
                  params : Users[this.state.currentIndex]
                })}
              } 
              filled={true} 
            />
      </View>
    );
  }
}

// export class HomeScreen extends React.Component<{}, State> {
//   swiper: Swiper<any> | null = null;

//   constructor(props: {}) {
//     super(props);
//     this.state = {
//       cards: [{
    //     "product_id": "92649134-f9dd-4a47-8c88-346dd54fdd52",
    //     "product_url": "https://www.afrozeh.com/products/mahjabeen-1",
    //     "shopify_id": 34324234324324,
    //     "handle": "mahjabeen-1",
    //     "title": "MAHJABEEN-22",
    //     "vendor": "afrozeh",
    //     "category": "",
    //     "image_url": "https://cdn.shopify.com/s/files/1/0052/2030/2897/products/5.jpg?v=1668433218",
    //     "description": "net embellished embroidered front back body mnet embellished embroidered front back panel pcsnet embroidered sleeve metersnet embroidered sleeve border metersraw silk embroidered sleeve border metersraw silk embroidered front back border metersnet embroidered dupatta side border metersnet embroidered dupatta meter",
    //     "price": "29900",
    //     "currency": "PKR",
    //     "options": [
    //       {
    //         "name": "Type",
    //         "position": 1,
    //         "values": [
    //           "Unstitched",
    //           "Stitched"
    //         ]
    //       }
    //     ],
    //     "tags": [],
    //     "available": true
    //   }],
    //   swipedAllCards: false,
    //   swipeDirection: '',
    //   cardIndex: 0,
    //   socket : new WebSocket(""),
    // };

//     fetchFonts();
//   }

//   override async componentDidMount(){
//     try {
//       const value = await AsyncStorage.getItem("authenticated");
//       if (value === null || value === "false"){
//         router.navigate("/welcome")
//       }
//     }
//     catch (e){
//       alert(`error = ${e}`)
//     }

//     setTimeout(() => {
//       const socket = new WebSocket("ws://192.168.18.16:9001/");
//       socket.onmessage = (ev : MessageEvent<any>) => {
//         const parsed = JSON.parse(ev.data)
//         if (parsed["products"] === undefined){
//           alert(`failed to get new recommendations`)
//           return;
//         }

//         if(parsed["products"].length < 1) {
//           alert(`failed to get new recommendations`)
//           return;
//         }

//         if (parsed["products"].length === 1 && parsed["products"][0]["image_url"] === undefined){
//           alert("failed to get new recommendations")
//           return;
//         }

//         const products = this.state.cards.concat(parsed["products"]);
//         this.setState({cardIndex : 0, cards :  products})
//       };

//       this.setState({socket : socket})
//     }, 1500)
//   }

//   renderCard = (cardData: any, index: number) => {
//     return (
//       <View style={styles.card}>
//     <ImageBackground source={{uri : cardData.image_url}} resizeMode="cover" style={styles.image}>
//       <View style={styles.text}>

        // <View style={{display : "flex" , flexDirection : "row" , justifyContent : "space-between"}}>
        // <h2>{cardData.vendor}</h2>
        // <h3 >{cardData.price}</h3>
        // </View>

//         <h4>{cardData.title}</h4>
        
//       </View>
//     </ImageBackground>
//   </View>

//     );
//   };


//   // TODO : Gives error when swipe at a fast rate
//   onSwiped = (type: string) => {
//     // TODO : add correct fields
//     if (type === "general"){
//       return;
//     }
//     // TODO : add proper user id and product id
//     this.state.socket.send(JSON.stringify({
//       user_id : "debug",
//       action_type : type,
//       action_timestamp : new Date().toJSON(),
//       product_id : "debug", 
//     }))
//     console.log(`on swiped ${type}`);
//   };

//   onSwipedAllCards = () => {
//     this.render();
//     this.setState({
//       swipedAllCards: true
//     });
//   };

//   swipeLeft = () => {
//     if (this.swiper) {
//       this.swiper.swipeLeft();
//     }
//   };

//   render() {
//     return (
//       <View style={styles.container}>
//         <Swiper
//           ref={(swiper : any) => {
//             this.swiper = swiper;
//           }}
//           onSwiped={(cardIndex : any) => this.onSwiped('general')}
//           onSwipedLeft={(cardIndex) => this.onSwiped('disliked')}
//           onSwipedRight={(cardIndex) => this.onSwiped('liked')}
//           onSwipedTop={(cardIndex) => this.onSwiped('added_to_cart')}
//           onSwipedBottom={(cardIndex) => this.onSwiped('bottom')}
//           onTapCard={(cardIndex) => this.onSwiped("tap")}
//           cards={this.state.cards}
//           cardIndex={this.state.cardIndex}
//           cardVerticalMargin={80}
//           renderCard={this.renderCard}
//           onSwipedAll={this.onSwipedAllCards}
//           stackSize={3}
//           disableBottomSwipe={true}
//           stackSeparation={15}
//           overlayLabels={{
//             left: {
//               title: 'DISLIKE',
//               style: styles.overlayLabel
//             },
//             right: {
//               title: 'LIKE',
//               style: styles.overlayLabel
//             },
//             top: {
//               title: 'ADD TO CART',
//               style: styles.overlayLabel
//             }
//           }}
//           animateOverlayLabelsOpacity
//           animateCardOpacity
//           swipeBackCard
//         >
//         </Swiper>
//       </View>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor : "#87CEEB",
//     fontFamily : "Poppins",
//   },
//   card : {
//     flex : 1,
//   },
//   image: {
//     flex: 1,
//     justifyContent: "flex-end",
//   },
//   price : {
//     alignSelf : "flex-end",
//   },
//   text: {
//     color: 'white',
//     lineHeight : 5,
//     textAlign : "left",
//     fontWeight: 'bold',
//     padding : 20,
//     backgroundColor: '#000000c0',
//   },
//   overlayLabel: {
//     label: {
//       backgroundColor: 'black',
//       borderColor: 'black',
//       color: 'white',
//       borderWidth: 1
//     },
//     wrapper: {
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center'
//     }
//   }
// });
