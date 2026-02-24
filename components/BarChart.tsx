import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';

interface BarChartProps {
  data: { day: string; blocked: number }[];
}

function BarChartInner({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.blocked), 1);
  const animValues = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: data[index].blocked / maxValue,
        duration: 600,
        delay: index * 80,
        useNativeDriver: false,
      })
    );
    Animated.stagger(80, animations).start();
  }, [data, maxValue, animValues]);

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const heightInterpolation = animValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [4, 100],
          });

          return (
            <View key={item.day} style={styles.barWrapper}>
              <Text style={styles.barValue}>{item.blocked}</Text>
              <View style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: heightInterpolation,
                      backgroundColor: item.blocked > 5 ? Colors.danger : item.blocked > 3 ? Colors.warning : Colors.accent,
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export const BarChart = React.memo(BarChartInner);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 4,
    fontWeight: '600' as const,
  },
  barTrack: {
    width: 24,
    height: 100,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: 24,
    borderRadius: 6,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500' as const,
  },
});
