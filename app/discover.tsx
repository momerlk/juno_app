import React from 'react';
import { ScrollView, FlatList, View, Text, StyleSheet, Dimensions } from 'react-native';

const listData = [
  { id: '1', text: 'Item 1' },
  { id: '2', text: 'Item 2' },
  { id: '3', text: 'Item 3' },
  { id: '4', text: 'Item 4' },
  { id: '5', text: 'Item 5' },
  { id: '6', text: 'Item 6' },
  { id: '7', text: 'Item 7' },
  { id: '8', text: 'Item 8' },
  { id: '9', text: 'Item 9' },
  { id: '10', text: 'Item 10' },
];

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
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.text}</Text>
          </View>
        )}
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
