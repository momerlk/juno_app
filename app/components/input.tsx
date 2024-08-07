import React, {useState} from 'react';
import { 
    View, 
    TextInput, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    Pressable,
    Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather, EvilIcons } from '@expo/vector-icons';
import { DropDown } from './_common';

interface PrimaryInputProps {
    label : string;
    placeholder? : string;
    keyboardType? : any;
    multiline? : boolean;
    numberOfLines? : number;
    error? : boolean;
    onChangeText? : (text : string) => void;
}

export const PrimaryInput = (props : PrimaryInputProps) => {
    const [value , setValue] = useState("")

    return (
        <View style={styles.container}>
            <Text style={[styles.label, props.error && {color : "#f01e2c"}]}>{props.label}</Text>
            <View style={[styles.inputContainer , props.error && {borderColor : "#f01e2c"}]}>
                
                <TextInput
                style={[styles.input , props.multiline && {textAlignVertical : "top"}]}
                placeholder={props.placeholder}
                placeholderTextColor={props.error ? "#f94449" : "#888888"}
                value={value}
                onChangeText={text => {
                    setValue(text)
                    if (props.onChangeText !== null && props.onChangeText !== undefined){
                        props.onChangeText(text)
                    }
                }}
                multiline={props.multiline}
                numberOfLines={props.numberOfLines}
                keyboardType={props.keyboardType}
                />

                {value.length > 1 && props.multiline === false ?

                <TouchableOpacity style={styles.iconRight} onPress={() => setValue("")}>
                    <EvilIcons name="close" size={24} color="#999999" />
                </TouchableOpacity>

                : <></>}

            </View>
        </View>
    );
};


export const PasswordInput = (props : PrimaryInputProps) => {
    const [value , setValue] = useState("")
    const [isPasswordShown, setIsPasswordShown] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, props.error && {color : "#f01e2c"}]}>{props.label}</Text>
            <View style={[styles.inputContainer , props.error && {borderColor : "#f01e2c"}]}>
                
                <TextInput
                style={[styles.input , props.multiline && {textAlignVertical : "top"}]}
                placeholder={props.placeholder}
                placeholderTextColor={props.error ? "#f01e2c" : "#888888"}
                value={value}
                onChangeText={text => {
                    setValue(text)
                    if (props.onChangeText !== null && props.onChangeText !== undefined){
                        props.onChangeText(text)
                    }
                }}
                multiline={props.multiline}
                secureTextEntry={!isPasswordShown}
                numberOfLines={props.numberOfLines}
                keyboardType={props.keyboardType}
                />

                <TouchableOpacity
                    onPress={() => setIsPasswordShown(!isPasswordShown)}
                    style={{
                    position: "absolute",
                    right: 12
                    }}
                >
                    {isPasswordShown ? (
                    <Ionicons name="eye-off" size={24} color={"white"} />
                    ) : (
                    <Ionicons name="eye" size={24} color={"white"} />
                    )}
                </TouchableOpacity>

            </View>
        </View>
    );
};




function PaginationButton(props : {
    label : string;
    onPress : any;
}){
    return (
        <TouchableOpacity style={{borderRadius : 50, backgroundColor : "#666666", width : 35, height : 35,justifyContent : "center" , alignItems : "center", marginRight : 5,}} onPress={props.onPress}>
            <Text style={{fontFamily : "Inter_400Regular" , color: "white"}}>{props.label}</Text>
        </TouchableOpacity> 
    )
}

