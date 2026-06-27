import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListProperties } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import PropertyCard from '@/components/PropertyCard';

const FILTERS = ['All', 'Nigeria', 'Ghana', 'Kenya', 'Live', 'Funding'];

export default function PropertiesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const { data: properties, isLoading, isError, refetch } = useListProperties();

  const filtered = useMemo(() => {
    if (!properties) return [];
    let list = properties;

    if (activeFilter === 'Nigeria') list = list.filter((p) => p.country === 'Nigeria');
    else if (activeFilter === 'Ghana') list = list.filter((p) => p.country === 'Ghana');
    else if (activeFilter === 'Kenya') list = list.filter((p) => p.country === 'Kenya');
    else if (activeFilter === 'Live') list = list.filter((p) => p.status === 'live');
    else if (activeFilter === 'Funding') list = list.filter((p) => p.status === 'funding');

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [properties, search, activeFilter]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Properties</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {properties?.length ?? 0} tokenized SPVs
        </Text>

        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search properties..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            autoCapitalize="none"
            testID="search-input"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <FlatList
          data={FILTERS}
          keyExtractor={(f) => f}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10, gap: 8 }}
          renderItem={({ item }) => {
            const active = item === activeFilter;
            return (
              <Pressable
                onPress={() => setActiveFilter(item)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                    borderRadius: 20,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? '#fff' : colors.mutedForeground },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Failed to load properties
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={[styles.retryBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => String(p.id)}
          renderItem={({ item }) => <PropertyCard property={item} />}
          contentContainerStyle={{
            padding: 16,
            gap: 12,
            paddingBottom: isWeb ? 34 : insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!filtered.length}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="business-outline" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No properties found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { paddingHorizontal: 16, paddingBottom: 4, borderBottomWidth: 1 },
  title: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  errorText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
});
