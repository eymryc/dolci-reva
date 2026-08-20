import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Mail, Phone, ShieldCheck, Pencil, Wallet, ChevronRight } from 'lucide-react-native';
import { Text } from '@/presentation/components/ui/Text';
import { Button } from '@/presentation/components/ui/Button';
import { Badge } from '@/presentation/components/ui/Badge';
import { useAuthStore } from '@/store/auth.store';
import { colors } from '@/core/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/sign-in');
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 px-6 pt-4">
        <Text className="mb-6 font-rajdhani-bold text-2xl text-theme-secondary">Mon profil</Text>

        <View className="mb-6 items-center gap-3">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-theme-primary">
            <Text className="font-rajdhani-bold text-2xl text-white">
              {user.first_name.charAt(0)}
              {user.last_name.charAt(0)}
            </Text>
          </View>
          <Text className="font-rajdhani-bold text-xl text-theme-secondary">
            {user.first_name} {user.last_name}
          </Text>
          <Badge variant="secondary">{user.type === 'OWNER' ? 'Propriétaire' : 'Client'}</Badge>
        </View>

        <View className="gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <View className="flex-row items-center gap-3">
            <Mail size={18} color={colors.gray[500]} />
            <Text className="text-sm text-gray-700">{user.email}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Phone size={18} color={colors.gray[500]} />
            <Text className="text-sm text-gray-700">{user.phone}</Text>
          </View>
          {user.type === 'OWNER' && (
            <View className="flex-row items-center gap-3">
              <ShieldCheck size={18} color={colors.gray[500]} />
              <Text className="text-sm text-gray-700">
                Statut de vérification : {user.verification_status ?? 'Non soumis'}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-4 gap-2">
          <Pressable
            onPress={() => router.push('/(tabs)/profile/edit')}
            className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5"
          >
            <View className="flex-row items-center gap-3">
              <Pencil size={18} color={colors.gray[500]} />
              <Text className="text-sm text-theme-secondary">Modifier mon profil</Text>
            </View>
            <ChevronRight size={18} color={colors.gray[400]} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/(tabs)/profile/wallet')}
            className="flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3.5"
          >
            <View className="flex-row items-center gap-3">
              <Wallet size={18} color={colors.gray[500]} />
              <Text className="text-sm text-theme-secondary">Mon wallet</Text>
            </View>
            <ChevronRight size={18} color={colors.gray[400]} />
          </Pressable>
        </View>

        <Button variant="outline" className="mt-4" onPress={handleLogout}>
          <View className="flex-row items-center gap-2">
            <LogOut size={18} color={colors.error} />
            <Text className="font-rajdhani-semibold text-sm text-theme-error">Se déconnecter</Text>
          </View>
        </Button>
      </View>
    </SafeAreaView>
  );
}
