import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/presentation/components/ui/Text';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { RestaurantCard } from '@/presentation/components/establishments/RestaurantCard';
import { usePublicRestaurants } from '@/presentation/hooks/useRestaurants';

export default function RestaurantsListScreen() {
  const { data: restaurants, isLoading, isRefetching, refetch } = usePublicRestaurants();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 pb-2 pt-4">
        <Text className="font-rajdhani-bold text-2xl text-theme-secondary">Restaurants</Text>
      </View>

      {isLoading ? (
        <View className="gap-4 px-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </View>
      ) : (
        <FlatList
          data={restaurants ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-6 pb-8"
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => <RestaurantCard restaurant={item} />}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-gray-500">
              Aucun restaurant disponible pour le moment.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
