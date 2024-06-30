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
                <Pressable onPress={() => router.back()} style={{display : "flex" , flexDirection : "row", marginVertical : 8}}>
                        <View  style={{
                            left : 10,
                            top : 10,
                            marginBottom : 10,
                            }}>
                            <Ionicons name="arrow-back" size={32} color="white"/>
                        </View>
                        <Text style={{
                        color : "white", 
                        fontFamily : "Poppins", 
                        fontSize : 22 , 
                        marginLeft : 20,
                        marginTop : 10,
                        }}>
                            Go Back
                        </Text>
                </Pressable>
                <WebView source={{uri : uri}} />
            </View>
        )
    }
}