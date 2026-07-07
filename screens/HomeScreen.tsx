import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/src/theme';
import Header from '@/components/ui/Header';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import SellersSection from '@/components/home/SellersSection';
import EventsSection from '@/components/home/EventsSection';
import { useConnectivityStore } from '@/src/store/connectivityStore';

export default function HomeScreen() {
  const { colors, spacing, fonts } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const isOnline = useConnectivityStore((s) => s.isOnline);

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bgPage }}
    >
      <Header onMenuPress={() => setMenuOpen(true)} />

      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: colors.errorBg, borderColor: colors.errorText }]}>
          <MaterialIcons name="wifi-off" size={16} color={colors.errorText} />
          <Text style={[styles.offlineText, { color: colors.errorText, fontFamily: fonts.sanBold }]}>
            Sin conexión — algunas funciones no están disponibles
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing[6] }}
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner />
        <CategoriesSection />
        <SellersSection />
        <EventsSection />
      </ScrollView>
      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  offlineText: {
    fontSize: 13,
    flex: 1,
  },
});
