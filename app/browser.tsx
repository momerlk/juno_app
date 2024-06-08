import {WebView} from "react-native-webview"
import React, {useState, useEffect} from "react"
import {View, ActivityIndicator, Text, Image, Pressable} from "react-native"
import {router, useLocalSearchParams} from "expo-router"

import {Ionicons} from "@expo/vector-icons"

export default function Browser(){
    
    const [uri , setUri] = useState<null | string>(null)
    const params = useLocalSearchParams();

    useEffect(function (){
        const params_uri = params.uri as string
        if (params_uri !== undefined || params_uri !== null){
            setUri(params_uri);
        }
    }, [uri])

    

    if(uri === null){
        return (
            <View>
                <Text style={{fontSize : 100}}>Loading</Text>
            </View>
        )
    } else {
        return (
            <View style={{flex : 1, backgroundColor : "#121212"}}>
                <Pressable onPress={() => router.back()} style={{
                    position : "absolute",
                    left : 30,
                    top : 50,
                    }}>
                    <Ionicons name="arrow-back" size={35} color="white"/>
                </Pressable>
                <Image source={require("./(tabs)/juno_icon.png")} 
                    style={{
                        height : 100, 
                        width : 100,
                        resizeMode : "cover", 
                        alignSelf : "center", 
                        justifyContent :"center",
                        marginTop : 10
                    }} 
                />
                <WebView source={{uri : uri}} />
            </View>
        )
    }
}