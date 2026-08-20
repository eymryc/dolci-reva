import * as SecureStore from 'expo-secure-store';

/**
 * Stockage chiffré (Keychain iOS / Keystore Android) pour tout ce qui est
 * sensible : jamais AsyncStorage pour un token, lisible en clair en cas
 * d'extraction de backup ou de root/jailbreak.
 */
const ACCESS_TOKEN_KEY = 'dolci_reva_access_token';

export const secureStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  },

  async clearAccessToken(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  },
};
