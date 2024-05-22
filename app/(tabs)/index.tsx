import React from 'react';
import { Button, StyleSheet, Text, View, StyleProp, ViewStyle, ImageBackground} from 'react-native';
import Swiper, { SwiperProps } from 'react-native-deck-swiper';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';



const fetchFonts = () => {
  return Font.loadAsync({
    'Poppins': require('./Poppins-Medium.ttf'),
    "Montserrat" : require("./Montserrat.ttf"),
  });
};

interface CardData {
  id: string;
  title: string;
  company : string;
  price : string;
  image : string;
  url : string;
}

interface State {
  cards: CardData[];
  swipedAllCards: boolean;
  swipeDirection: string;
  cardIndex: number;
}

const data = require("./data.json")

export default class HomeScreen extends React.Component<{}, State> {
  swiper: Swiper<CardData> | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      cards: data,
      swipedAllCards: false,
      swipeDirection: '',
      cardIndex: 0
    };
    fetchFonts();
  }

  override async componentDidMount(){
    try {
    const value = await AsyncStorage.getItem("authenticated");
    if (value === null || value === "false"){
      router.navigate("/welcome")
    }}
    catch (e){
      alert(`error = ${e}`)
    }
  }

  renderCard = (cardData: CardData, index: number) => {
    return (
      <View style={styles.card}>
    <ImageBackground source={{uri : cardData.image}} resizeMode="cover" style={styles.image}>
      <View style={styles.text}>

        <View style={{display : "flex" , flexDirection : "row" , justifyContent : "space-between"}}>
        <h2>{cardData.company}</h2>
        <h3 >{cardData.price}</h3>
        </View>

        <h4>{cardData.title}</h4>
        
      </View>
    </ImageBackground>
  </View>

    );
  };

  onSwiped = (type: string) => {
    console.log(`on swiped ${type}`);
  };

  onSwipedAllCards = () => {
    this.setState({
      swipedAllCards: true
    });
  };

  swipeLeft = () => {
    if (this.swiper) {
      this.swiper.swipeLeft();
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Swiper
          ref={(swiper) => {
            this.swiper = swiper;
          }}
          onSwiped={(cardIndex) => this.onSwiped('general')}
          onSwipedLeft={(cardIndex) => this.onSwiped('left')}
          onSwipedRight={(cardIndex) => this.onSwiped('right')}
          onSwipedTop={(cardIndex) => this.onSwiped('top')}
          onSwipedBottom={(cardIndex) => this.onSwiped('bottom')}
          onTapCard={(cardIndex) => this.swipeLeft()}
          cards={this.state.cards}
          cardIndex={this.state.cardIndex}
          cardVerticalMargin={80}
          renderCard={this.renderCard}
          onSwipedAll={this.onSwipedAllCards}
          stackSize={3}
          disableBottomSwipe={true}
          stackSeparation={15}
          overlayLabels={{
            left: {
              title: 'DISLIKE',
              style: styles.overlayLabel
            },
            right: {
              title: 'LIKE',
              style: styles.overlayLabel
            },
            top: {
              title: 'ADD TO CART',
              style: styles.overlayLabel
            }
          }}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
        >
        </Swiper>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor : "#87CEEB",
    fontFamily : "Poppins",
  },
  card : {
    flex : 1,
  },
  image: {
    flex: 1,
    justifyContent: "flex-end",
  },
  price : {
    alignSelf : "flex-end",
  },
  text: {
    color: 'white',
    lineHeight : 5,
    textAlign : "left",
    fontWeight: 'bold',
    padding : 20,
    backgroundColor: '#000000c0',
  },
  overlayLabel: {
    label: {
      backgroundColor: 'black',
      borderColor: 'black',
      color: 'white',
      borderWidth: 1
    },
    wrapper: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }
});
