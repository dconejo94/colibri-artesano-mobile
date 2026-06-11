import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/src/theme';
import Header from '@/components/ui/Header';
import HamburgerMenu from '@/components/ui/HamburgerMenu';
import HeroBanner from '@/components/home/HeroBanner';
import CategoriesSection from '@/components/home/CategoriesSection';
import SellersSection from '@/components/home/SellersSection';
import EventsSection from '@/components/home/EventsSection';

export default function HomeScreen() {
  const { colors, spacing } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.bgPage }}
    >
      <Header onMenuPress={() => setMenuOpen(true)} />
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
