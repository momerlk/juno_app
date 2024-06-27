import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Animated, PanResponder, Dimensions, Image, ImageBackground, Pressable } from 'react-native';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Appearance, ColorSchemeName, ActivityIndicator, Modal, PanResponderInstance, GestureResponderEvent, PanResponderGestureState, TouchableWithoutFeedback} from 'react-native';
import * as size from "react-native-size-matters"
import { AntDesign, Ionicons, Entypo, EvilIcons} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';



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

    this.direction = "none";

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
          if (dx > 70) {
            const newDirection = 'right';
            if (this.direction !== newDirection){
              this.setState({likeOpacity : 1, dislikeOpacity : 0, superLikeOpacity : 0})
            }
          } else if (dx < -70) {
            const newDirection = 'left';
            if (this.direction !== newDirection){
              this.setState({likeOpacity : 0, dislikeOpacity : 1, superLikeOpacity : 0})
            }
          }
        } else {
          // Vertical movement
          if (dy > 110) {
            const newDirection = 'down';
          } else if (dy < -110) {
            const newDirection = 'up';
            if (this.direction !== newDirection){
              this.setState({likeOpacity : 0, dislikeOpacity : 0, superLikeOpacity : 1})
            }
          }
        }
      },
      onPanResponderRelease: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        this.endTime = new Date().getTime();
        const timeDiff = this.endTime - this.startTime;
        this.setState({likeOpacity : 0, dislikeOpacity : 0, superLikeOpacity : 0})


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

    // setTimeout(async () => {
    //   // connecting to feed websocket
    //   const socket = new WebSocket(`ws://172.24.6.108:8080/feed?token=${token2}`);
    //   socket.onerror = (error : any) => {
    //     alert(`websocket feed error = ${JSON.stringify(error)}`)
    //   }

    //   socket.onmessage = (ev: MessageEvent<any>) => {
    //     const parsed = JSON.parse(ev.data);
    //     // no products
    //     // TODO : Create an error logger system which logs errors users face

    //     if (parsed === null || parsed === undefined) {
    //       return;
    //     }
    //     if (parsed === null || parsed == undefined) {
    //       return;
    //     }

    //     let products = parsed;

    //     if (products === undefined) {
    //       this.setState({ currentIndex: 0 })
    //     } else {
    //       Image.getSize(
    //         products[0].image_url,
    //         (width, height) => {
    //           const aspectRatio = width / height;
            
    //         // TODO : optimise these calculations
    //         // Calculate the adjusted width based on the fixed height
    //         const adjustedWidth = aspectRatio * this.props.height;
    //         this.setState({ height : this.props.height , width : adjustedWidth});
    //         },
    //         (error) => {
    //           console.error('Failed to get image size', error);
    //         }
    //       );
    //       this.setState({ currentIndex: 0, cards: products });
    //     }

    //     this.setState({loading : false})
    //   };

    //   this.setState({ socket: socket });
    // }, 500);


    // setTimeout( // initial authentication to socket
    //   () => {
    //     try {
    //     this.state.socket.send(`{
    //         "user_id" : "",
    //         "action_type" : "open",
    //         "action_timestamp" : "",
    //         "product_id" : ""
    //     }`)
    //     } catch (e){
    //         alert(`failed to connect, error = ${e}`)
    //     }
    
    // }, 1000)
  }

  

  async handleSwipeAction(action: string) {
    // this.state.socket.send(JSON.stringify({
    //   user_id : "",
    //   action_type: action,
    //   action_timestamp: new Date().toJSON(),
    //   product_id: this.state.cards[this.state.currentIndex]["product_id"],
    // }))
    this.props.onSwipe(action);
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
      // console.log(`double tap detected`)
      router.navigate({
        pathname: "/details",
        params: this.state.cards[this.state.currentIndex]
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
    const textHeight = props.height/2.5;
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
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.4)"]} style={{
                marginTop : props.height - textHeight , 
                height : textHeight,
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
    const rotate = this.position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-5deg', '0deg', '5deg'],
      extrapolate: 'clamp',
    });
    return this.state.cards.map((item, i) => {
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
                position: 'absolute',
              },
            ]}
          >
            <Animated.View
              style={{
                opacity: this.state.likeOpacity,
                position: 'absolute',
                left : 10,
                zIndex: 1000,
                width : this.state.width,
                height : this.props.height,
              }}
            >
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.65)"]} style={{
                
                flex : 1,
                
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
                width : this.state.width + 10,
                height : this.props.height,
              }}
            >
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.65)"]} style={{
                
                flex : 1,
                
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
                marginBottom : SCREEN_HEIGHT - this.props.height,
                zIndex: 1000,
                width : SCREEN_WIDTH,
                height : this.props.height - 8,
              }}
            >
              <LinearGradient colors={["transparent" , "rgba(0,0,0,0.65)"]} style={{
                width : this.state.width,
                height : this.props.height,
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
        return (
          <Animated.View
            key={item.product_id}
            style={[
              {
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
      <View style={{ flex: 1,backgroundColor: "black", paddingTop : SCREEN_HEIGHT * 0.042, paddingBottom : (SCREEN_HEIGHT - this.props.height) - size.verticalScale(130)}}>
        <View style={{ flex: 1 }}>{this.renderProducts()}</View>
        <Filter 
          modalVisible={this.state.modalVisible} 
          filter={this.state.filter}
          setModalVisible={(v: boolean) => this.setState({modalVisible : v})}
          onConfirm={this.props.onFilter}
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
                  params: this.state.cards[this.state.currentIndex]
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

  // TODO : Get dropdown options from backend like brands etc. 
  
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
                {label: 'Shoes', value: 'shoes'},
                {label: 'Acessories', value: 'accessories'}
              ]} 
              title="Category"
              other={{multiple : true}}
              onChange={(t : any) => setCategory(t)}
              searchable={false}
            />     

            <DropDown 
              data={[
                {label: 'Afrozeh', value: 'afrozeh'},
                {label: 'Sana Safinaz', value: 'sana_safinaz'},
                {label : "Bonanza Satrangi" , value : "bonanza_satrangi"}
              ]} 
              title="Brands"
              other={{multiple : true}}
              onChange={(t : any) => setBrands(t)}
              searchable={true}
            />

            <DropDown 
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
            />  

            <DropDown 
              data={[
                {label: 'Rs. 0 - 5000', value: 'RS_0_5000'},
                {label: 'Rs. > 5000', value: 'RS_5000_1000'}
              ]} 
              title="Price Range"
              onChange={(t : any) => setPrice(t)}
              searchable={false}
            />       

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
                  props.onConfirm({
                      category : category,
                      brands : brands,
                      color : color, 
                      price : price,
                    })
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




export default function App(){

  return (
    <SwipeView 
    cards={mockData} 
    height={size.verticalScale(580)} 
    onSwipe={(action : string) => alert(`action = ${action}`)}
    onFilter={async (data : any) => {
      try {
      await AsyncStorage.setItem("filter" , JSON.stringify(data))
      } catch (e){
        alert(`failed to set storage , error = ${e}`)
      }
    }}
    loading={false}
    />
  )
}

const mockData = [
    {
        "product_id": "a231d35a-7e2f-41a4-a2c2-8b0738e2c234",
        "product_url": "https://www.mariab.pk/products/abg-h24-5-brown",
        "shopify_id": "8093929570470",
        "handle": "abg-h24-5-brown",
        "title": "Large Hobo | Abg H24 5",
        "vendor": "maria_b",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0620/8788/9062/files/ABG-H24-5Brwon.jpg?v=1714048580",
        "description": "Crafted with textured leather for a sophisticated finish and a comfortable handle drop, this bag is a perfect choice for everyday versatility. Its spacious interior promises enough room to carry all your essentials with ease. DetailsShoulder Bag Leather handle dropMagnetic fasteningMaterial: LeatherSilver-tone hardwareInterior Details: Single compartmentOne pouch bagExterior Details:One zipped pocketSilver ring embellishmentColor: Blue, Black \u0026 BrownDimensions: 14\"W X 10.2”H X 4”D",
        "body_html": "",
        "price": "4490",
        "currency": "PKR",
        "options": [
            {
                "name": "Size",
                "position": 1,
                "values": [
                    "Default"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Brown"
                ]
            }
        ],
        "tags": [
            "25-Apr-24",
            "_label_New",
            "dhlcode:4202 9900",
            "dhldes:Women Handbags",
            "Item_Tax_Rate:18",
            "M.Basics",
            "M.Basics Bags",
            "M.Basics New Arrivals",
            "M.Basics Shoulder Bags"
        ],
        "available": true
    },
    {
        "product_id": "4efa3b44-074d-498e-bd0a-5a2ec162fc43",
        "product_url": "https://www.alkaramstudio.com/products/three-piece-embroidered-yarn-dyed-with-printed-chiffon-dupatta-fc-7c-24-2-magenta",
        "shopify_id": "7690205823156",
        "handle": "three-piece-embroidered-yarn-dyed-with-printed-chiffon-dupatta-fc-7c-24-2-magenta",
        "title": "3 Pc Embroidered Yarn Dyed With Printed Chiffon Dupatta",
        "vendor": "alkaram_studio",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/0623/6481/1444/files/FC-7C-24-2-Magenta-1_f3c9defe-2c2d-472c-9d59-7a8eb0bb2242.jpg?v=1718543437",
        "description": "Unstitched 3-Piece\nEmbroidered Yarn dyed with Printed chiffon Dupatta \nColor: Magenta  \nShirt::\nEmbroidered Yarn Dyed Shirt 2.5 Meters \nSeparate Daman \u0026 Sleeve Border \nFabric: Yarn Dyed  \nDupatta::\nPrinted Chiffon Dupatta 2.5 Meters\nFabric: Chiffon  \nTrouser: :\nDyed Cambric Trouser 1.8 Meters  \nFabric:  Cambric  \nCare Instructions: \n\nDry Clean Only\"\" \n\n\n\"",
        "body_html": "",
        "price": "7990",
        "currency": "PKR",
        "options": [
            {
                "name": "Color",
                "position": 1,
                "values": [
                    "Magenta"
                ]
            },
            {
                "name": "Fabric",
                "position": 2,
                "values": [
                    "Yarn Dyed"
                ]
            }
        ],
        "tags": [
            "3 Piece Fabrics",
            "Embroidered",
            "Festive",
            "Festive Main",
            "Luxury",
            "New In",
            "show-quickview",
            "SS Festive 24",
            "Unstitched",
            "uploaded-17-may-24",
            "Woman"
        ],
        "available": true
    },
    {
        "product_id": "662483c7-e229-417e-85a1-2d14ff555d3c",
        "product_url": "https://pk.ethnc.com/products/hair-accessories-e0092-411-998-998",
        "shopify_id": "6807204036710",
        "handle": "hair-accessories-e0092-411-998-998",
        "title": "Hair Pins (E0092/411/998)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/products/E0092-411-998_1.jpg?v=1664793165",
        "description": "Details:Statement hair pins portrayed in scintillating hues with sea shell designs. These are a great addition to your accessories collection.-Multi Color",
        "body_html": "",
        "price": "550",
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "FREE"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "'998"
                ]
            }
        ],
        "tags": [
            "3 oct",
            "ACCESSORIES WS22-KIDS",
            "Accessories-Full Price",
            "hair pins",
            "jewellery",
            "kids accessories",
            "kids accessories'22",
            "kids accessories'23",
            "kids hair accessories",
            "KIDS JEWELLERY \u0026 HAIR ACCESSORIES'23",
            "Kids New In",
            "KIDS-F.P",
            "multi",
            "New-In Kids Accessories",
            "PARTSALEKIDSAccessories10MAY",
            "PARTSALEKIDSALL10MAY",
            "SALEKIDS23AUGFR",
            "SALEKIDSAccessories23AUG",
            "SALEKIDSALL23AUG",
            "SS23-KIDS",
            "SUMMERCLEARANCEKIDSAccessories",
            "SUMMERCLEARANCEKIDSALL",
            "SUMMERCLEARANCEWOMENAccessories",
            "WS22-KIDS"
        ],
        "available": true
    },
    {
        "product_id": "5e597f9e-0611-4f99-9519-7cbd6c9b3a61",
        "product_url": "https://pk.ethnc.com/products/casual-suit-e0467-402-314-314-casual-suit-e0467-302-314-314",
        "shopify_id": "6957390004326",
        "handle": "casual-suit-e0467-402-314-314-casual-suit-e0467-302-314-314",
        "title": "Embroidered Suit (E0467/402/314 E0467/302/314)",
        "vendor": "ethnic",
        "category": "",
        "image_url": "https://cdn.shopify.com/s/files/1/2290/7917/files/E0467-402-314_1.jpg?v=1706700772",
        "description": "Details:A gracefully elegant composition is layered over this classy ensemble rendered in an appealing blush coral shade. It depicts a classy silhouette shirt beautifully adorned with captivating floral embroidery in scintillating accents layered on a aesthetically appealing canvas. Paired with a contemporary shalwar, this exquisite outfit is a great option for happening events this festive season.-Blush Coral Color-Filament Fabric-Stitched Article-2 piece\nSize \u0026 Fit:-Model height is 45-46 Inches-Model is wearing 05-06 Year size.",
        "body_html": "",
        "price": "4890",
        "currency": "PKR",
        "options": [
            {
                "name": "SIZE",
                "position": 1,
                "values": [
                    "3-4Y",
                    "4-5Y",
                    "5-6Y",
                    "6-7Y",
                    "7-8Y",
                    "8-9Y",
                    "9-10Y",
                    "10-11Y",
                    "11-12Y"
                ]
            },
            {
                "name": "Color",
                "position": 2,
                "values": [
                    "Pink"
                ]
            }
        ],
        "tags": [
            "10-11Y",
            "11-12Y",
            "3-4Y",
            "4-5Y",
            "5-6Y",
            "6-7Y",
            "7-8Y",
            "8-9Y",
            "9-10Y",
            "Casual",
            "casual kids",
            "CASUAL KIDS FP23",
            "Casual kids New In",
            "casual kids'22",
            "casual kids'23",
            "casual kids'24",
            "casual suits kids",
            "Casual-Full Price",
            "CGST15",
            "E0467/402/314-1-shirt-SimplifiedSizechart",
            "E0467/402/314-2-trouser-SimplifiedSizechart",
            "eastern kids",
            "EASTERN KIDS'23",
            "EASTERN KIDS'24",
            "embroidered",
            "kids casual 5 feb",
            "Kids casual suit",
            "kids eastern'23",
            "kids eastern'24",
            "Kids New In",
            "KIDS-F.P",
            "MSSALEKIDSALL8MAY",
            "MSSALEKidsCasual8MAY",
            "MSSALEKIDSEASTERN8MAY",
            "New-In Casual Kids",
            "New-In Kids Casual",
            "PKR 2000 - PKR 3990",
            "PRET SS'24 Kids",
            "SS24-KIDS",
            "two piece casual kids",
            "two piece kids"
        ],
        "available": true
    }
]