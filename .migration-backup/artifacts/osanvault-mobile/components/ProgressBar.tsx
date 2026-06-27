import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

type Props = { value: number; height?: number; color?: string };

export default function ProgressBar({ value, height = 5, color }: Props) {
  const colors = useColors();
  const bar = color ?? colors.primary;
  return (
    <View style={[styles.track, { height, backgroundColor: colors.border }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${Math.min(100, Math.max(0, value))}%` as `${number}%`,
            height,
            backgroundColor: bar,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 99,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 99,
  },
});
