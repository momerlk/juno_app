import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PinchableImageProps {
  source: { uri: string };
}

const PinchableImage: React.FC<PinchableImageProps> = ({ source }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePinch = Animated.event(
    [
      {
        nativeEvent: { scale: scale },
      },
    ],
    { useNativeDriver: true }
  );

  return (
    <Animated.View style={[styles.imageContainer]}>
      <Animated.Image
        source={source}
        
        style={[styles.image, { transform: [{ scale: scale }]}]}
        resizeMode="cover"
      />
    </Animated.View>
  );
};

interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(newIndex);
  };

  return (
    <View style={styles.carouselContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <PinchableImage source={{ uri }} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index ? styles.activeDot : {},
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
  },
  carouselContainer: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical : 10,
  },
  imageWrapper: {
    width: screenWidth,
    height: screenHeight * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    width: screenWidth,
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    width: screenWidth + 20,
    height: '100%',
  },
  pagination: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'gray',
    margin: 5,
    padding : 4,
  },
  activeDot: {
    backgroundColor: 'white',
  },
});

const App = (props: { images: string[] }) => {
  return (
    <View style={styles.container}>
      <ImageCarousel images={props.images} />
    </View>
  );
};

export default App;
