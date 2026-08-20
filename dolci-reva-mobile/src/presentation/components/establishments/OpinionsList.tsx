import { View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { usePublicOpinions } from '@/presentation/hooks/useOpinions';
import { colors } from '@/core/theme/colors';

export function OpinionsList({ residenceId }: { residenceId: number }) {
  const { data: opinions, isLoading } = usePublicOpinions(residenceId);

  if (isLoading) {
    return (
      <View className="gap-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </View>
    );
  }

  if (!opinions || opinions.length === 0) {
    return null;
  }

  return (
    <View className="gap-3">
      <Text className="font-rajdhani-semibold text-base text-theme-secondary">
        Avis ({opinions.length})
      </Text>
      {opinions.map((opinion) => (
        <View key={opinion.id} className="gap-1 rounded-xl border border-gray-100 bg-gray-50 p-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-rajdhani-semibold text-sm text-theme-secondary">
              {opinion.user ? `${opinion.user.first_name} ${opinion.user.last_name}` : 'Client'}
            </Text>
            <View className="flex-row items-center gap-1">
              <Star size={13} color={colors.warning} fill={colors.warning} />
              <Text className="text-xs text-gray-600">{opinion.note}/5</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600">{opinion.comment}</Text>
        </View>
      ))}
    </View>
  );
}
