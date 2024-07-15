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
  SafeAreaView,
} from 'react-native';
import * as size from "react-native-size-matters"
import { AntDesign, Ionicons, Entypo, EvilIcons , Feather} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { deepEqual, FastImageBackground  } from '../_common';
import {Image as FastImage} from "expo-image"


import {
  shortTitle , toTitle , fmtPrice, Logo, 
  PrimaryButton, SecondaryButton,
  DropDown,
  Filter,
  Loading,
  Sharing,
} from "../_common"

import { tabBarHeight } from './_layout';
import * as api from "../api";


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
  searchBarVisible : boolean;

  likeOpacity: number;
  dislikeOpacity: number;
  superLikeOpacity: number;


  width : number,
  height : number,
  filter : any;

  query : string;
  
}

interface AppProps {
  cards : any[];
  
  height : number;
  
  onSwipe : Function;
  onUndo : Function;
  onFilter : Function;
  onSearch : (text : string) => void;
  onFilterClear : Function;

  query : string;
  
  
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

      searchBarVisible : false,
      query : this.props.query,
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
          if (dx > 60) {
            const newDirection = 'right'; // like detected
            if (this.direction !== newDirection){
              this.setState({likeOpacity : 1, dislikeOpacity : 0, superLikeOpacity : 0})
              this.direction = newDirection;
            }
          } else if (dx < -60) {
            const newDirection = 'left';
            // disliked detected
            if (this.direction !== newDirection){
              this.setState({likeOpacity : 0, dislikeOpacity : 1, superLikeOpacity : 0})
              this.direction = newDirection;
            }
          }
        } else {
          // Vertical movement
          if (dy > 100) {
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

    if(this.state.currentIndex !== 0){
      this.setState({currentIndex : 0})
    }
    // if user first time user redirect them to welcome
    const firstTime = await AsyncStorage.getItem("first_time")
    if (firstTime === null ||  firstTime !== "no"){
      router.replace("/welcome")
    }
  }

  
  // meant as a wrapper for props handling
  async handleSwipeAction(action: string) {
    this.props.onSwipe(action , this.state.currentIndex);
  }

  // handles animation and index update, and action detection of swipe.
  handleSwipe = (gestureState: any) => {
    if (gestureState.dx > 120) {
      // Swipe right
      Animated.spring(this.position, {
        toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
        useNativeDriver: true,
        speed: 80, // Adjust speed for faster animation
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
        speed: 80, // Adjust speed for faster animation
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
        speed: 80, // Adjust speed for faster animation
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
        params: {
          data : JSON.stringify(this.props.cards[this.state.currentIndex])
        },
      })
    } else {
      // Single tap detected, wait to confirm if it is a double tap
      this.lastTap = now;
      this.tapTimeout = setTimeout(() => {
        // console.log(`single tap detected`);
      }, DOUBLE_PRESS_DELAY);
    }
  }


  // the component of single product image
  ItemCard(props: any){
    const item = props.item;
    let textHeight = props.height * 0.5;
    textHeight += Platform.OS === "ios" ? 40 : 0;
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
                  fontSize : 25,
                  fontFamily : "Poppins"
                  }}>{shortTitle(item.title as string)}</Text> 
                
                  
                  <Text style={{
                    fontSize: 23, fontFamily: "Poppins",
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
                            fontSize: 20, marginVertical: 5,
                            color : "white",
                            fontFamily : "Poppins",
                            marginHorizontal : 10,
                          }}>Rs. {fmtPrice(item.price)}</Text>
                          
                          <Text style={{
                              fontSize: 20, marginVertical: 5,
                              fontWeight : "bold",
                              fontFamily : "Poppins",
                              color : "white",
                              marginHorizontal : 10,
                              textDecorationLine : "line-through",
                            }}>{fmtPrice(item.compare_price)}</Text>
                        </View>
                        
                        
                        
                        <Text style={{
                          fontSize: 20, marginVertical: 5,
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
                          fontSize: 20, marginVertical: 5,
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

  // render products lists efficiently
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
        try {
          if (item.status === 500 || item.status === "500"){
            alert(`could not get recommendations`)
            return <></>
          }
        } catch(e){}
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

    
  // toggle search bar on or off
  toggleSearch(){
    this.setState({searchBarVisible : !this.state.searchBarVisible});
  }

  renderSearchModal(){
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.state.searchBarVisible}
        onRequestClose={() => {
          this.toggleSearch();
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
            marginTop: SCREEN_HEIGHT * 0.05,
            marginBottom : SCREEN_HEIGHT * 0.4,
            marginHorizontal : size.scale(25),
            borderRadius : 12,
          }}
        >
          <View style={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}>
              <TextInput
                placeholder='Search for something ...'
                value={this.state.query}
                onChangeText={(text : string) => {
                  this.setState({query : text})
                }}
                onSubmitEditing={() => {
                  this.props.onSearch(this.state.query)
                }}
                placeholderTextColor={"gray"}
                style={{
                  width: "100%",
                  color: "white",
                  fontSize : 16,
                  fontFamily : "Poppins",
                  backgroundColor : "#222222",
                  height: 60,
                  borderTopRightRadius: 12,
                  borderTopLeftRadius : 12,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingLeft: 50,
                  paddingRight : 10,
                }}
              />

              <Image
                source={require("../assets/icons/search.png")}
                style={{
                  position: "absolute",
                  left : 12,
                  width : 20,
                  height : 20,
                }}
              />
          </View>
          
          <Text
            style={{
              fontSize : 19,
              fontFamily : "Poppins",
              color : "white",
              marginTop : 10,
              marginBottom : 10,
              marginLeft : 20,
              
            }} 
          >Suggested Searches</Text>
          {/* TODO : Replace with trending queries and autocomplete */}
          <FlatList 
            data={mockQueries} 
            style={{paddingRight : 10,}}
            renderItem={(item) => (
              <TouchableOpacity 
                style={{
                  marginVertical : 6,
                  marginLeft : 50,
                  display : "flex",
                  flexDirection : "row",
                }}
                onPress={() => this.setState({query : item.item})} 
              >
                <Image 
                  source={require("../assets/icons/search.png")} 
                  style={{
                    marginTop : 5,
                    width : 20,
                    height : 20,
                  }}
                />
                <Text style={{
                  fontSize : 18, 
                  marginLeft : 15,
                  fontFamily : "Poppins", 
                  color : "white",
                }}>
                  {item.item}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item : any, index : number) => `query-${index}`}
          />
          <View style={{display : "flex", flexDirection : "row", flex : 1, justifyContent : "space-evenly", marginHorizontal : 7,marginBottom : 30, paddingVertical : 60}}>
            <PrimaryButton
              onPress={() => {
                this.props.onSearch(this.state.query)
                this.toggleSearch()
              }}
              style={{
                height : 50,
              }}
              textStyle={{
                fontSize : 14
              }}
              text="Confirm" 
            />
            <SecondaryButton
              onPress={() => {
                this.props.onSearch("")
                this.toggleSearch()
              }}
              style={{
                height : 50,
              }}
              textStyle={{
                fontSize : 14
              }}
              text="Clear" 
            />
          </View>
        </View>
        
      </Modal>
    )
  }

  getSearchBarPlaceholder(val : string | undefined | null){
    if (val === null){
      return "Search"
    }
    if(val === undefined){
      return "Search"
    }
    const text = val as string;
    if(text === ""){
      return "Search"
    }
    if (text.length > 10){
      return text.substring(0,9) + " ..."
    } else {
      return text
    }
  }

  // render the entire swipeview component
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
        paddingBottom : (SCREEN_HEIGHT - this.props.height) - size.verticalScale(130)
        }}
      >
        {this.props.topNav === true ?
        <>
          <View style={{display : "flex" , flexDirection : "row", justifyContent : "center"}}>
            <Image  source={require("../assets/juno_text.png")} style={{
              position : "absolute",
              left : 15,
              top : Platform.OS === "ios" ? 0 : 35,
              height : 65, 
              width : 65, 
              resizeMode : "cover" 
            }} 
          />
          <TouchableOpacity onPress={() => this.toggleSearch()} 
          style={{
            margin : 10,
            position : "absolute",
            top: Platform.OS === "ios" ? 0 : size.verticalScale(30),
            width : size.scale(160),
            height : 40,
            backgroundColor : "#222222",
            borderRadius : 20,
            alignSelf : 'center',
            display : "flex",
            flexDirection : "row",
            justifyContent : "center",
          }}>
            {this.state.query === "" ?
            <Image 
              source={require("../assets/icons/search.png")} 
              style={{
                position : "absolute",
                left : 20,
                marginVertical : 10,
                width : 20,
                height : 20,
              }}
            />
            : <></>}
            <Text 
              style={{
                fontFamily : "Poppins",
                textAlign : "center",
                alignSelf : "center",
                fontSize : 16,
                color : this.state.query === "" ? "gray" : "white",
              }} 
            >{this.getSearchBarPlaceholder(this.state.query)}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.navigate("/liked")} style={{margin : 10, position : "absolute",top: Platform.OS === "ios" ? 0 : size.verticalScale(35),right : 10,}}>
            <Feather name="heart" size={35} color="white" /> 
          </TouchableOpacity>
          </View> 
        </>
        : <></>}

        <View style={{paddingBottom : Platform.OS === "ios" ? size.verticalScale(45) : size.verticalScale(80)}}/>

        <View style={{ flex: 1 }}>
          {this.renderProducts()}
        </View>

        {this.renderSearchModal()}
        


        <Filter 
          modalVisible={this.state.modalVisible} 
          filter={this.state.filter}
          setModalVisible={(v: boolean) => this.setState({modalVisible : v})}
          onConfirm={(data : any) => {
            this.props.onFilter(data);
            
          }}
          onClear={() => {
            this.props.onFilterClear()
          }}
        />
        <Sharing 
          modalVisible={this.state.shareVisible} 
          setModalVisible={(v: boolean) => this.setState({shareVisible : v})}
        />

        {this.props.bottomNav === true ? 

        <View style={{
          display : "flex", flexDirection : "row", 
          bottom : Platform.OS === "ios" ? 0 : 10,
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


          <TouchableOpacity
            onPress={() => {
                // TODO : add share functionality 
                // this.setState({shareVisible : true})

                // TODO : shows details for now change this
                router.navigate({
                  pathname: "/details",
                  params: {
                    data : JSON.stringify(this.props.cards[this.state.currentIndex])
                  },
                })
            }}  
          >
          <LinearGradient style={{
              marginHorizontal: 15,
              width: size.scale(50),
              height: size.scale(50),
              borderRadius: size.scale(25), // Half of the width/height to make it a circle
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
            colors={["#F9CE34", "#EE2A7B","#6228D7"]}
            >
              <AntDesign name="instagram" size={size.scale(26)} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      : <></>}
      </View>
    );
    }
  }
}





