import { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, FlatList, Keyboard } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSearch } from '@/src/hooks/useSearch';
import { SearchScope } from '@/api/search';
import { useTheme, fonts } from '@/src/theme';
import { s, vs, ms } from '@/utils/scale';

type SearchBarProps = {
  scope?: SearchScope;
  locked?: boolean;
};

const SCOPES: { id: SearchScope; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'products', label: 'Productos' },
  { id: 'stores', label: 'Emprendedores' },
];

export default function SearchBar({ scope = 'all', locked = false }: SearchBarProps) {
  const { colors, radii, text, shadows } = useTheme();
  const router = useRouter();
  
  const {
    query,
    setQuery,
    scope: currentScope,
    setScope,
    suggestions,
  } = useSearch(scope);

  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    Keyboard.dismiss();
    setIsFocused(false);
    if (query.length >= 2) {
      router.push({ pathname: '/buscar', params: { q: query, scope: currentScope } });
    }
  };

  const handleSelectSuggestion = (item: any, typeScope: SearchScope) => {
    Keyboard.dismiss();
    setIsFocused(false);
    
    if (typeScope === 'products') {
      setQuery(item.name);
      router.push(`/producto/${item.id}` as any);
    } else if (typeScope === 'stores') {
      setQuery(item.name);
      router.push(`/tienda/${item.id}` as any);
    } else {
      // Navigate to ProductListScreen (which is mapped to /productos)
      // and pass the categoryId so it auto-filters
      router.push(`/productos?categoryId=${item.id}` as any);
    }
  };

  const renderSuggestionItem = (item: any, typeScope: SearchScope) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item, typeScope)}
    >
      <MaterialIcons name={typeScope === 'products' ? 'shopping-bag' : typeScope === 'stores' ? 'storefront' : 'category'} size={ms(20)} color={colors.textSecondary} />
      <Text style={[text.body, { color: colors.textPrimary, marginLeft: s(12) }]} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const hasSuggestions = suggestions && (!Array.isArray(suggestions) 
    ? (suggestions.products?.length || suggestions.stores?.length || suggestions.categories?.length)
    : suggestions.length > 0);

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, { backgroundColor: colors.bgSection, borderRadius: radii.md }, isFocused && { borderColor: colors.primary, borderWidth: 1 }]}>
        <MaterialIcons name="search" size={ms(24)} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, text.body, { color: colors.textPrimary }]}
          placeholder="Buscar..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay closing to allow suggestion tap
            setTimeout(() => setIsFocused(false), 200);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearIcon}>
            <MaterialIcons name="close" size={ms(20)} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {!locked && isFocused && (
        <View style={styles.chipsContainer}>
          {SCOPES.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.chip, { backgroundColor: currentScope === s.id ? colors.primary : colors.bgSection, borderRadius: radii.full }]}
              onPress={() => setScope(s.id)}
            >
              <Text style={[text.label, { color: currentScope === s.id ? colors.textOnPrimary : colors.textPrimary }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {isFocused && hasSuggestions && (
        <View style={[styles.dropdown, { backgroundColor: colors.bgCard, borderRadius: radii.md, ...shadows.md }]}>
          {Array.isArray(suggestions) ? (
            // Specific scope
            suggestions.map((item, idx) => (
              <View key={item.id || idx}>
                {renderSuggestionItem(item, currentScope)}
              </View>
            ))
          ) : (
            // All scope
            <>
              {suggestions.products?.map((item: any) => <View key={`p_${item.id}`}>{renderSuggestionItem(item, 'products')}</View>)}
              {suggestions.stores?.map((item: any) => <View key={`s_${item.id}`}>{renderSuggestionItem(item, 'stores')}</View>)}
              {suggestions.categories?.map((item: any) => <View key={`c_${item.id}`}>{renderSuggestionItem(item, 'categories')}</View>)}
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    height: vs(48),
  },
  searchIcon: {
    marginRight: s(8),
  },
  clearIcon: {
    padding: s(4),
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontFamily: fonts.sanRegular,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(8),
    marginTop: vs(8),
    paddingHorizontal: s(4),
  },
  chip: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
  },
  dropdown: {
    position: 'absolute',
    top: vs(48) + (vs(8) * 2), // Below input + some margin
    left: 0,
    right: 0,
    maxHeight: vs(250),
    overflow: 'hidden',
    zIndex: 20,
    borderWidth: 0.5,
    borderColor: '#e0e0e0',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: s(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
});