export const ImageInput = (props : {label : string, placeholder : string, onSubmit : Function}) => {
    const [images, setImages] = useState<string[] | null>(null);
    const [image, setImage] = useState<string | null>(null)

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            aspect: [9, 16],
            allowsMultipleSelection : true,
            selectionLimit : 6,
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            const uris = []
            for (let i = 0;i < result.assets.length;i++){
                uris.push(result.assets[i].uri)
            }
            setImages(uris)
            setImage(uris[0])
            props.onSubmit(uris)
        }
    };

    return (
        <Pressable style={styles.container} onPress={pickImage}>
            <View style={styles.imageDisplayContainer}>
                {image && <Image source={{ uri: image }} style={styles.image} />}
            </View>
            
            {images && 
            <View style={styles.pagination}>
                {images.map((value , index) => <PaginationButton label={`${index+1}`} onPress={() => setImage(value)}/>)}
            </View>
            }

            {images === null &&
            <>
            <Text style={styles.label}>{props.label}</Text>
            <View style={styles.imageContainer}>
                <Feather name="upload" size={35} color="white" style={{marginBottom : 10}}/>
                <Text style={styles.imageLabel}>{props.placeholder}</Text>
            </View>
            </>
            }
        </Pressable>
    );
};

interface SelectItem {
    label : any;
    value : any;
}
interface SelectInputProps {
    label? : string;
    placeholder : string;
    multiple? : boolean;
    onChange : Function;

    data : SelectItem[];
}
export function SelectInput(props : SelectInputProps){
    return (
        <View>
            <Text style={styles.selectLabel}>{props.label}</Text>
            <DropDown
              data={props.data} 
              title={props.placeholder}
              onChange={props.onChange}
              selected={null}
              multiple={props.multiple}
              range={{min : [], max : []}}
              onPress={() => {}}
              containerStyle={styles.selectContainer}
              buttonStyle={styles.selectButton}
              textStyle={styles.selectText}
            />
          </View>
    )
}


const styles = StyleSheet.create({
    selectLabel : {
        fontSize: 16,
        fontWeight: '400',
        fontFamily : "Inter_500Medium",
        marginVertical: 8,
        marginHorizontal : 5,
        color : "#E0E0E0",
    },
    selectContainer : {
        width : "100%",
        marginHorizontal : 0,
        backgroundColor: '#222222',
        borderColor: '#444444',
        borderWidth: 1,
        borderRadius : 9,
    },
    selectButton : {
        width : "100%",
        backgroundColor : "#222222",
        marginHorizontal : 0,
        height : 51,
    },
    selectText : {
        color : "#CCCCCC",
        marginTop : 4,
        marginLeft : 6,  
        fontSize: 15,
        fontFamily : "Inter_500Medium",
    },
    container: {
        marginVertical : 10,
    },

    pagination : {
        display : "flex",
        flexDirection : "row",
        padding : 10,
        borderRadius : 30,
        width : 260,
        height : 55,
        alignSelf : "center",
        backgroundColor: '#222222',
        marginTop : 20,
    },

    label: {
        color: '#E0E0E0',
        fontFamily : "Inter_500Medium",
        marginBottom: 7,
        marginLeft : 5, 
        fontSize: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222222',
        borderColor: '#444444',
        borderWidth: 1,
        borderRadius: 9,
        padding: 10,
    },
    
    input: {
        flex: 1,
        color: '#ffffff',
        fontSize: 15,
        fontFamily : "Inter_500Medium",
    },
    

    imageDisplayContainer : {
        justifyContent : "center",
        alignItems : "center",
        flex : 1,
    },
    image : {
        borderRadius : 15,
        width : 215,
        height : 400,
    },
    imageLabel : {
        color: '#E0E0E0',
        fontFamily : "Inter_400Regular",
        marginBottom: 7,
        marginLeft : 5, 
        fontSize: 17,
        textAlign : "center",
    },
    imageContainer: {
        flexDirection: 'column',
        justifyContent : "center",
        alignItems: 'center',
        backgroundColor: '#222222',
        borderColor: 'white',
        borderWidth: 2,
        borderStyle : "dashed",
        borderRadius: 9,
        paddingHorizontal : 30,
        padding: 10,
        height : 200,
    },


    iconLeft : {
        marginRight : 12,
    },
    iconRight: {
        marginLeft: 10,
    },


    options: {
        marginTop: 20,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    optionColor: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 10,
    },
    optionText: {
        color: '#ffffff',
        fontSize: 16,
    },
});