import {WebView} from "react-native-webview"
import React, {useState, useEffect} from "react"
import {View, ActivityIndicator, Text, Image, Pressable} from "react-native"
import {router, useLocalSearchParams} from "expo-router"

import { Back } from "./_common"

import {Ionicons} from "@expo/vector-icons"

export default function Browser(){
    
    const [uri , setUri] = useState<null | string>(null)
    const [loading , setLoading] = useState(true)
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
                
                <Back text="Go Back"/>
                <WebView 
                    source={{uri : uri}} 
                    startInLoadingState={true}
                    renderLoading={() => <ActivityIndicator size={60} style={{
                        position: 'absolute',
                        left: '40%',
                        top: '40%',
                    }}/>}
                    forceDarkOn={true}
                />
            </View>
        )
    }
}