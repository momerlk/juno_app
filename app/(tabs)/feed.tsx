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
        // 3 products ahead
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
          onConfirm={() => {
            this.props.onFilter();
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
              data={[
                {"label" : "Afrozeh", "value" : "afrozeh" , "base_url" : "https://www.afrozeh.com"},
                {"label" : "Ali Xeeshan", "value" : "ali_xeeshan" , "base_url" :  "https://alixeeshanempire.com"},
                {"label" : "Alkaram Studio", "value" : "alkaram_studio" , "base_url" :  "https://www.alkaramstudio.com"},
                {"label" : "Asim Jofa", "value" : "asim_jofa" , "base_url" :  "https://asimjofa.com"},
                {"label" : "Beechtree", "value" : "beechtree" , "base_url" :  "https://beechtree.pk"},
                {"label" : "Breakout" , "value" : "breakout" , "base_url" : "https://breakout.com.pk/"},

                {"label" : "Bonanza Satrangi", "value" : "bonanza_satrangi" , "base_url" :  "https://bonanzasatrangi.com"},
                {"label" : "Chinyere", "value" : "chinyere" , "base_url" :  "https://chinyere.pk"},
                {"label" : "Cross stitch", "value" : "cross_stitch" , "base_url" :  "https://www.crossstitch.pk"},
                {"label" : "Eden Robe", "value" : "edenrobe" , "base_url" :  "https://edenrobe.com"},
                {"label" : "Ethnic", "value" : "ethnic" , "base_url" :  "https://pk.ethnc.com"},
                {"label" : "Faiza Saqlain", "value" : "faiza_saqlain" , "base_url" :  "https://www.faizasaqlain.pk"},
                {"label" : "Generation", "value" : "generation" , "base_url" :  "https://generation.com.pk"},
                {"label" : "Hem Stich", "value" : "hem_stitch" , "base_url" :  "https://www.hemstitch.pk"},
                {"label" : "Hussain Rehar", "value" : "hussain_rehar" , "base_url" :  "https://www.hussainrehar.com"},
                {"label" : "Kanwal Malik", "value" : "kanwal_malik" , "base_url" :  "https://www.kanwalmalik.com"},
                {"label" : "Kayseria", "value" : "kayseria" , "base_url" :  "https://www.kayseria.com"},
                {"label" : "Limelight", "value" : "limelight" , "base_url" :  "https://www.limelight.pk"},
                {"label" : "Maria b", "value" : "maria_b" , "base_url" :  "https://www.mariab.pk"},
                {"label" : "Mushq", "value" : "mushq" , "base_url" :  "https://www.mushq.pk"},
                {"label" : "Nishat Linen", "value" : "nishat_linen" , "base_url" :  "https://nishatlinen.com"},
                {"label" : "Sadaf Fawad Khan", "value" : "sadaf_fawad_khan" , "base_url" :  "https://sadaffawadkhan.com"},
                {"label" : "Sapphire", "value" : "sapphire" , "base_url" :  "https://pk.sapphireonline.pk"},
                {"label" : "Zaha", "value" : "zaha" , "base_url" :  "https://www.zaha.pk"},
                {"label" : "Zara Shah Jahan", "value" : "zara_shah_jahan" , "base_url" :  "https://zarashahjahan.com"},
                {"label" : "Zellbury", "value" : "zellbury" , "base_url" :  "https://zellbury.com"},
                {"label" : "Outfitters", "value" : "outfitters" , "base_url" : "https://outfitters.com.pk/"},
              ]} 
              
              
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
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem('token');
    const wsfeed = new api.WSFeed(token!, (data : any) => {
      this.setState({ products: this.state.products.concat(data) });
    });
    this.setState({ WSFeed: wsfeed });
  }

  handleSwipe = async (action_type : string, index : number) => {
    console.log(`products.length = ${this.state.products.length} , index = ${index}`)
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
    try {
      await AsyncStorage.setItem('filter', JSON.stringify(data));
      this.setState({ products: [] });
      const { WSFeed } = this.state;
      WSFeed?.sendAction('open', '', api.createQuery(null, data));
      console.log('on filter called');
    } catch (e) {
      alert(`failed to set storage, error = ${e}`);
    }
  };

  render() {
    return (
      <>
        <SwipeView
          paddingTop={30}
          cards={this.state.products.length === 0 ? this.state.mock : this.state.products}
          height={(SCREEN_HEIGHT * 0.95) - tabBarHeight}
          onSwipe={this.handleSwipe}
          onFilter={this.handleFilter}
          loading={false}
        />
      </>
    );
  }
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