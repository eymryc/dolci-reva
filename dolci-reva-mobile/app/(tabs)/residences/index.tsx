import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/presentation/components/ui/Text';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { ResidenceCard } from '@/presentation/components/establishments/ResidenceCard';
import { usePublicResidences } from '@/presentation/hooks/useResidences';

export default function ResidencesListScreen() {
  const { data: residences, isLoading, isRefetching, refetch } = usePublicResidences();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="px-6 pb-2 pt-4">
        <Text className="font-rajdhani-bold text-2xl text-theme-secondary">Résidences</Text>
      </View>

      {isLoading ? (
        <View className="gap-4 px-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </View>
      ) : (
        <FlatList
          data={residences ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerClassName="px-6 pb-8"
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => <ResidenceCard residence={item} />}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-gray-500">
              Aucune résidence disponible pour le moment.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
