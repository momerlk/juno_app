import React, {useState, useEffect} from 'react';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  StyleSheet, 
  Text, View, Animated, PanResponder, Dimensions, 
  Image, ImageBackground, Pressable, TextInput, ScrollView, 
  ActivityIndicator,Platform, FlatList, Modal, 
  PanResponderInstance, GestureResponderEvent, 
  PanResponderGestureState, TouchableOpacity,
} from 'react-native';
import * as size from "react-native-size-matters"
import { AntDesign, Ionicons, Entypo, EvilIcons , Feather} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { FastImageBackground  } from './_common';
import {Image as FastImage} from "expo-image"


import {
  shortTitle , toTitle , fmtPrice, Logo, 
  PrimaryButton, SecondaryButton,
} from "./_common"


import * as api from "./api";


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('../assets/fonts/Poppins-Medium.ttf'),
    'Montserrat': require('../assets/fonts/Montserrat.ttf'),
  });
};


interface AppState {
  currentIndex: number;
  cards: any[];
  loading : boolean;
  modalVisible : boolean;
  shareVisible : boolean;
  likeOpacity: number;
  dislikeOpacity: number;
  superLikeOpacity: number;
  width : number,
  height : number,
  filter : any;
}

interface AppProps {
  cards : any[];
  height : number;
  onSwipe : Function;
  onUndo : Function;
  onFilter : Function;
  loading : boolean;
  paddingTop : number;
  topNav : boolean;
  bottomNav : boolean;
}

