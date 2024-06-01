import React from 'react';
import { ScrollView, FlatList, View, Text, StyleSheet, Dimensions, Pressable, Image} from 'react-native';
import * as size from "react-native-size-matters"

const listData = [
  { id: '1', name: 'Junaid J.' , image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fFTjaww7Arz-VN4M4_CbQp8bP2vcxMZncg&s"},
  { id: '2', name: 'Item 2' , image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fFTjaww7Arz-VN4M4_CbQp8bP2vcxMZncg&s"},
  { id: '3', name: 'Item 3' , image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fFTjaww7Arz-VN4M4_CbQp8bP2vcxMZncg&s"},
  { id: '4', name: 'Item 4' , image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fFTjaww7Arz-VN4M4_CbQp8bP2vcxMZncg&s"},
  { id: '5', name: 'Item 5' , image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fFTjaww7Arz-VN4M4_CbQp8bP2vcxMZncg&s"},
  { id: '6', name: 'Item 6' , image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fFTjaww7Arz-VN4M4_CbQp8bP2vcxMZncg&s"},
  { id: '7', name: 'Item 7' , image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fFTjaww7Arz-VN4M4_CbQp8bP2vcxMZncg&s"},
  { id: '8', name: 'Item 8' , image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fFTjaww7Arz-VN4M4_CbQp8bP2vcxMZncg&s"},
  { id: '9', name: 'Item 9' , image : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7fFTjaww7Arz-VN4M4_CbQp8bP2vcxMZncg&s"},
];

function Brand(props : any){
    return (
        <Pressable style={{margin : 10, marginHorizontal : 20}}>
            <Image 
                source={{uri : props.image}}
                style={{height : size.verticalScale(65) , width : size.verticalScale(65),
                    borderRadius : 50,
                }}
            />
            <Text style={{textAlign : "center"}}>{props.name}</Text>
        </Pressable>
    )
}

const App = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      directionalLockEnabled={true}
      alwaysBounceVertical={false}
      contentContainerStyle={styles.scrollContainer}
    >
      <FlatList
        contentContainerStyle={styles.flatListContainer}
        numColumns={Math.ceil(listData.length / 2)}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Brand name={item.name} image={item.image}/>} 
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  flatListContainer: {
    alignSelf: 'flex-start',
  },
  item: {
    width: Dimensions.get('window').width / 4, // Adjust width to fit screen
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    backgroundColor: 'lightgray',
  },
});

export default App;
