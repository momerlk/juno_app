import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform} from 'react-native';
import {Link} from "expo-router"
import {View} from "react-native";
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <View>
      <LikedCard title="Saphora 3 Piece by Nishat Linen" price="PKR 13,999" url = "https://phantom-marca.unidadeditorial.es/1528a0e881fb52e19ba7f56964c4d06c/crop/57x0/755x465/resize/828/f/jpg/assets/multimedia/imagenes/2022/10/27/16668932575651.jpg"></LikedCard>
      
    </View>
  )
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  likedContainer: {
    display: 'flex', 
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: 'gray',
    marginHorizontal: 1500,
    padding: 15,
    borderStyle: 'solid',
    shadowColor: "#000",
    shadowOffset:{
	    width: 0,
	    height: 12,
    },
    shadowOpacity: 0.58,
    shadowRadius: 16.00,
    elevation: 24,


  },
  likedImageBrand:{
    fontFamily: "Montserrat",
    fontSize: 25,
    marginTop: 20,
    marginRight: 10,
    },
  likedImagePrice:{
    fontFamily: "Montserrat",
    fontSize: 20,
    color: 'gray',   
    marginTop: 15,
    marginRight: 150,
 
  },
  likedImage:{
    width: 360,
    height: 205,  
    borderRadius: 20,
    marginVertical: 50,
    justifyContent: 'center',
  }

});

function LikedCard(props : any){
  return <div style={styles.likedContainer}>
    <img src={props.url} style={styles.likedImage}/>
    <span style={styles.likedImageBrand}> {props.title} </span>
    <span style={styles.likedImagePrice} > {props.price} </span>
  </div>
}