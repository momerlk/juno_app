import { router } from "expo-router";
import React , {useState , useEffect} from "react"
import {Text , Image , Pressable , 
  View, ActivityIndicator, TouchableOpacity,
  ScrollView,Modal,Platform,Dimensions,
  FlatList,
  StyleSheet
} from "react-native"
import {Ionicons, AntDesign} from "@expo/vector-icons"

import { tabBarHeight } from "./_layout";
import * as size from "react-native-size-matters"

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

import { Image as FastImage } from "expo-image"

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


export class FastImageBackground extends React.Component<any , any> {
  render() {
    const { children , style = {}, imageStyle, ...props } = this.props

    return (
      <View style={style}>
        <FastImage
          {...props}
          style={[
            StyleSheet.absoluteFill,
            {
              width: style.width,
              height: style.height,
            },
            imageStyle,
          ]}
          placeholder={{ blurhash }}
        />
        {children}
      </View>
    )
  }
}


export function Logo(){
  const topMargin = 42;
    return (
    <>
        <Image  source={require("../assets/juno_text.png")} style={{
          position : "absolute",
          marginTop : topMargin,
          left : 20,
          height : 60, 
          width : 100, 
          resizeMode : "cover", 
          alignSelf : "center", 
        }} 
          />

      

    </>
    )
}

interface BackProps {
  text : string;
}
export function Back(props : BackProps ){
  return (
    <>
    <Pressable onPress={() => router.back()} style={{
      display : "flex" , flexDirection : "row", marginBottom : 7, marginTop : 20 , paddingTop : 20
      }}>
      <View  
        style={{
          left : 10,
          top : 10,
          marginBottom : 10,
          }} >
          <Ionicons name="arrow-back" size={32} color="white"/>
      </View>
      <Text 
        style={{
          color : "white", 
          fontFamily : "Poppins", 
          fontSize : 22 , 
          marginLeft : 20,
          marginTop : 10,
        }} >
          {props.text}
      </Text>
    </Pressable>
    </>
  )
}

export function Loading(){
  return (
    <View style={{flex : 1,backgroundColor : "black", paddingTop : 40, paddingLeft : 20}}>
            
            <ActivityIndicator style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: [{ translateX: -50 }, { translateY: -50 }],
            }} size={60} color="white"/>
        </View>
  )
}