interface HomeState {
  products : Array<any>;
  mock : Array<any>;
  WSFeed : api.WSFeed | null;
  loading : boolean;
  currentIndex : number;
  query : string;
}


export default class Home extends React.Component<any , HomeState> {
  constructor(props : any) {
    super(props);
    this.state = {
      products: [],
      mock: [],
      WSFeed: null,
      loading : true,
      currentIndex : 0,
      query : "",
    };
    fetchFonts();
  }

  async componentDidMount() {

    const firstTime = await AsyncStorage.getItem("first_time");
    if (firstTime === null || firstTime !== "no"){
      router.replace("/welcome")
    }

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
          console.error(`failed to get products data from server`)
          return;
        }
        if (products.length === 0){
          console.error(`products data length is 0`)
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
      let queryNull = false;
      if (this.state.query === "" && filter === null){
        queryNull = true;
      }
      try {
        WSFeed.sendAction(
            action_type,
             products[this.state.currentIndex].product_id, 
            !queryNull ? api.createQuery(this.state.query, filter) : null,
          );
      } catch (e) {
        console.error(`products.length = ${products.length}, index = ${this.state.currentIndex}, error = ${e}`);
      }
    }

    this.setState({currentIndex : this.state.currentIndex + 1})
  };

  handleFilter = async (data : any) => {

    if (data === null || data === undefined){
      return;
    }

    let dataEmpty = false;
    if (deepEqual(data , {})){
      dataEmpty = true;
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
      if (filter !== null && dataEmpty === true){
        await AsyncStorage.setItem('filter', "");
        this.setState({loading : true, products: [], currentIndex : 0});
        const { WSFeed } = this.state;
        await WSFeed?.sendAction('open', '', null);
        this.setState({loading : false})
        return;
      }
      
      if(dataEmpty === true){
        return;
      }

    } catch(e){}
    try {
      await AsyncStorage.setItem('filter', JSON.stringify(data));
      this.setState({loading : true, products: [], currentIndex : 0});
      const { WSFeed } = this.state;
      await WSFeed?.sendAction('open', '', api.createQuery(this.state.query, data));
      this.setState({loading : false})
      console.log('on filter called');
    } catch (e) {
      alert(`failed to set filter, error = ${e}`);
    }
  };



  // handle search
  async handleSearch(query : string){
    this.setState({loading : true , query : query})
    const filterString = await AsyncStorage.getItem("filter")
    let filter : any | null = null;
    if(filterString !== null && filterString !== ""){
      try {
        filter = await JSON.parse(filterString);
      } catch(e){}
    }

    if (filter === null){
      const products = await api.search(this.state.query);
      this.setState({loading : false, products : products , currentIndex : 0})
      return;
    }

    const products = await api.queryProducts(this.state.query , filter);
    this.setState({loading : false, products : products , currentIndex : 0})
  }  

  render() {
    if(this.state.loading){
      return (
        <Loading />
      )
    }
    let modifier = 0.88;
    let paddingTop = 20;
    if (Platform.OS === "ios"){
      modifier = 0.85;
      paddingTop = 70;
    }
    return (
      <SafeAreaView style={{flex : 1, backgroundColor : "black"}}>
        <SwipeView
          paddingTop={size.verticalScale(paddingTop)}
          height={(SCREEN_HEIGHT * modifier) - tabBarHeight}
          cards={this.state.products.length === 0 ? this.state.mock : this.state.products}
          onSwipe={this.handleSwipe}
          onUndo={() => this.setState({currentIndex : this.state.currentIndex - 1})}
          onFilter={this.handleFilter}
          loading={false}
          query={this.state.query}
          onSearch={(query : string) => {
            if (query === this.state.query){
              return
            }
            if (query === "" && this.state.query !== ""){
              this.setState({query : ""})
              this.handleFilter({})
              return
            }
            if (query === ""){
              this.setState({query : ""})
              return
            }
            this.handleSearch(query)
          }}
          onFilterClear={() => {
            this.handleFilter({})
          }}
          topNav={true}
          bottomNav={true}
        />
      </SafeAreaView>
    );
  }
}


const mockQueries = [
  "3 pc dress",
  "2 pc dress",
  "Stitched ready made 2 pc",
  "Unstitched lawn",
  "Chiffon dress"
]