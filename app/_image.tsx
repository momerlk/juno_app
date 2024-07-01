import React from 'react';
import { View, StyleSheet, Dimensions, ImageSourcePropType } from 'react-native';
import { PinchGestureHandler, State, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, useAnimatedGestureHandler } from 'react-native-reanimated';
import Carousel from 'react-native-snap-carousel';

const { width: screenWidth } = Dimensions.get('window');

// PinchableImage component
const PinchableImage: React.FC<{ source: ImageSourcePropType }> = ({ source }) => {
  const scale = useSharedValue(1);

  const onPinchEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive: (event) => {
      scale.value = event.scale;
    },
    onEnd: () => {
      scale.value = withTiming(1, { duration: 300 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <PinchGestureHandler onGestureEvent={onPinchEvent}>
      <Animated.View style={{ flex: 1 }}>
        <Animated.Image
          source={source}
          style={[styles.image, animatedStyle]}
          resizeMode="contain"
        />
      </Animated.View>
    </PinchGestureHandler>
  );
};

// PinchableImageCarousel component
const PinchableImageCarousel: React.FC<{ images: string[] }> = ({ images }) => {
  const renderItem = ({ item }: { item: string }) => {
    return (
      <View style={styles.slide}>
        <PinchableImage source={{ uri: item }} />
      </View>
    );
  };

  return (
    <Carousel
      data={images}
      renderItem={renderItem}
      sliderWidth={screenWidth}
      itemWidth={screenWidth}
      layout={'default'}
    />
  );
};

// App component
const App: React.FC = () => {
  const images = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ];

  return (
    <View style={styles.container}>
      <PinchableImageCarousel images={images} />
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default App;