export function toTitle(str : string) : string {
  if (str === undefined){
    return ""
  }
  str = str.replaceAll("'" , "")
  str = str.replaceAll("_" , " ");
  str = str.toLowerCase()
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

export function shortTitle(str : string) : string {
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
  let res = three_words.join(" ") + " ..." 
  if (res.length > 19){
    res = res.substring(0,18) + " ...";
  }
  return res
}

export function fmtPrice(priceN : number){
  const price = priceN.toString();
  let l = price.length;
  let pos = (l) - 3;
  if (pos > 0) {
    const firstPart = price.slice(0, pos);
    const secondPart = price.slice(pos);

    // Concatenate the first part, substring, and second part
    const newString = firstPart + "," + secondPart;
    return newString;
  } else {
    return price
  }
}

export function PrimaryButton(props : any){
  return (
    <TouchableOpacity
        {...props}
        style={[
          {
            paddingVertical: 10,
            paddingHorizontal : 14,
            marginTop : 20,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex : 0,
          },
          { backgroundColor: "white" },
          props.style,
        ]}
        
      >
        <Text style={{ fontSize: 18, color: "black", fontFamily : "Poppins" }}>{props.text}</Text>
        {props.children}
      </TouchableOpacity>
  )
}

export function SecondaryButton(props : any){
  return (
    <TouchableOpacity
        {...props}
        style={[
          {
            paddingVertical: 10,
            paddingHorizontal : size.scale(40),
            marginTop : 20,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex : 0,

            borderColor : "white",
            borderWidth : 2,
          },
          { backgroundColor: "black" },
          props.style,
        ]}
        
      >
        <Text style={{ fontSize: 18, color: "white", fontFamily : "Poppins" }}>{props.text}</Text>
        {props.children}
      </TouchableOpacity>
  )
}

interface DropDownProps {
  data: { label: string; value: any }[];
  type?: 'range' | "standard" | string;
  range?: any;
  onChange: Function;
  onPress : Function | undefined;
  buttonStyle?: object;
  textStyle?: object;
  title: string;
  multiple?: boolean;
}

export const DropDown: React.FC<DropDownProps> = ({ data, type, range, onChange, buttonStyle, textStyle, title, multiple = false }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<any[]>([]);
  const [items, setItems] = useState(data);
  const [lower, setLower] = useState("");
  const [upper, setUpper] = useState("");

  const SCREEN_HEIGHT = Platform.OS === "ios" || Platform.OS === "android" ? 800 : 600; // Mock screen height
  const tabBarHeight = 50; // Mock tab bar height

  const marginTop = SCREEN_HEIGHT * 0.22;
  const marginBottom = (SCREEN_HEIGHT * 0.22) + tabBarHeight;

  const handleSelect = (itemValue: any, isSelected: boolean, isMin: boolean) => {
    if (isSelected) {
      if (isMin) {
        setLower("");
        setValue([upper]);
        onChange("", upper);
      } else {
        setUpper("");
        setValue([lower]);
        onChange(lower, "");
      }
    } else {
      if (isMin) {
        setLower(itemValue);
        setValue([itemValue, upper]);
        onChange(itemValue, upper);
      } else {
        setUpper(itemValue);
        setValue([lower, itemValue]);
        onChange(lower, itemValue);
      }
    }
  };

  const handleSelectSingle = (itemValue: any) => {
    setValue([itemValue]);
    onChange([itemValue]);
  };

  const renderRangeItem = ({ item }: { item: { label: string; value: any } }, isMin: boolean) => {
    const isSelected = (isMin ? lower : upper) === item.value;
    return (
      <TouchableOpacity
        key={item.value}
        style={{
          backgroundColor: "#222222",
          paddingVertical: 10,
          paddingHorizontal: 8,
          borderRadius: 5,
          marginVertical: 3,
          zIndex: 6000,
        }}
        onPress={() => handleSelect(item.value, isSelected, isMin)}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 17, color: "white", fontFamily: "Poppins" }}>
            {item.label}
          </Text>
          {isSelected && <AntDesign name="check" size={20} color="white" style={{ marginTop: 3 }} />}
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: { label: string; value: any } }) => {
    const isSelected = value.includes(item.value);
    return (
      <TouchableOpacity
        key={item.value}
        style={{
          backgroundColor: "#222222",
          paddingVertical: 10,
          paddingHorizontal: 8,
          borderRadius: 5,
          marginVertical: 5,
          zIndex: 6000,
        }}
        onPress={() => {
          if (multiple) {
            const newValue = isSelected ? value.filter(v => v !== item.value) : [...value, item.value];
            setValue(newValue);
            onChange(newValue);
          } else {
            handleSelectSingle(item.value);
            setOpen(false);
          }
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 17, color: "white", fontFamily: "Poppins" }}>
            {item.label}
          </Text>
          {isSelected && <AntDesign name="check" size={20} color="white" style={{ marginTop: 3 }} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginHorizontal: size.scale(20), marginBottom: 16 }}>
      <Modal
        animationType="none"
        transparent={true}
        visible={open}
        onRequestClose={() => setOpen(!open)}
      >
        <View style={{
          zIndex: open ? 4000 : 1,
          backgroundColor: "#121212",
          flex: 1,
          marginTop: marginTop,
          marginBottom: marginBottom,
          marginHorizontal: size.scale(35),
          paddingHorizontal: 20,
          borderRadius: 8,
          paddingVertical: 30,
        }}>
          {type === "range" ? (
            <>
              <Text style={{ marginVertical: 0, fontSize: 17, fontFamily: "Poppins", color: "white", textAlign: "center" }}>
                Min
              </Text>
              <FlatList
                data={range?.min}
                renderItem={(item) => renderRangeItem(item, true)}
                keyExtractor={(item) => item.value.toString()}
              />
              <Text style={{ marginVertical: 5, fontSize: 17, fontFamily: "Poppins", color: "white", textAlign: "center" }}>
                Max
              </Text>
              <FlatList
                data={range?.max}
                renderItem={(item) => renderRangeItem(item, false)}
                keyExtractor={(item) => item.value.toString()}
              />
            </>
          ) : (
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.value.toString()}
            />
          )}
          <PrimaryButton
            text="Confirm"
            onPress={() => {
              setOpen(false);
              if (type === "range") {
                onChange(lower, upper);
              }
            }}
            style={{ paddingVertical: 5, fontSize: 5 }}
          />
        </View>
      </Modal>

      <TouchableOpacity
        style={[{
          backgroundColor: "white",
          width: size.scale(250),
          paddingHorizontal: 10,
          paddingVertical: size.verticalScale(10),
          borderRadius: 10,
        }, buttonStyle]}
        onPress={() => setOpen(true)}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{
            height: 22,
            width: 22,
            borderRadius: 50,
            marginTop: 3,
            marginRight: 7,
            backgroundColor: "black"
          }}>
            {value.length !== 0 && <AntDesign name="check" size={14} color="white" style={{ margin: 4 }} />}
          </View>
          <Text style={[{ fontFamily: "Poppins", fontSize: 18 }, textStyle]}>{title}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};