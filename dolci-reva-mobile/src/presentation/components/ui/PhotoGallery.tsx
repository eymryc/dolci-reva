import { useState } from 'react';
import { View, ScrollView, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from 'react-native';
import { Image } from 'expo-image';
import { cn } from '@/core/lib/cn';

interface PhotoGalleryProps {
  images: string[];
  height?: number;
}

/**
 * Galerie photo swipeable simple (ScrollView paginé + indicateurs), sans
 * dépendance tierce supplémentaire — volontaire pour ne pas ajouter de
 * risque de compatibilité de version (cf. CLAUDE.md §1).
 */
export function PhotoGallery({ images, height = 288 }: PhotoGalleryProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  const displayImages = images.length > 0 ? images : [undefined];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <View style={{ height }} className="w-full bg-gray-100">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {displayImages.map((uri, index) => (
          <Image
            key={uri ?? index}
            source={uri ? { uri } : undefined}
            style={{ width, height }}
            contentFit="cover"
            transition={150}
          />
        ))}
      </ScrollView>

      {displayImages.length > 1 && (
        <View className="absolute bottom-3 w-full flex-row justify-center gap-1.5">
          {displayImages.map((_, index) => (
            <View
              key={index}
              className={cn(
                'h-1.5 rounded-full bg-white/60',
                index === activeIndex ? 'w-4 bg-white' : 'w-1.5'
              )}
            />
          ))}
        </View>
      )}
    </View>
  );
}
