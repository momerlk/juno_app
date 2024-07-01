import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Animated, PanResponder, Dimensions, Image, ImageBackground, Pressable, TextInput} from 'react-native';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Appearance, ColorSchemeName, ActivityIndicator, Modal, PanResponderInstance, GestureResponderEvent, PanResponderGestureState, TouchableWithoutFeedback} from 'react-native';
import * as size from "react-native-size-matters"
import { AntDesign, Ionicons, Entypo, EvilIcons} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';

import * as api from "./api";


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
  onFilter : Function;
  loading : boolean;
  paddingTop : number;
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
          } else if (dx < -100) {
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
    alert(`this.state.cards[this.state.currentIndex].title = ${this.state.cards[this.state.currentIndex].title} , this.props.card[this.state.currentIndex].title = ${this.props.cards[this.state.currentIndex].title}`)
    this.props.onSwipe(action , this.state.currentIndex);
  }

  handleSwipe = (gestureState: any) => {
    if (gestureState.dx > 120) {
      // Swipe right
      Animated.spring(this.position, {
        toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
        useNativeDriver: true,
        speed: 25, // Adjust speed for faster animation
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
        speed: 25, // Adjust speed for faster animation
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
    const textHeight = props.height/(SCREEN_HEIGHT/380);
    return (
      <ImageBackground
              style={{
                height : props.height, 
              }}
              imageStyle={{
                borderRadius : 20,
              }}
              source={{ uri: ensureURLScheme(item.image_url) }}
            >
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.6)"]} style={{
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
                  fontSize : props.height * 0.035,
                  fontFamily : "Poppins"
                  }}>{shortTitle(item.title as string)}</Text> 
                {/* <View style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}> */}
                  
                  <Text style={{
                    fontSize: props.height * 0.028, fontFamily: "Poppins",
                    color : "white",
                    marginHorizontal : 10,
                  }}>{toTitle(item.vendor as string)}</Text>
                  <Text style={{
                    fontSize: props.height * 0.025, marginVertical: 5,
                    color : "white",
                    fontFamily : "Poppins",
                    marginHorizontal : 10,
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
                  
                {/* </View> */}
                </View>
              </LinearGradient>
            </ImageBackground>
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

            key={item.product_id}
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
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.4)"]} style={{
                flex : 1,
                width : SCREEN_WIDTH ,
                borderRadius : 20,
              }}
                >
                  <EvilIcons name="heart" size={140} color="white" style={{
                    position : "absolute",
                    top : (this.props.height * 0.5) - 100,
                    left : (SCREEN_WIDTH * 0.6) - 120,
                  }}/>
               
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
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.4)"]} style={{
                width : SCREEN_WIDTH - 20,
                flex : 1,
                borderRadius : 20,
              }}
                >
                  {/* Find a good cross icon */}
                  <AntDesign name="dislike2" size={100} color="white" style={{
                    position : "absolute",
                    top : (this.props.height * 0.5) - 100,
                    left : (SCREEN_WIDTH * 0.6) - 100,
                  }}/>
               
              </LinearGradient>
            </Animated.View>

            {/* TODO : Make linear gradient appear properly */}
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
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.4)"]} style={{
                    width : SCREEN_WIDTH - 20,
                    flex : 1,
                    borderRadius : 20,
                  }}
                >
                  <AntDesign name="shoppingcart" size={100} color="white" style={{
                    position : "absolute",
                    top : (SCREEN_HEIGHT * 0.5) - 100,
                    left : (SCREEN_WIDTH * 0.6) - 100,
                  }}/>
               
              </LinearGradient>
            </Animated.View>   

            <this.ItemCard item={item} height={this.props.height}/>
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
            key={item.product_id}
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
            <this.ItemCard item={item} height={this.props.height}/>
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
                if(this.state.currentIndex > 0){
                  this.setState({currentIndex : this.state.currentIndex - 1})
                } else {
                  alert(`cannot undo any more`)
                }
            }} 
            >
                <Ionicons name="refresh" size={size.scale(26)} color="black" />
            </Pressable>


            <Pressable style={{
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
                  if(filterString !== null){
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
            </Pressable>


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
                // this.setState({shareVisible : true})

                // TODO : shows details for now change this
                router.navigate({
                  pathname: "/details",
                  params: this.props.cards[this.state.currentIndex]
                })
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

function DropDown(props : any){
  const [open , setOpen] = useState(false);
  const [value , setValue] = useState(null);
  const [items, setItems] = useState(props.data);

  return (
    <View style={{
      marginHorizontal : size.scale(20), 
      marginVertical : size.verticalScale(15),
      zIndex : open ? 3000 : 1,
    }}>
   
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        onChangeValue={props.onChange}
        
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        searchable={props.searchable}
        textStyle={{
          fontFamily: "Poppins",
          fontSize: size.scale(14),
        }}
        placeholder={props.title}
        placeholderStyle={{
          fontWeight: "semibold",
          fontSize: size.scale(15),
        }}
        {...props.other}
      />
    </View>
  )
}



function Filter(props : any){

  const [category , setCategory] = useState("");
  const [brands , setBrands] = useState("");
  const [price , setPrice] = useState(""); 
  const [color , setColor] = useState("");
  const [lowerBound, setLowerBound] = useState('');
  const [upperBound, setUpperBound] = useState('');
  const [filterData , setFilter] = useState<any[]>([
                {"label" : "Afrozeh", "value" : "afrozeh" , "base_url" : "https://www.afrozeh.com"},
                {"label" : "Nishat Linen", "value" : "nishat_linen" , "base_url" :  "https://nishatlinen.com"},
                {"label" : "Outfitters", "value" : "outfitters" , "base_url" : "https://outfitters.com.pk/"},
              ])

  const styles = StyleSheet.create({
      container: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: {
              width: 0,
              height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
      },
      input: {
          marginRight : 2,
          height : 40,
          width : 140,
          paddingLeft : 10,
          fontSize : 14,
          fontFamily : "Poppins",
          backgroundColor : "white",
      },
  });


  // TODO : Get dropdown options from backend like brands etc. 
  useEffect(() => {
    (async () => {
      const data = await api.getFilter();
      if (data !== null){
        setFilter(data.brands);
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
            {/*TODO : Get dropdown data from backend
            TODO : Send this filter data to server  */}
            <DropDown 
              data={[
                {label: 'Clothes', value: 'clothes'},
              ]} 
              title="Category"
              other={{multiple : true}}
              onChange={(t : any) => setCategory(t)}
              searchable={false}
            />     

            {/* Brands */}
            <DropDown 
              data={filterData} 
              title="Brands"
              other={{multiple : true}}
              onChange={(t : any) => setBrands(t)}
              searchable={true}
            />

            {/* <DropDown 
              data={[
                {label: 'Blue', value: 'blue'},
                {label: 'Red', value: 'red'},
                {label: 'Black', value: 'black'},
                {label: 'Green', value: 'green'},
              ]} 
              title="Color"
              other={{multiple : true}}
              onChange={(t : any) => setColor(t)}
              searchable={false}
            />   */}

            <Text
              style={{
                fontSize : 20,
                fontFamily : "Poppins",
                color : "white",
                marginHorizontal : 23,
              }} 
            >Price Range Rs.</Text>
            <View style={styles.container}>
                <TextInput
                    placeholder="Lower Bound"
                    value={lowerBound}
                    onChangeText={text => setLowerBound(text)}
                    keyboardType="numeric"
                    style={styles.input}
                />
                <TextInput
                    placeholder="Upper Bound"
                    value={upperBound}
                    onChangeText={text => setUpperBound(text)}
                    keyboardType="numeric"
                    
                    style={styles.input}
                />
            </View>

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
              onPress={() => {
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
                props.onConfirm(filter)

              }} 
            >
              <Text 
                  style={{ fontSize: 18, color: "black", fontFamily : "Poppins" }} 
                >
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



import { tabBarHeight } from './_layout';



export default class App extends React.Component<any , any> {
  constructor(props : any) {
    super(props);
    this.state = {
      products: [],
      mock: mockData,
      WSFeed: null,
      loading : false,
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');
    const wsfeed = new api.WSFeed(token!, (data : any) => {
      this.setState({ products: this.state.products.concat(data)});
    });
    this.setState({ WSFeed: wsfeed });
  }

  async componentWillUnmount() {
    // closes on reload; major bug fix
    if(this.state.WSFeed !== null && this.state.WSFeed?.open){
      this.state.WSFeed.close();
    }
  }

  handleSwipe = async (action_type : string, index : number) => {
    console.log(`products.length = ${this.state.products.length} , index = ${index}`)
    console.log(`WSFeed open = ${this.state.WSFeed?.open}`)
    const filterString = await AsyncStorage.getItem('filter');
    const filter = JSON.parse(filterString as string);
    const { WSFeed, products, mock } = this.state;
    if (WSFeed && WSFeed.open) {
      if (products.length === 0) {
        WSFeed.sendAction(action_type, mock[index].product_id, api.createQuery(null, filter));
        return;
      }
      try {
        WSFeed.sendAction(action_type, products[index].product_id, api.createQuery(null, filter));
      } catch (e) {
        console.log(`products.length = ${products.length}, index = ${index}, error = ${e}`);
      }
    }
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
      const filter = JSON.parse(filterString as string);
      if (deepEqual(filter , data)){
        return;
      }

    } catch(e){}
    try {
      await AsyncStorage.setItem('filter', JSON.stringify(data));
      this.setState({ products: [] });
      const { WSFeed } = this.state;
      WSFeed?.sendAction('open', '', api.createQuery(null, data));
      console.log('on filter called');
    } catch (e) {
      alert(`failed to set filter, error = ${e}`);
    }
  };

  render() {
    return (
      <>
        <SwipeView
          paddingTop={30}
          height={(SCREEN_HEIGHT * 0.95) - tabBarHeight}
          cards={this.state.products.length === 0 ? this.state.mock : this.state.products}
          onSwipe={this.handleSwipe}
          onFilter={this.handleFilter}
          loading={this.state.loading}
        />
      </>
    );
  }
}



const mockData = [
    {
        "product_id": "27c6c4bd-14c9-4349-b8b3-1e9695987523",
        "product_url": "https://pk.sapphireonline.pk/products/2pb-dd24v1-24-d-1",
        "shopify_id": "7441886347338",
        "handle": "2pb-dd24v1-24-d-1",
        "title": "Printed Lawn Dupatta",
        "vendor": "sapphire",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/1592/0041/files/2PBDD24V124D_1.jpg?v=1704874389",
        "images": [
            "https://cdn.shopify.com/s/files/1/1592/0041/files/2PBDD24V124D_1.jpg?v=1704874389",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/2PBDD24V124D_2.jpg?v=1704874389",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/2PBDD24V124D_3.jpg?v=1704874389"
        ],
        "description": "Pair your outfit with our printed dupatta.\nDupatta Colour: Navy Blue Fabric: Textured Lawn",
        "price": 597,
        "currency": "PKR",
        "options": [
            {
                "name": "Title",
                "position": 1,
                "values": [
                    "Default Title"
                ]
            }
        ],
        "tags": [
            "1 Piece",
            "1000 - 3000",
            "15-Percent-Tax",
            "1PC",
            "2PB-DD24V1-24 D",
            "2PBDD24V124D",
            "70% OFF",
            "70-restocked-july-sale-24",
            "all-woman-ready-to-wear",
            "Blue",
            "brands in pakistan",
            "Casual",
            "clothes",
            "Daily",
            "Daily Clothing",
            "Daily Wear",
            "Daily Wear Clothing",
            "DAILY-RTW-11th-Jan-24",
            "Dark Blue",
            "Day to Day",
            "dupata",
            "Dupatta",
            "duppata",
            "everything-June-sale-under-2000",
            "everything-June-sale-under-3000",
            "everything-June-sale-under-5000",
            "fashion",
            "full-price-designs",
            "home-edition",
            "Intermix",
            "Intermix Collection",
            "June-sale-2024",
            "kapde",
            "kapdon ke design",
            "Ladies",
            "Ladies Pret",
            "Ladies Ready To Wear",
            "Ladies Stitched",
            "ladies suit design",
            "Lawn Dupatta",
            "matching-separates",
            "Navy",
            "Navy Blue",
            "new dress design",
            "New in stitched 2024",
            "New-all-11th-Jan-24",
            "Office Wear",
            "One Piece",
            "pakistani dresses",
            "Pret",
            "Printed",
            "PRINTED-RTW-11th-Jan-24",
            "Ready to wear",
            "Ready to wear dresses",
            "Readymade",
            "Readymade clothing",
            "Restocking-April-sale-2024",
            "RTW",
            "RTW-11th-Jan-2024",
            "RTW-11th-Jan-24",
            "rtw-dupattas & shawls",
            "rtw-intermix-24",
            "rtw-printed",
            "RTW-Stitched-June-sale-2024",
            "salwar kameez design",
            "Sapphire Intermix",
            "size-chart",
            "stiched",
            "Stitched",
            "Stitched-Low-Seller-Jan-24",
            "suit design",
            "Summer",
            "Summer 1",
            "Summer 24",
            "Summer Clothing",
            "Summer Pret",
            "Summer Ready to Wear Clothing",
            "Summer RTW",
            "Summers",
            "Textured Lawn",
            "UAE_FREE_SHIPPING",
            "woman-all-products",
            "Women",
            "Women-all-products",
            "womens",
            "Womens Pret",
            "Womens Ready To Wear",
            "Womens Suit"
        ],
        "available": true
    },
    {
        "product_id": "1892a037-5701-49ed-86d0-3706ffcd70cb",
        "product_url": "https://www.alkaramstudio.com/products/3-pc-embroidered-dobby-outfit-gfsu4947-yellow",
        "shopify_id": "7495662338228",
        "handle": "3-pc-embroidered-dobby-outfit-gfsu4947-yellow",
        "title": "3 Pc Embroidered Dobby Outfit",
        "vendor": "alkaram_studio",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/GFSU4947_1.jpg?v=1718668186",
        "images": [
            "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/GFSU4947_1.jpg?v=1718668186",
            "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/GFSU4947_2.jpg?v=1718668189",
            "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/GFSU4947_3.jpg?v=1718668196",
            "https://cdn.shopify.com/s/files/1/0623/6481/1444/products/GFSU4947_4.jpg?v=1718668199"
        ],
        "description": "3 Pc Outfit - Shirt, Trouser & DupattaFabric: DobbyDesign: EmbroideredFit: RegularOur embroidered ready-to-wear line brings an array of intricately embroidered outfits ranging from contemporary to traditional cuts; perfect for your day events to your evening looks.",
        "price": 4193,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "6",
                    "8",
                    "10",
                    "12",
                    "14",
                    "16"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Yellow"
                ]
            },
            {
                "name": "Fabric",
                "position": 3,
                "values": [
                    "Dobby"
                ]
            }
        ],
        "tags": [
            "Calico Pret",
            "Eastern",
            "Flat 30% off Main",
            "New In",
            "Pret",
            "Printed",
            "Sale 2022",
            "show-quickview",
            "showpret",
            "Uploaded-08-jan-24",
            "Woman"
        ],
        "available": true
    },
    {
        "product_id": "c168f5a9-2480-4fa6-b322-b8eeeded9f22",
        "product_url": "https://generation.com.pk/products/s24w8124-yellow",
        "shopify_id": "8312854970593",
        "handle": "s24w8124-yellow",
        "title": "Virsa 2 Piece Suit",
        "vendor": "generation",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24W8124_Yellow.jpg?v=1711547997",
        "images": [
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24W8124_Yellow.jpg?v=1711547997",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24W8124_Yellow_1.jpg?v=1711547996",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24W8124_Yellow_2.jpg?v=1711547997",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24W8124_Yellow_3.jpg?v=1711547997"
        ],
        "description": "Screen printed doria checkered kurta with mukaish details, paired with loose fit printed culottes.MODEL DETAILS: Model is wearing size 8 and height is 5' 7''FABRICShirt: Lawn Lower: Lawn LENGTHSleeve Length: FullShirt Length: Medium",
        "price": 6898,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "8",
                    "10",
                    "12",
                    "14",
                    "16"
                ]
            },
            {
                "name": "Colour",
                "position": 2,
                "values": [
                    "Yellow"
                ]
            }
        ],
        "tags": [
            "addon | white | s24w8124-white",
            "Category_2-Piece",
            "Colour_Yellow",
            "Eid-Blockbusters-24",
            "Embroidered 2 Piece",
            "Fabric_Lawn",
            "Length_Medium",
            "Matching 2 Piece",
            "New-In",
            "PRICE_ UNDER 8000",
            "s24w8124-yellow",
            "Shirt & Trousers 2 Piece",
            "Size_ 8",
            "Size_10",
            "Size_12",
            "Size_14",
            "Size_16",
            "Type_Embroidered"
        ],
        "available": true
    },
    {
        "product_id": "253737ee-5562-42ca-b328-32dbdcdf75d8",
        "product_url": "https://pk.sapphireonline.pk/products/mus-2p24v4-16-1",
        "shopify_id": "7492604035146",
        "handle": "mus-2p24v4-16-1",
        "title": "Wash & Wear Suit",
        "vendor": "sapphire",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/1592/0041/files/0MUS2P24V416_3.jpg?v=1709723911",
        "images": [
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0MUS2P24V416_3.jpg?v=1709723911",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0MUS2P24V416_2.jpg?v=1709726450",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0MUS2P24V416_1.jpg?v=1709726450"
        ],
        "description": "Our black wash & wear two-piece suit seamlessly blends sophistication and contemporary style. Details:   Shirt & Trouser 4.5MColour: BlackFabric: Premium Blended Viscose",
        "price": 2593,
        "currency": "PKR",
        "options": [
            {
                "name": "Title",
                "position": 1,
                "values": [
                    "Default Title"
                ]
            }
        ],
        "tags": [
            "0MUS2P24V416",
            "15-Percent-Tax",
            "2 Piece",
            "2 Piece Suit",
            "3000 - 6000",
            "35% OFF",
            "35-restocked-july-sale-24",
            "all-man",
            "Black",
            "Classic",
            "clothes",
            "clothing brands",
            "designer dresses",
            "Dyed",
            "Eid",
            "Eid 1",
            "Eid Collection",
            "Eid Edition",
            "Eid ul Fitr",
            "everything-June-sale-under-3000",
            "everything-June-sale-under-5000",
            "fashion",
            "Gents",
            "Hero",
            "home-edition",
            "June-sale-2024",
            "kapde",
            "man",
            "Mardana Suit",
            "Men",
            "Men's Eid Collection",
            "Men's Full Suit",
            "Men's Suit",
            "Men-all-products",
            "mens",
            "mens-fabric-premium-blended-viscose",
            "mens-uns-eid-1-24",
            "mens-unstitched",
            "Mens-Unstitched-7th-March-24",
            "menswear-wash-wear-collection",
            "Menwear-Unstitched-June-sale-2024",
            "MUS-2P24V4-16",
            "New in Unstitched 2024",
            "New-all-7th-March-24",
            "online shopping",
            "online shopping in pakistan",
            "pakistani",
            "pakistani dresses",
            "Plain",
            "Premium Poly Viscose Blended Fabric",
            "salwar kameez design",
            "Sapphire Man",
            "Sapphire Unstitched",
            "Solid",
            "Solid Colors",
            "Summer Unstitched",
            "Summer Unstitched Men",
            "Two Piece",
            "Two Piece Suit",
            "UAE_FREE_SHIPPING",
            "Unstitched",
            "unstitched 2Pc Suit 4.5 mtr",
            "Unstitched Branded Clothes",
            "Unstitched Clothes",
            "Unstitched Pakistani Clothes",
            "Wash & Wear",
            "Wash & Wear Fabric"
        ],
        "available": true
    },
    {
        "product_id": "065d44a8-2958-47f5-bf3e-57c4f0e61a2b",
        "product_url": "https://nishatlinen.com/products/42401409",
        "shopify_id": "7891580289223",
        "handle": "42401409",
        "title": "3 Piece   Printed Suit   42401409",
        "vendor": "nishat_linen",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401409-_6.jpg?v=1708617086",
        "images": [
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401409-_6.jpg?v=1708617086",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401409-_7.jpg?v=1708617086",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401409-_2.jpg?v=1708617086",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401409-_4.jpg?v=1708617086",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401409-_5.jpg?v=1708617086",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401409-_7_131e5a36-fd6b-40e0-a6e1-97b89c2fbbb0.jpg?v=1708617086",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401409-_6_e44a2781-5097-4b55-9fbc-696f8b1b9974.jpg?v=1708617086"
        ],
        "description": "Embody the enchantment of a timeless muse with this printed three-piece from the latest unstitched summer collection.\nProduct Detail:Modern Mix Style Shirt with Dupatta and Trousers\nSHIRTPrinted Super Fine Lawn: 3 MeterFabric: Lawn Color: Lime Green\nDUPATTADigital Printed Banarsi Slub Dupatta: 2.5 MeterFabric: Banarsi SlubColor: Lime Green\nTROUSERSPrinted Cambric Trousers: 2.5 MeterFabric: Cambric Color: Lime Green\nNote:Product color may slightly vary due to photographic lighting sources or your device settings.",
        "price": 4492,
        "currency": "PKR",
        "options": [
            {
                "name": "Title",
                "position": 1,
                "values": [
                    "Default Title"
                ]
            }
        ],
        "tags": [
            "15%",
            "25%",
            "3pc",
            "all-sum-2024",
            "all-uns-sum-2024",
            "eid-1-sum-2024",
            "lime green",
            "mid-season-sale-sum-2024",
            "mid-season-sale-sum-2024-flat-25",
            "mid-season-sale-sum-2024-percentage",
            "mid-season-sale-sum-2024-uns",
            "pri-uns",
            "printed",
            "RU2",
            "uns 3pc",
            "uns-sum-2024-eid-1",
            "unstitched",
            "women"
        ],
        "available": true
    },
    {
        "product_id": "baec6c8f-55fa-406e-8eaf-69ffc5920672",
        "product_url": "https://beechtree.pk/products/pgswtc1-622-01-sky",
        "shopify_id": "13411556589728",
        "handle": "pgswtc1-622-01-sky",
        "title": "Sweater Knitted Pants",
        "vendor": "beechtree",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0488/9201/8848/files/PGSWTC1-622-01_1.jpg?v=1715340910",
        "images": [
            "https://cdn.shopify.com/s/files/1/0488/9201/8848/files/PGSWTC1-622-01_1.jpg?v=1715340910",
            "https://cdn.shopify.com/s/files/1/0488/9201/8848/files/PGSWTC1-622-01_2.jpg?v=1715340910"
        ],
        "description": "Made for the changing season, pull-on pants to have a cozy, warm look always ready to go and pair up with same top to complete the look.\nFeatures:Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ\nComfyŒæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ\nStraight Leg fit\nWarm\nFabric:Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ Œæ\nAcrylic",
        "price": 1209,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "6-7Y",
                    "7-8Y",
                    "9-10Y",
                    "11-12Y",
                    "13-14Y"
                ]
            },
            {
                "name": "COLOR",
                "position": 2,
                "values": [
                    "BLUE"
                ]
            },
            {
                "name": "FABRIC",
                "position": 3,
                "values": [
                    "ACRYLIC"
                ]
            }
        ],
        "tags": [
            "-outerwear",
            "11-12Y",
            "13-14Y",
            "5_s_s_size_11-12Y: 10\"-34\"",
            "6-7Y",
            "7-8Y",
            "9-10Y",
            "Acrylic",
            "child",
            "f-50",
            "Girls-S&J",
            "Outerwear-WN",
            "PKR 3000 - PKR 3499",
            "PL-70",
            "pl-sale",
            "pl-winter",
            "pl-winter-girls",
            "sale",
            "sale-by-percentage",
            "sale-outerwear",
            "Sale-OW",
            "sale-sale-season",
            "salebypercenatge",
            "shopbysize",
            "Sky",
            "t_size_13-14Y: 10\"-35\"",
            "t_size_15-16Y: 11\"-36\"",
            "t_size_6-7Y: 8.75\"-27\"",
            "t_size_7-8Y: 9\"-29\"",
            "t_size_8-9Y: 9\"-30\"",
            "t_size_9-10Y: 9.5\"-31.5\"",
            "trouser_size::waist-length",
            "w22tag",
            "winter",
            "winter collection"
        ],
        "available": true
    },
    {
        "product_id": "45a981e6-6258-40b3-ae64-359486d24cb5",
        "product_url": "https://generation.com.pk/products/s24b4288-red",
        "shopify_id": "8301060587745",
        "handle": "s24b4288-red",
        "title": "2  Piece Zarnigar",
        "vendor": "generation",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24B4288_Red.jpg?v=1711126406",
        "images": [
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24B4288_Red.jpg?v=1711126406",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24B4288_Red_1.jpg?v=1711126406",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24B4288_Red_2.jpg?v=1711126405",
            "https://cdn.shopify.com/s/files/1/0650/8249/1105/files/S24B4288_Red_3.jpg?v=1711126405"
        ],
        "description": "A long panelled printed shirt with round neck and placket, full sleeves and paired with straight trousers.MODEL DETAILS: Model is wearing size 8 and height is 5' 7''FABRICShirt: LawnLower: LawnLENGTHSleeve Length: FullShirt Length: Medium",
        "price": 5698,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "8",
                    "10",
                    "12",
                    "14",
                    "16"
                ]
            },
            {
                "name": "Colour",
                "position": 2,
                "values": [
                    "Red"
                ]
            }
        ],
        "tags": [
            "addon | black | s24b4288-black",
            "addon | yellow | s24b4288-yellow",
            "Category_2-Piece",
            "Colour_Red",
            "Fabric_Lawn",
            "Length_Medium",
            "Matching 2 Piece",
            "New-In",
            "Pre-Spring-2024",
            "PRICE_ UNDER 8000",
            "Printed 2 Piece",
            "s24b4288-red",
            "Shirt & Trousers 2 Piece",
            "Size_ 8",
            "Size_10",
            "Size_12",
            "Size_14",
            "Size_16",
            "Type_Printed"
        ],
        "available": true
    },
    {
        "product_id": "7872fe27-646a-450b-bc44-c49a8ce82a82",
        "product_url": "https://outfitters.com.pk//products/f0087-312",
        "shopify_id": "7576950800575",
        "handle": "f0087-312",
        "title": "Faux Suede Boots",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0087312808_4.jpg?v=1699357047",
        "images": [
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0087312808_4.jpg?v=1699357047",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0087312808_3.jpg?v=1699357047",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0087312808_2.jpg?v=1699357047",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0087312808_1.jpg?v=1699357047",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0087312907_1.jpg?v=1699357047",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0087312907_3.jpg?v=1699357047",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0087312907_2.jpg?v=1699357047",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0087312907_4.jpg?v=1699357047"
        ],
        "description": "Fit Boots Composition & Care  \nNubuck upper with rubber sole  \nDo not wash\nDo not bleach\nDo not dry clean\nDo not tumble dry\nDo not submerge in water ",
        "price": 3490,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Peanut",
                    "Metal"
                ]
            },
            {
                "name": "Size",
                "position": 2,
                "values": [
                    "23",
                    "24",
                    "25",
                    "26",
                    "27",
                    "28",
                    "29",
                    "30"
                ]
            },
            {
                "name": "Season",
                "position": 3,
                "values": [
                    "WS-23"
                ]
            }
        ],
        "tags": [
            "20222-2023",
            "2023",
            "all-baby-boys",
            "B18-WS23",
            "Baby Boys",
            "Boots",
            "Boys",
            "CHELSEA BOOTS",
            "end-winter23",
            "Foot-Wear",
            "JTshoes-01-SimplifiedSizechart",
            "Junior",
            "Juniors",
            "JuniorSpecialPrices",
            "Kids",
            "Peanut",
            "PKR 6090 - PKR 6990",
            "revert-great-weeked-23",
            "saleagain24",
            "Shoes",
            "TB-Shoes",
            "TB-Shoes-Sale",
            "tb-winter-sale",
            "TBSpecialPrice",
            "ToddlerBoysSize-chart",
            "Winter",
            "Winter-23"
        ],
        "available": true
    },
    {
        "product_id": "a1b1e752-3abf-4d42-b838-da6b5b0a9009",
        "product_url": "https://outfitters.com.pk//products/f0203-509",
        "shopify_id": "7630232780991",
        "handle": "f0203-509",
        "title": "Straight Fit Cargo Jeans",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0203509618_2.jpg?v=1705659110",
        "images": [
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0203509618_2.jpg?v=1705659110",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0203509618_3.jpg?v=1705659110",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0203509618_1.jpg?v=1705659110",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0203509618LOWER.jpg?v=1707731443",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0203509618LOWER_2.jpg?v=1707731443"
        ],
        "description": "Fit Straight Composition & Care  \n100% COTTON\nMachine wash up to 30C/86F, gentle cycle \nDo not bleach\nIron up to 110C/230F\nDo not iron directly on prints/embroidery/embellishments\nDo not dry clean\nDo not tumble dry\n",
        "price": 2590,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Dark Blue"
                ]
            },
            {
                "name": "Size",
                "position": 2,
                "values": [
                    "06-07Y",
                    "07-08Y",
                    "08-09Y",
                    "09-10Y",
                    "10-11Y",
                    "11-12Y",
                    "13-14Y"
                ]
            },
            {
                "name": "Season",
                "position": 3,
                "values": [
                    "SS-24"
                ]
            }
        ],
        "tags": [
            "2023-2023",
            "2024",
            "all-boys",
            "B01-SS24",
            "Bottom",
            "Boys",
            "Dark Blue",
            "JB Jeans-SS-24",
            "JB-JEAN-STR-SimplifiedSizechart",
            "JB-Jeans-Sale",
            "jb-new",
            "JBSpecialPrice",
            "Jeans",
            "Junior Boys",
            "Junior SS-24",
            "Juniors",
            "JuniorsBoys-size-chart",
            "JuniorSpecialPrices",
            "Kid",
            "Kids",
            "mss24",
            "Non-Ripped",
            "PKR 3090 - PKR 3990",
            "SS-24",
            "Straight",
            "Summer",
            "Summer-24",
            "Up_Coming_Campaign"
        ],
        "available": true
    },
    {
        "product_id": "4f57db83-67b7-4c90-8d24-213827e61906",
        "product_url": "https://pk.sapphireonline.pk/products/2pe-sg24v1-5-t-1",
        "shopify_id": "7479394533450",
        "handle": "2pe-sg24v1-5-t-1",
        "title": "Embroidered Cambric Culottes",
        "vendor": "sapphire",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/1592/0041/files/02PESG24V15T_4.jpg?v=1708580292",
        "images": [
            "https://cdn.shopify.com/s/files/1/1592/0041/files/02PESG24V15T_4.jpg?v=1708580292",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/02PESG24V15T_1.jpg?v=1708580292",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/02PESG24V15T_3.jpg?v=1708580292",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/02PESG24V15T_2.jpg?v=1708580291"
        ],
        "description": "Complete your look with our mulberry, printed culottes.\nCulottesColour: MulberryFabric: Cambric\nSIZE & FITModel height: 5 Feet 6 InchesModel Wears: S\n\n\n\n\nSize\nXXS\nXS\nS\nM\nL\nXL\n\n\nLength\n36\n36.875\n37.75\n38.625\n39.5\n40.5\n\n\nFront Rise\n11\n11.5\n12\n13\n14\n15\n\n\nBack Rise\n14\n14.5\n15\n16\n17\n18\n\n\nWaist Relaxed\n12\n13\n14\n15\n16\n17\n\n\nWaist Extended\n18\n19\n20\n21\n22\n23\n\n\nBottom Half\n13.5\n14.25\n15\n15.75\n16.5\n17.25\n\n\n",
        "price": 1295,
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "XXS",
                    "XS",
                    "S",
                    "M",
                    "L",
                    "XL"
                ]
            }
        ],
        "tags": [
            "02PESG24V15T",
            "02PESG24V15T-size-chart",
            "1 Piece",
            "1000 - 3000",
            "15-Percent-Tax",
            "1PC",
            "2PE-SG24V1-5 T",
            "50% OFF",
            "50-restocked-july-sale-24",
            "all-woman-ready-to-wear",
            "Bottoms",
            "Cambric",
            "Cambric Trousers",
            "Dark Pink",
            "Dinner Attire",
            "Dinner Date",
            "Dinner Outfit",
            "Dinner Wear",
            "DINNER-DATE-RTW-22nd-Feb-24",
            "Emb",
            "Embr",
            "Embroidered",
            "everything-June-sale-under-2000",
            "everything-June-sale-under-3000",
            "everything-June-sale-under-5000",
            "home-edition",
            "June-sale-2024",
            "Karahi",
            "Ladies Pret",
            "Ladies Ready To Wear",
            "Ladies Stitched",
            "Mulberry",
            "New-all-22nd-Feb-24",
            "new-in-rtw-2021",
            "Office Wear",
            "One Piece",
            "Pink",
            "Pret",
            "Printed",
            "PRINTED-RTW-22nd-Feb-24",
            "Ready to wear",
            "Ready to wear dresses",
            "Readymade",
            "Readymade clothing",
            "Restocking-April-sale-2024",
            "RTW",
            "RTW-22nd-Feb-24",
            "rtw-embroidered",
            "rtw-rtw bottoms",
            "rtw-spring-summer-24",
            "RTW-Stitched-June-sale-2024",
            "Signature",
            "Single Piece",
            "size-chart",
            "Stitched",
            "Summer",
            "Summer 24",
            "Summer Clothing",
            "Summer Pret",
            "Summer Ready to Wear Clothing",
            "Summer RTW",
            "Summers",
            "Trouser",
            "Trousers",
            "Trousers-RTW-22nd-Feb-24",
            "UAE_FREE_SHIPPING",
            "woman-all-products",
            "woman-culottes-trousers",
            "Womens Pret",
            "Womens Ready To Wear"
        ],
        "available": true
    },
    {
        "product_id": "94af72b2-2c83-4882-9ff1-415bb9f14c52",
        "product_url": "https://outfitters.com.pk//products/f0020-210",
        "shopify_id": "7741990338751",
        "handle": "f0020-210",
        "title": "Bermuda Shorts",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0020210630_2.jpg?v=1716878293",
        "images": [
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0020210630_2.jpg?v=1716878293",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0020210630.jpg?v=1716878293",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0020210630_3.jpg?v=1716878293",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0020210630_1.jpg?v=1716878293",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0020210630_2_copy.jpg?v=1716878293",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0020210630_4_copy2.jpg?v=1716878293",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0020210630_6_copy.jpg?v=1716878293"
        ],
        "description": "(model-data)\nThe model is wearing size: 26; Model height: 5.4ft\n(model-data-end)\n(main-data)\nFit Loose Composition & Care  \n100%  Cotton \nMachine wash up to 30C/86F, gentle cycle \nDo not bleach\nIron up to 110C/230F\nDo not iron directly on prints/embroidery/embellishments\nDo not dry clean\nDo not tumble dry\n",
        "price": 2590,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Skyway"
                ]
            },
            {
                "name": "Size",
                "position": 2,
                "values": [
                    "26",
                    "28",
                    "30",
                    "32",
                    "34",
                    "24"
                ]
            },
            {
                "name": "Season",
                "position": 3,
                "values": [
                    "HS-24"
                ]
            }
        ],
        "tags": [
            "2023-2024",
            "2024",
            "B11-SS24",
            "Bottom",
            "Denim",
            "Loose",
            "mss24",
            "PKR 3090 - PKR 3990",
            "Shorts",
            "Skyway",
            "SS-24",
            "Summer",
            "Summer-24",
            "W-Shorts-SS-24",
            "W-Skirt-SimplifiedSizechart",
            "Women",
            "women-size-chart",
            "WomenShortsSale",
            "WomenSkirtSale",
            "womenspecialprices",
            "WomenSS-24"
        ],
        "available": true
    },
    {
        "product_id": "4ee3ac09-6bb9-44b8-921c-6ee0e0b6052d",
        "product_url": "https://outfitters.com.pk//products/f0239-509",
        "shopify_id": "7742014881983",
        "handle": "f0239-509",
        "title": "Wide Leg Jean",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0239509630_2.jpg?v=1715091904",
        "images": [
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0239509630_2.jpg?v=1715091904",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0239509630_3.jpg?v=1715091904",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0239509630_8.jpg?v=1715091904",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0239509630_7.jpg?v=1715091904"
        ],
        "description": "Fit Wide Composition & Care  \n100% COTTON\nMachine wash up to 30C/86F, gentle cycle \nDo not bleach\nIron up to 110C/230F\nDo not iron directly on prints/embroidery/embellishments\nDo not dry clean\nDo not tumble dry\n",
        "price": 3690,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Skyway"
                ]
            },
            {
                "name": "Size",
                "position": 2,
                "values": [
                    "06-07Y",
                    "07-08Y",
                    "08-09Y",
                    "09-10Y",
                    "10-11Y",
                    "11-12Y",
                    "13-14Y"
                ]
            },
            {
                "name": "Season",
                "position": 3,
                "values": [
                    "HS-24"
                ]
            }
        ],
        "tags": [
            "2023-2024",
            "2024",
            "all-boys",
            "B11-SS24",
            "Bottom",
            "Boys",
            "Boys Junior",
            "JB Jeans-SS-24",
            "jb-new",
            "JB-WIDEBAGGY-Jean-SimplifiedSizechart",
            "Jeans",
            "Junior SS-24",
            "Juniors",
            "JuniorsBoys-size-chart",
            "Kid",
            "Kids",
            "Non-Ripped",
            "PKR 3090 - PKR 3990",
            "Skyway",
            "SS-24",
            "Summer",
            "Summer-24",
            "Wide"
        ],
        "available": true
    },
    {
        "product_id": "6a8e7d60-1a43-44a0-a842-47b5a90b9a10",
        "product_url": "https://pk.sapphireonline.pk/products/u3p-dy24d2-25-1",
        "shopify_id": "7616103972938",
        "handle": "u3p-dy24d2-25-1",
        "title": "3 Piece   Printed Lawn Suit",
        "vendor": "sapphire",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/1592/0041/files/0U3PDY24D225_3_d036ccf8-e84e-4b33-8201-1af047abef33.jpg?v=1714395455",
        "images": [
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0U3PDY24D225_3_d036ccf8-e84e-4b33-8201-1af047abef33.jpg?v=1714395455",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0U3PDY24D225_1_750ec1e1-cf98-45e8-98a0-7519185fbf5f.jpg?v=1714395455",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0U3PDY24D225_2_eeb40cab-8ac3-49d9-902d-e3b70bd1cfeb.jpg?v=1714395455",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0U3PDY24D225_4_50c5fdb8-e0d7-4535-bbdd-2354f65ef17d.jpg?v=1714395455",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0U3PDY24D225_5.jpg?v=1714395455",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0U3PDY24D225_4.jpg?v=1714395455",
            "https://cdn.shopify.com/s/files/1/1592/0041/files/0U3PDY24D225_3.jpg?v=1714395455"
        ],
        "description": "Add colour to your seasonal closet with our printed three-piece featuring a dark blue lawn shirt, cambric trouser, and multi-coloured voile dupatta.Unstitched 3-Piece Shirt: Printed Lawn Shirt 3MFabric: LawnColour: Dark Blue Dupatta: Printed Voile Dupatta 2.5MFabric: VoileColour: Multi-colours Trousers: Dyed Cambric Trouser 2.5MFabric: CambricColour: Dark Blue",
        "price": 2872,
        "currency": "PKR",
        "options": [
            {
                "name": "Title",
                "position": 1,
                "values": [
                    "Default Title"
                ]
            }
        ],
        "tags": [
            "0U3PDY24D225",
            "15-Percent-Tax",
            "20% OFF",
            "20-restocked-july-sale-24",
            "3 Piece",
            "3 Piece Suit",
            "3000 - 6000",
            "3PC",
            "all-woman-unstitched",
            "Basic Lawn",
            "best-of-sale-june-24",
            "Blue",
            "brands in pakistan",
            "Breezy",
            "Casual",
            "clothes",
            "Daily",
            "Daily Clothing",
            "Daily Wear",
            "Daily Wear Clothing",
            "Dark Blue",
            "Day to Day",
            "day-to-day-3-24",
            "designer dresses",
            "everything-June-sale-under-3000",
            "everything-June-sale-under-5000",
            "fashion",
            "Full Suit",
            "home-edition",
            "June-sale-2024",
            "kapde",
            "kapdon ke design",
            "Ladies",
            "ladies suit design",
            "Lawn",
            "lawn-fabric",
            "new dress design",
            "New-all-29th-April-24",
            "new-in-june-2022",
            "new-in-unsticted-2021",
            "Office Wear",
            "pakistani dresses",
            "Printed",
            "salwar kameez design",
            "Sapphire Unstitched",
            "suit design",
            "Summer",
            "Summer 24",
            "Summer Clothing",
            "Summer Lawn",
            "Summer Unstitched",
            "Summer Unstitched Clothing",
            "Summers",
            "Three Piece",
            "Three Piece Suit",
            "U3P-DY24D2-25",
            "UAE_FREE_SHIPPING",
            "Unstitched",
            "Unstitched Clothes",
            "Unstitched Pakistani Clothes",
            "woman-all-products",
            "woman-uns-three-piece",
            "Women",
            "Women-all-products",
            "Women-Unstitched-June-sale-2024",
            "womens",
            "Womens Suit",
            "Womens-Unstitched-29th-April-24"
        ],
        "available": true
    },
    {
        "product_id": "0012cf94-a5af-4942-8494-4795c8464d52",
        "product_url": "https://outfitters.com.pk//products/f0416-103",
        "shopify_id": "7535348318399",
        "handle": "f0416-103",
        "title": "Oversized Denim Shacket",
        "vendor": "outfitters",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7887/files/F0416103625_3_3441f681-d07d-4f0c-afaa-74676a37dcab.jpg?v=1695378833",
        "images": [
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0416103625_3_3441f681-d07d-4f0c-afaa-74676a37dcab.jpg?v=1695378833",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0416103625_1_9283c523-9f51-4e0c-8021-82afd63a84d7.jpg?v=1695378833",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0416103625M_2.jpg?v=1695378833",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0416103625M_1.jpg?v=1695378833",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0416103625M_4.jpg?v=1695378833",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0416103625M_3.jpg?v=1695378833",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0416103625_2_cf4ada72-78a3-4603-9d95-7629eac7ae1a.jpg?v=1702980050",
            "https://cdn.shopify.com/s/files/1/2290/7887/files/F0416103625_1.jpg?v=1702980050"
        ],
        "description": "(model-data)\nThe model is wearing size: L; Model height:åÊ6.0ft\n(model-data-end)\n(main-data)\n Fit OversizedRoomiest possible fit. Loose around your shoulders and waist while falling a few inches longer than a typical shirt. Recalls slouch and doesn‰۪t have any body definition. Tip: For a slightly snug fit, go for a size smaller than your normal size Composition & Care  \n100%Cotton\nMachine wash up to 30C/86F, gentle cycle \nDo not bleach\nIron up to 110C/230F\nDo not iron directly on prints/embroidery/embellishments\nDo not dry clean\nDo not tumble dry\n",
        "price": 2990,
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Denim Blue"
                ]
            },
            {
                "name": "Size",
                "position": 2,
                "values": [
                    "S",
                    "M",
                    "L",
                    "XL"
                ]
            },
            {
                "name": "Season",
                "position": 3,
                "values": [
                    "WS-23"
                ]
            }
        ],
        "tags": [
            "12 Sep-23",
            "20 Sep-23",
            "2023",
            "2023-2023",
            "B01-WS23",
            "Denim",
            "Denim Blue",
            "end-winter23",
            "FP-Slow",
            "Jackets",
            "M-Shirt-Over-SimplifiedSizechart",
            "Men",
            "MEN JACKET",
            "men-size-chart",
            "men-winter-sale",
            "MenJacketSale",
            "menspecialprices",
            "NewMen",
            "Oversized",
            "PKR 4090 - PKR 4990",
            "revert-great-weeked-23",
            "s-seller",
            "saleagain24",
            "Shacket",
            "Shirts",
            "st-shirts24",
            "st24",
            "Summer",
            "Summer-23",
            "timeless 22 Sep-23",
            "Winter-23"
        ],
        "available": true
    },
    {
        "product_id": "b0956a7c-78e2-435f-b639-e430d8e439a9",
        "product_url": "https://breakout.com.pk//products/k24sb448-ryb",
        "shopify_id": "7303380959286",
        "handle": "k24sb448-ryb",
        "title": "Boys Sporty Printed Shorts",
        "vendor": "breakout",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0202/5884/8822/files/K24SB448-RYB_1.jpg?v=1711692591",
        "images": [
            "https://cdn.shopify.com/s/files/1/0202/5884/8822/files/K24SB448-RYB_1.jpg?v=1711692591",
            "https://cdn.shopify.com/s/files/1/0202/5884/8822/files/K24SB448-RYB_2.jpg?v=1711692591",
            "https://cdn.shopify.com/s/files/1/0202/5884/8822/files/K24SB448-RYB_3.jpg?v=1711692592"
        ],
        "description": "100% Polyester",
        "price": 1189,
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "1-2Y",
                    "2-3Y",
                    "3-4Y",
                    "4-5Y",
                    "5-6Y",
                    "6-7Y",
                    "7-8Y",
                    "9-10Y",
                    "11-12Y",
                    "13-14Y"
                ]
            },
            {
                "name": "COLOR",
                "position": 2,
                "values": [
                    "ROYAL BLUE"
                ]
            }
        ],
        "tags": [
            "100% Polyester",
            "24-SUM",
            "BOYS",
            "co-ords",
            "FLAT30",
            "Kids Bottom",
            "SALE",
            "SHORTS"
        ],
        "available": true
    },
    {
        "product_id": "4e94b57c-d310-45fd-ab5c-6e8968c645c6",
        "product_url": "https://nishatlinen.com/products/42401360",
        "shopify_id": "7891578486983",
        "handle": "42401360",
        "title": "3 Piece   Printed Embroidered Suit   42401360",
        "vendor": "nishat_linen",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401360-_5.jpg?v=1708606603",
        "images": [
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401360-_5.jpg?v=1708606603",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401360-_3.jpg?v=1708606603",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401360-_6.jpg?v=1708606603",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401360-_1.jpg?v=1708606603",
            "https://cdn.shopify.com/s/files/1/0534/2065/4791/files/42401360-_4.jpg?v=1708606603"
        ],
        "description": "Embrace the whispers of timelessness with this printed embroidered three-piece from the latest unstitched summer collection.\nProduct Detail:Block Print Style Shirt with Dupatta and Trousers\nSHIRTPrinted Cambric Shirt: 3 MeterEmbroidered Neckline + BorderFabric: CambricColor: Teal\nDUPATTABlock Printed Khadi Silk Dupatta: 2.5 MeterFabric: Khadi SilkColor: Teal\nTROUSERSDyed Cambric Trousers: 3 MeterFabric: CambricColor: Teal\nNote:Product color may slightly vary due to photographic lighting sources or your device settings.",
        "price": 5992,
        "currency": "PKR",
        "options": [
            {
                "name": "Title",
                "position": 1,
                "values": [
                    "Default Title"
                ]
            }
        ],
        "tags": [
            "15%",
            "25%",
            "3pc",
            "all-sum-2024",
            "all-uns-sum-2024",
            "cambric",
            "cambric-sum-2024",
            "eid-1-sum-2024",
            "emb-uns",
            "embroidered",
            "mid-season-sale-sum-2024",
            "mid-season-sale-sum-2024-flat-25",
            "mid-season-sale-sum-2024-percentage",
            "mid-season-sale-sum-2024-uns",
            "RU2",
            "teal",
            "uns 3pc",
            "uns-cambric",
            "uns-sum-2024-eid-1",
            "unstitched",
            "women"
        ],
        "available": true
    }
]