// Function to ensure URLs have the correct scheme
const ensureURLScheme = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export class SwipeView extends React.Component<AppProps, AppState> {
  position: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation<string>;
  direction : string;
  nextCardOpacity: Animated.AnimatedInterpolation<number>;
  nextCardScale: Animated.AnimatedInterpolation<number>;
  PanResponder: PanResponderInstance;
  startTime : number;
  endTime : number;
  lastTap: number | null;
  tapTimeout: NodeJS.Timeout | null;
  

  constructor(props: AppProps) {
    super(props);

    this.position = new Animated.ValueXY();

    this.rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-30deg', '0deg', '10deg'],
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
      cards: this.props.cards,
      loading : this.props.loading,
      modalVisible : false,
      shareVisible : false,
      likeOpacity : 0,
      superLikeOpacity : 0,
      dislikeOpacity : 0,
      height : 0,
      width : 0,
      filter : {},
    };

    this.direction = "center";

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
        const dx = gestureState.dx;
        const dy = gestureState.dy;

        // TODO : optimise the number of renders even more
        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal movement
          if (dx > 80) {
            const newDirection = 'right';
            if (this.direction !== newDirection){
              this.setState({likeOpacity : 1, dislikeOpacity : 0, superLikeOpacity : 0})
              this.direction = newDirection;
            }
          } else if (dx < -80) {
            const newDirection = 'left';
            if (this.direction !== newDirection){
              this.setState({likeOpacity : 0, dislikeOpacity : 1, superLikeOpacity : 0})
              this.direction = newDirection;
            }
          }
        } else {
          // Vertical movement
          if (dy > 120) {
            const newDirection = 'down';
            this.direction = newDirection;
          } else if (dy < -110) {
            const newDirection = 'up';
            if (this.direction !== newDirection){
              this.setState({likeOpacity : 0, dislikeOpacity : 0, superLikeOpacity : 1})
              this.direction = newDirection;
            }
          }
        }
      },
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        this.endTime = new Date().getTime();
        const timeDiff = this.endTime - this.startTime;
        this.setState({likeOpacity : 0, dislikeOpacity : 0, superLikeOpacity : 0})
        this.direction = "center";

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
  }

  

  async handleSwipeAction(action: string) {
    this.props.onSwipe(action , this.state.currentIndex);
  }

  handleSwipe = (gestureState: any) => {
    if (gestureState.dx > 120) {
      // Swipe right
      Animated.spring(this.position, {
        toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
        useNativeDriver: true,
        speed: 40, // Adjust speed for faster animation
        bounciness: 0, // Remove bounciness for quicker completion
      }).start(() => {
        this.position.setValue({ x: 0, y: 0 });
        this.setState(
          { currentIndex: this.state.currentIndex + 1 },
          () => {
            // Start the swipe action handling without awaiting it
            this.handleSwipeAction("like");
          }
        );
      });

    } else if (gestureState.dx < -120) {
      // Swipe left
      Animated.spring(this.position, {
        toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
        useNativeDriver: true,
        speed: 40, // Adjust speed for faster animation
        bounciness: 0, // Remove bounciness for quicker completion
      }).start(() => {
        this.position.setValue({ x: 0, y: 0 });
        this.setState(
          { currentIndex: this.state.currentIndex + 1 },
          () => {
            this.handleSwipeAction("dislike");
          }
        );
      });
    } else if (gestureState.dy < -120) {
      // Swipe up
      Animated.spring(this.position, {
        toValue: { x: gestureState.dx, y: -SCREEN_HEIGHT - 100 },
        useNativeDriver: true,
        speed: 40, // Adjust speed for faster animation
        bounciness: 0, // Remove bounciness for quicker completion
      }).start(() => {
        this.position.setValue({ x: 0, y: 0 });
        this.setState(
          { currentIndex: this.state.currentIndex + 1 },
          () => {
            // Start the swipe action handling without awaiting it
            this.handleSwipeAction("added_to_cart");
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
      // console.log(`double tap detected`)
      router.navigate({
        pathname: "/details",
        params: this.props.cards[this.state.currentIndex]
      })
    } else {
      // Single tap detected, wait to confirm if it is a double tap
      this.lastTap = now;
      this.tapTimeout = setTimeout(() => {
        // console.log(`single tap detected`);
      }, DOUBLE_PRESS_DELAY);
    }
  }

  ItemCard(props: any){
    const item = props.item;
    const textHeight = props.height/(SCREEN_HEIGHT/400);
    return (
      <FastImageBackground
              style={{
                height : props.height, 
              }}
              imageStyle={{
                borderRadius : 20,
              }}
              source={{ uri: ensureURLScheme(item.image_url) }}
            >
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.4)"]} style={{
                marginTop : props.height - textHeight , 
                height : textHeight,
                borderRadius : 20,
                // backgroundColor : "rgba(52, 52, 52, 0.3)",
                
              }}
                >
                  <View style={{marginTop : props.height * 0.14,}}>
                 <Text style={{
                  color : "white",
                  marginHorizontal : 10,
                  fontSize : props.height * 0.04,
                  fontFamily : "Poppins"
                  }}>{shortTitle(item.title as string)}</Text> 
                
                  
                  <Text style={{
                    fontSize: props.height * 0.036, fontFamily: "Poppins",
                    color : "white",
                    marginHorizontal : 10,
                  }}>{toTitle(item.vendor as string)}</Text>
                
                <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}>

                  {(() => {
                    if (item.discount > 0 && item.compare_price > 0){
                      return (
                        <>

                        <View style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}>
                          <Text style={{
                            fontSize: props.height * 0.03, marginVertical: 5,
                            color : "white",
                            fontFamily : "Poppins",
                            marginHorizontal : 10,
                          }}>Rs. {fmtPrice(item.price)}</Text>
                          
                          <Text style={{
                              fontSize: props.height * 0.03, marginVertical: 5,
                              fontWeight : "bold",
                              fontFamily : "Poppins",
                              color : "white",
                              marginHorizontal : 10,
                              textDecorationLine : "line-through",
                            }}>{fmtPrice(item.compare_price)}</Text>
                        </View>
                        
                        
                        
                        <Text style={{
                          fontSize: props.height * 0.03, marginVertical: 5,
                          fontWeight : "bold",
                          fontFamily : "Poppins",
                          color : "#FF1D18",
                          marginHorizontal : 10,
                        }}>{item.discount}% Off</Text>
                        </>
                      )
                    } else {
                      return (
                        <Text style={{
                          fontSize: props.height * 0.03, marginVertical: 5,
                          color : "white",
                          fontFamily : "Poppins",
                          marginHorizontal : 10,
                        }}>Rs. {fmtPrice(item.price)}</Text>
                      )
                    }
                  })()}
                </View>


                  
                {/* </View> */}
                </View>
              </LinearGradient>
            </FastImageBackground>
    )
  }

  renderProducts = () => {
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-5deg', '0deg', '5deg'],
      extrapolate: 'clamp',
    });
    return this.props.cards.map((item, i) => {
      if (i < this.state.currentIndex) {
        return null;
      } else if (i === this.state.currentIndex) {
        return (
          <Animated.View
            {...this.PanResponder.panHandlers}

            key={item.product_id + "view"}
            style={[
              {
                transform: [
                  { translateX: this.position.x },
                  { translateY: this.position.y },
                  { rotate: rotate },
                ],
              },
              {
                height: this.props.height - 120,
                width: SCREEN_WIDTH,
                padding: 10,
                borderRadius : 20,
                position: 'absolute',
              },
            ]}
          >
            <Animated.View
              style={{
                opacity: this.state.likeOpacity,
                position: 'absolute',
                zIndex: 1000,
                width : SCREEN_WIDTH,
                height : this.props.height + (SCREEN_HEIGHT * 0.011),
                left : 10,
                borderRadius : 20,
              }}
            >
              <LinearGradient colors={["rgba(0,0,0,0.1)" , "rgba(0,0,0,0.65)"]} style={{
                flex : 1,
                width : SCREEN_WIDTH ,
                borderRadius : 20,
              }}
                >
                  <FastImage 
                    source={require("../assets/icons/heart.png")}
                    style={{
                      height : 160,
                      width : 160,
                      position : "absolute",
                    top : (this.props.height * 0.5) - 100,
                    left : (SCREEN_WIDTH * 0.6) - 120,
                    }} 
                  />
               
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={{
                opacity: this.state.dislikeOpacity,
                position: 'absolute',
                zIndex: 1000,
                width : SCREEN_WIDTH,
                borderRadius : 20,
                height : this.props.height + (SCREEN_HEIGHT * 0.012),
                left : 10,
              }}
            >
              <LinearGradient colors={["rgba(0,0,0,0.1)" , "rgba(0,0,0,0.65)"]} style={{
                width : SCREEN_WIDTH - 20,
                flex : 1,
                borderRadius : 20,
              }}
                >
                  <FastImage 
                    source={require("../assets/icons/cross.png")}
                    style={{
                      height : 160,
                      width : 160,
                      position : "absolute",
                    top : (this.props.height * 0.5) - 100,
                    left : (SCREEN_WIDTH * 0.6) - 120,
                    }} 
                  />
               
              </LinearGradient>
            </Animated.View>

            <Animated.View
              style={{
                opacity: this.state.superLikeOpacity,
                position: 'absolute',
                zIndex: 1000,
                width : SCREEN_WIDTH,
                height : this.props.height + (SCREEN_HEIGHT * 0.012),
                left : 10,
                borderRadius : 20,
              }}
            >
              <LinearGradient colors={["rgba(0,0,0,0.1)" , "rgba(0,0,0,0.65)"]} style={{
                    width : SCREEN_WIDTH - 20,
                    flex : 1,
                    borderRadius : 20,
                  }}
                >
                  <FastImage 
                    source={require("../assets/icons/cart.png")}
                    style={{
                      height : 160,
                      width : 160,
                      position : "absolute",
                    top : (this.props.height * 0.5) - 80,
                    left : (SCREEN_WIDTH * 0.55) - 120,
                    }} 
                  />
               
              </LinearGradient>
            </Animated.View>   

            <this.ItemCard key={item.product_id} item={item} height={this.props.height}/>
          </Animated.View>
        );
      } else {
        // massive performance boost
        // 4 products ahead
        if (i > (this.state.currentIndex + 3)){
          return;
        }
        // 2 products behind
        if (i < (this.state.currentIndex - 2)){
          return;
        }
        return (
          <Animated.View
            key={item.product_id + "view"}
            style={[
              {
                // this next card opacity causes it to go black for a second as it is re rendered
                opacity: this.nextCardOpacity,
                transform: [{ scale: this.nextCardScale }],
                height: this.props.height - 120,
                width: SCREEN_WIDTH,
                padding: 10,
                position: 'absolute',
              },
            ]}
          >
            <this.ItemCard key={item.product_id} item={item} height={this.props.height}/>
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
      <View style={{ 
        flex: 1,
        backgroundColor: "black",
        paddingTop : this.props.paddingTop, 
        paddingBottom : (SCREEN_HEIGHT - this.props.height) - size.verticalScale(130)
        }}
      >
        
        <View style={{ flex: 1 }}>
          {this.renderProducts()}
        </View>
        
        {this.props.topNav === true ?
        <>
          <View style={{position : "absolute" , top : size.verticalScale(50), display : "flex" , flexDirection : "row"}}>
            <Logo />
          </View> 
          <TouchableOpacity onPress={() => router.navigate("/liked")} style={{margin : 10, position : "absolute",top: size.verticalScale(25),right : 10,}}>
            <Feather name="heart" size={35} color="white" /> 
          </TouchableOpacity>
        </>
        : <></>}


        <Filter 
          modalVisible={this.state.modalVisible} 
          filter={this.state.filter}
          setModalVisible={(v: boolean) => this.setState({modalVisible : v})}
          onConfirm={(data : any) => {
            this.props.onFilter(data);
            // TODO : this change in index when filter is called may cause some issues.
            this.setState({currentIndex : 0})
          }}
        />
        <Sharing 
          modalVisible={this.state.shareVisible} 
          setModalVisible={(v: boolean) => this.setState({shareVisible : v})}
        />

        {this.props.bottomNav === true ? 

        <View style={{
          display : "flex", flexDirection : "row", 
          bottom : size.verticalScale(10),
          justifyContent : "space-evenly",
          }}>
          <TouchableOpacity style={{
              marginHorizontal: 15,
              width: size.scale(45),
              height: size.scale(47),
              borderRadius: size.scale(25), // Half of the width/height to make it a circle
              backgroundColor: "white",
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
            onPress={() => {
                if(this.state.currentIndex > 0){
                  this.props.onUndo();
                  this.setState({currentIndex : this.state.currentIndex - 1})
                } else {
                  alert(`cannot undo any more`)
                }
            }} 
            >
                <Ionicons name="refresh" size={size.scale(26)} color="black" />
            </TouchableOpacity>


            <TouchableOpacity style={{
              marginHorizontal: 20,
              width: size.scale(55),
              height: size.scale(55),
              borderRadius: size.scale(30), // Half of the width/height to make it a circle
              backgroundColor: "white",
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
            onPress={async () => {
                // TODO : Add filter functionality
                let filter = null;

                try {
                  const filterString = await AsyncStorage.getItem("filter");
                  if(filterString !== null && filterString !== ""){
                    filter = await JSON.parse(filterString as string)
                  }
                } catch(e){}
                if(filter === null || filter === undefined){
                  filter = {
                    category : "",
                    brands : "",
                    color : "",
                    price : "",
                  }
                }
                this.setState({modalVisible : true , filter : filter})
            }} 
            >
                <Ionicons name="filter-sharp" size={size.scale(30)} color="black" />
            </TouchableOpacity>


          <TouchableOpacity style={{
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
                // this.setState({shareVisible : true})

                // TODO : shows details for now change this
                router.navigate({
                  pathname: "/details",
                  params: this.props.cards[this.state.currentIndex]
                })
            }} 
            >
              <Entypo name="paper-plane" size={size.scale(26)} color="black" />
            </TouchableOpacity>
        </View>
      : <></>}
      </View>
    );
    }
  }
}

interface ModalProps {
  setModalVisible : Function;
  modalVisible : boolean;
}

function DropDown(props : any){
  const [open , setOpen] = useState(false);
  const [value , setValue] = useState<any>([]);
  const [items, setItems] = useState(props.data);

  const [lower, setLower] = useState("")
  const [upper , setUpper] = useState("")

  let marginTop = 0;
  let marginBottom = 0;
  if (Platform.OS === "ios") {
    marginTop = SCREEN_HEIGHT * 0.1;
    marginBottom = (SCREEN_HEIGHT * 0.4) + tabBarHeight;
  }
  else if (Platform.OS === "android"){
    marginTop = SCREEN_HEIGHT * 0.22;
    marginBottom = (SCREEN_HEIGHT * 0.22) + tabBarHeight;
  }
  else {
    marginTop = SCREEN_HEIGHT * 0.22;
    marginBottom = (SCREEN_HEIGHT * 0.22) + tabBarHeight;
  }

  const styles = StyleSheet.create({
      input: {
          marginRight : size.scale(10),
          height : 50,
          width : size.scale(100),
          paddingLeft : 10,
          fontSize : 15,
          fontFamily : "Poppins",
          backgroundColor : "black",
          borderWidth : 1,
          borderColor : "white",
          color : "white",
          borderRadius : 10,
      },
  });

  return (
    <View style={{
      marginHorizontal : size.scale(20),
        marginBottom: 16,
    }}>

      <Modal
        animationType="none"
        transparent={true}
        visible={open}
        onRequestClose={() => {
         setOpen(!open);
        }}
           
      >
        <View style={{
          zIndex : open ? 4000 : 1,
          backgroundColor : "#121212",
          flex : 1,
          marginTop: marginTop,
          marginBottom : marginBottom,
          marginHorizontal : size.scale(35),
          paddingHorizontal : 20,
          borderRadius : 8,
          paddingVertical : 30,
        }}>
        <ScrollView >
          {/* TODO : Fix this input */}
          {props.type === "price" ? 
          <>
          <Text style={{marginVertical : 10, fontSize : 26, fontFamily : "Poppins", color : "white", textAlign: "center"}}>
              Price
          </Text>
          <View style={{
            marginHorizontal : size.scale(6),
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}>
            {/* TODO : Replace with programmatic logic */}
            <ScrollView style={{marginHorizontal : 10}}>
              <Text style={{marginVertical : 10, fontSize : 18, fontFamily : "Poppins", color : "white", textAlign : "center"}}>
                Min
              </Text>
              {[{
                label : "500",
                value : "500",},
                {
                label : "1000",
                value : "1000",},
                {
                label : "2000",
                value : "2000",},
                {
                label : "3000",
                value : "3000",},
              ].map((item : any) => {
            const [selected , setSelected] = useState(false);
            return <TouchableOpacity 
              key={item.value}
              style={{
                backgroundColor : "#222222",
                paddingVertical : 10,
                paddingHorizontal : 8,
                borderRadius : 5,
                marginVertical : 5,
                zIndex : 6000,
              }} 
              onPress={() => {
                if(selected === true){
                  setSelected(false);
                  setLower("")
                  return;
                } 
                setSelected(true)
                setLower(item.value)
                setValue([item.value , upper])
                props.onChange(item.value , upper);
              }}
            >
              <View style={{
                display : "flex" , 
                flexDirection : "row" , 
                justifyContent : "space-between" , 
                
              }}>

                <Text style={{
                    fontSize : 17, 
                    color : "white", 
                    alignSelf : "center", 
                    fontFamily : "Poppins", 
                  }}>
                  {item.label}
                </Text>

                {selected ? 
                <AntDesign name="check" size={20} color="white" style={{marginTop : 3}}/> 
                : <></>}
              </View>
          </TouchableOpacity>
          })}
          </ScrollView>
          <ScrollView>
            <Text style={{marginVertical : 10, fontSize : 18, fontFamily : "Poppins", color : "white", textAlign: "center"}}>
                Max
              </Text>
          {/* TODO : Replace with programmatic logic */}
              {[{
                label : "1000",
                value : "1000",},
                {
                label : "2000",
                value : "2000",},
                {
                label : "3000",
                value : "3000",},
                {
                label : "4000",
                value : "4000",},
              ].map((item : any) => {
            const [selected , setSelected] = useState(false);
            
            return <TouchableOpacity 
              key={item.value}
              style={{
                backgroundColor : "#222222",
                paddingVertical : 10,
                paddingHorizontal : 8,
                borderRadius : 5,
                marginVertical : 5,
                zIndex : 6000,
              }} 
              onPress={() => {  
                if(selected === true){
                  setSelected(false);
                  setUpper("")
                  return;
                } 
                setSelected(true)
                setUpper(item.value)
                setValue([item.value , upper])
                props.onChange(lower, item.value);
              }}
            >
              <View style={{
                display : "flex" , 
                flexDirection : "row" , 
                justifyContent : "space-between" , 
                
              }}>

                <Text style={{
                    fontSize : 17, 
                    color : "white", 
                    alignSelf : "center", 
                    fontFamily : "Poppins", 
                  }}>
                  {item.label}
                </Text>

                {selected ? 
                <AntDesign name="check" size={20} color="white" style={{marginTop : 3}}/> 
                : <></>}
              </View>
          </TouchableOpacity>
          })}
          </ScrollView>
          </View> 
          </>
          : <></>}
          {items.map((item : any) => {
            const [selected , setSelected] = useState(false);
            return <TouchableOpacity 
              key={item.value}
              style={{
                backgroundColor : "#222222",
                paddingVertical : 10,
                paddingHorizontal : 8,
                borderRadius : 5,
                marginVertical : 5,
                zIndex : 6000,
              }} 
              onPress={() => {
                let newValue = null
                if(selected === false){
                  newValue = value.concat(item.value);
                  setSelected(true);
                } else {
                  newValue = value.filter((v : any) => v !== item.value);
                  setSelected(false);
                }
                setValue(newValue);
                props.onChange(newValue);
              }}
            >
              <View style={{
                display : "flex" , 
                flexDirection : "row" , 
                justifyContent : "space-between" , 
                
              }}>

                <Text style={{
                    fontSize : 17, 
                    color : "white", 
                    alignSelf : "center", 
                    fontFamily : "Poppins", 
                  }}>
                  {item.label}
                </Text>

                {selected ? 
                <AntDesign name="check" size={20} color="white" style={{marginTop : 3}}/> 
                : <></>}
              </View>
          </TouchableOpacity>
          })}

          <View style={{paddingVertical : 20,}}/>

          
        </ScrollView>
        <PrimaryButton 
          text="Confirm" 
          onPress={() => {
            setOpen(false);
            if (props.type === "price"){
              props.onChange(lower, upper);
            }
          }}
          style={{
            paddingVertical : 5,
            fontSize : 5,
          }} 
        />
        </View>
      </Modal>

      <TouchableOpacity 
        style={{
          backgroundColor : "white", 
          width : size.scale(250),
          paddingHorizontal : 10,
          paddingVertical : size.verticalScale(10),
          borderRadius : 10,
        }} 
        onPress={() => {
          setOpen(true);
        }}
      >
        <View style={{
          display : "flex" , 
          flexDirection : "row" , 
          
        }}>
          <View style={{
            height : 22, 
            width : 22, 
            borderRadius : 50, 
            marginTop : 3,
            marginRight : 7,
            backgroundColor : "black"
          }}>
            {value.length !== 0 ? 
            <AntDesign name="check" size={14} color="white" style={{margin : 4}}/> 
            : <></>}
          </View>
          <Text style={{fontFamily : "Poppins",fontSize : 18}}>{props.title}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}



function Filter(props : any){

  const [category , setCategory] = useState("");
  const [brands , setBrands] = useState("");
  const [color , setColor] = useState("");
  const [lowerBound, setLowerBound] = useState('');
  const [upperBound, setUpperBound] = useState('');
  const [filterData , setFilter] = useState<any>({brands : [
    {"label" : "Can't load brands", "value" : "none"},
  ]})

  let marginTop = 0;
  let marginBottom = 0;
  if (Platform.OS === "ios") {
    marginTop = SCREEN_HEIGHT * 0.1;
    marginBottom = (SCREEN_HEIGHT * 0.3) + tabBarHeight;
  }
  else if (Platform.OS === "android"){
    marginTop = SCREEN_HEIGHT * 0.2;
    marginBottom = (SCREEN_HEIGHT * 0.2) + tabBarHeight;
  }
  else {
    marginTop = SCREEN_HEIGHT * 0.15;
    marginBottom = (SCREEN_HEIGHT * 0.15) + tabBarHeight;
  }


  // TODO : Get dropdown options from backend like brands etc. 
  useEffect(() => {
    (async () => {
      const data = await api.getFilter();
      if (data !== null){
        setFilter(data);
      }
      
    })()
    
  }, [])

  return (
    
     <Modal
        animationType="none"
        transparent={true}
        visible={props.modalVisible}
        onRequestClose={() => {
          props.setModalVisible(!props.modalVisible);
        }}
           
      >
        <View style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
        }}/>
        <View
          style={{
            backgroundColor : "black",
            flex : 1,
            marginTop: marginTop,
            marginBottom : marginBottom,
            marginHorizontal : size.scale(25),
            borderRadius : 8,
            paddingVertical : 30,
          }}
        >

        {/* TODO : Get filter items from backend */}
        <FlatList
          contentContainerStyle={{alignSelf: 'flex-start',marginLeft : 4}}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={[
            {
              id : 1,
              title : "Category", 
              data : [
                {label: 'Clothes', value: 'clothes'},
              ], 
              other : {multiple : true} , 
              type : "standard",
              onChange : (t : any) => setCategory(t),
            },
            {
              id : 2,
              title : "Brands", 
              data : filterData.brands, 
              other : {multiple : true} , 
              type : "searchable",
              onChange : (t : any) => setBrands(t),
            },
            {
              id : 3,
              title : "Price", 
              data : [], 
              other : {} ,
              type : "price", 
              onChange : (lower:any,upper:any) => {setLowerBound(lower);setUpperBound(upper)},
            },
          ]}
          renderItem={({ item }) => <DropDown 
              data={item.data} 
              title={item.title}
              other={item.other}
              onChange={item.onChange}
              type={item.type}
              onPress={() => {}}
            /> } 
          // TODO : Test this fully
        />
            {/*TODO : Get dropdown data from backend
            TODO : Send this filter data to server  */}
          

            <PrimaryButton
              onPress={async () => {
                props.setModalVisible(false);
                
                let filter : any = {};
                if (brands !== "") {
                  filter["vendor"] = {"$in" : brands}
                }
                
                let price : any = {};
                let priceSet = false;
                if (lowerBound !== "") { 
                  price["$gte"] = parseInt(lowerBound);priceSet=true; 
                }
                if (upperBound !== "") { 
                  price["$lte"] = parseInt(upperBound);priceSet = true;
                }
                if (priceSet === true){filter["price"] = price }

                const filterString = await AsyncStorage.getItem("filter");
                let oldFilter = null;
                if (filterString !== null){
                  oldFilter = await JSON.parse(filterString);
                }
                if(oldFilter !== null){
                  if (deepEqual(oldFilter , filter) === true){
                    return;
                  }
                }

                props.onConfirm(filter)
                

              }} 
              text="Confirm"
              style={{
                marginHorizontal : size.scale(25),
                paddingVertical : 6,
                fontSize : 4,
                fontWeight : "bold",
              }}
            />

            <SecondaryButton
              onPress={async () => {

                props.setModalVisible(false);
                
                setLowerBound("")
                setUpperBound("")
                setBrands("")
                setCategory("")

                const filterString = await AsyncStorage.getItem("filter");
                let oldFilter = null;
                if (filterString !== null){
                  oldFilter = await JSON.parse(filterString);
                } else {
                  return;
                }
                if(oldFilter !== null){
                  if (deepEqual(oldFilter , {}) === true){
                    return;
                  }
                }
                // TODO : clear all items
                await AsyncStorage.setItem("filter" , "")
                props.onConfirm({})
                
              }} 
              text="Clear Filters"
              style={{
                marginHorizontal : size.scale(25),
                paddingVertical : 6,
                fontSize : 4,
                fontWeight : "bold",
              }}
            />
            
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

            </View>
      </Modal>
   
  )
}




import { tabBarHeight } from './_layout';
import { Loading } from './_common';
import { deepEqual } from 'expo-router/build/fork/getPathFromState';



export default class App extends React.Component<any , any> {
  constructor(props : any) {
    super(props);
    this.state = {
      products: [],
      mock: [],
      WSFeed: null,
      loading : true,
      currentIndex : 0,
    };
    fetchFonts();
  }

  async componentDidMount() {

    await AsyncStorage.setItem("filter" , "") // so that filter from previous session doesn't interfere
    
    const token = await AsyncStorage.getItem('token');
    const wsfeed = new api.WSFeed(token!, (data : any) => {
      this.setState({loading : false, products: this.state.products.concat(data)});
    });
    this.setState({ WSFeed: wsfeed });

    setTimeout(async () => {
      if(this.state.loading === true){
        const products = await api.getProducts(5); 
        if (products === null){
          alert(`failed to connect to server`)
          return;
        }
        if (products.length === 0){
          alert(`failed to connect to server`)
          return;
        }
        this.setState({loading : false , products : products})
      }
    } , 1 * 1000) // TODO : replace with 5 seconds
  }

  async componentWillUnmount() {
    // closes on reload; major bug fix
    // TODO : reconnect when disconnected
    this.setState({currentIndex : 0})
    if(this.state.WSFeed !== null){
      this.state.WSFeed.close();
    }

    await AsyncStorage.setItem("filter" , "") // so that filter from previous session doesn't interfere
  }

  handleSwipe = async (action_type : string , _ : number) => {

    console.log(`products.length = ${this.state.products.length} , index = ${this.state.currentIndex}`)
    console.log(`WSFeed open = ${this.state.WSFeed?.open}`)

    const filterString = await AsyncStorage.getItem('filter');
    let filter = null
    if(filterString !== null && filterString !== ""){
      filter = JSON.parse(filterString as string);
    }

    const { WSFeed, products } = this.state;
    
    if (WSFeed) {
      if (products.length === 0) {
        return;
      }
      try {
        WSFeed.sendAction(
            action_type,
             products[this.state.currentIndex].product_id, 
            api.createQuery(null, filter)
          );
      } catch (e) {
        console.error(`products.length = ${products.length}, index = ${this.state.currentIndex}, error = ${e}`);
      }
    }

    this.setState({currentIndex : this.state.currentIndex + 1})
  };

  handleFilter = async (data : any) => {
    const deepEqual = (obj1 : any, obj2 : any) => {
      if (obj1 === obj2) {
        return true;
      }

      if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
      }

      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);

      if (keys1.length !== keys2.length) {
        return false;
      }

      for (let key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
          return false;
        }
      }

      return true;
    }

    if (data === null || data === undefined){
      return;
    }
    try {
      const filterString = await AsyncStorage.getItem("filter")
      let filter = null;
      if(filterString !== null && filterString !== ""){
        filter = (filterString as string);
      }
      if (deepEqual(filter , data)){
        return;
      }

    } catch(e){}
    try {
      await AsyncStorage.setItem('filter', JSON.stringify(data));
      this.setState({loading : true, products: [], currentIndex : 0});
      const { WSFeed } = this.state;
      await WSFeed?.sendAction('open', '', api.createQuery(null, data));
      this.setState({loading : false})
      console.log('on filter called');
    } catch (e) {
      alert(`failed to set filter, error = ${e}`);
    }
  };

  render() {
    if(this.state.loading){
      return (
        <Loading />
      )
    }
    return (
      <>
        <SwipeView
          paddingTop={size.verticalScale(70)}
          height={(SCREEN_HEIGHT * 0.885) - tabBarHeight}
          cards={this.state.products.length === 0 ? this.state.mock : this.state.products}
          onSwipe={this.handleSwipe}
          onUndo={() => this.setState({currentIndex : this.state.currentIndex - 1})}
          onFilter={this.handleFilter}
          loading={false}

          topNav={true}
          bottomNav={true}
        />
      </>
    );
  }
}



