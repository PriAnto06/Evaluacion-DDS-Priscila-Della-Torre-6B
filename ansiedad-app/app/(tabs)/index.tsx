import { Audio } from "expo-av";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

const FRASES = [
  "GRITA",
  "¿Y si sale mal?",
  "No sos suficiente",
  "Te van a juzgar",
  "Todo va a fallar",
];

export default function ScrollEfecto() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [grabando, setGrabando] = useState(false);

  const scrollPos = useRef(0);

  const empezar = async () => {
    try {
      // 🔴 MATAR grabación previa SI EXISTE
      if (recordingRef.current) {
        try {
          await recordingRef.current.stopAndUnloadAsync();
        } catch (e) {}
        recordingRef.current = null;
      }

      const permiso = await Audio.requestPermissionsAsync();
      if (!permiso.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();

      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      await recording.startAsync();
      recordingRef.current = recording;

      setGrabando(true);

      let silencioFrames = 0;
      let tiempoEnArriba = 0;

      const interval = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          if (!status.isRecording) return;

          const volumen = status.metering ?? -160;

          if (volumen > -25) {
            scrollPos.current += 15;
            silencioFrames = 0;
            tiempoEnArriba = 0;
          } else {
            scrollPos.current -= 10;
            silencioFrames++;
          }

          if (scrollPos.current < 0) scrollPos.current = 0;
          if (scrollPos.current > height * FRASES.length)
            scrollPos.current = height * FRASES.length;

          scrollRef.current?.scrollTo({
            y: scrollPos.current,
            animated: false,
          });

          if (scrollPos.current <= 5) {
            tiempoEnArriba += 50;

            if (tiempoEnArriba >= 30000) {
              clearInterval(interval);

              await recording.stopAndUnloadAsync();
              recordingRef.current = null;

              setGrabando(false);

              scrollPos.current = 0;

              scrollRef.current?.scrollTo({
                y: 0,
                animated: false,
              });
            }
          }
        } catch (e) {
          // evita romper el interval
        }
      }, 50);
    } catch (error) {
      console.log("ERROR GRABACIÓN:", error);
    }
  };

  return (
    <View style={styles.container}>
      {!grabando && (
        <View style={styles.center}>
          <Text style={styles.grita}>GRITA</Text>

          <Pressable style={styles.boton} onPress={empezar}>
            <Text style={styles.botonTexto}>EMPEZAR 🎤</Text>
          </Pressable>
        </View>
      )}

      {grabando && (
        <>
          <Animated.ScrollView
            ref={scrollRef}
            scrollEnabled={false}
            contentContainerStyle={{ height: height * FRASES.length }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
          >
            {FRASES.map((texto, i) => {
              const inputRange = [
                (i - 1) * height,
                i * height,
                (i + 1) * height,
              ];

              const translateY = scrollY.interpolate({
                inputRange,
                outputRange: [100, 0, -100],
                extrapolate: "clamp",
              });

              const opacity = scrollY.interpolate({
                inputRange,
                outputRange: [0, 1, 0],
                extrapolate: "clamp",
              });

              const scale = scrollY.interpolate({
                inputRange,
                outputRange: [0.8, 1.2, 0.8],
                extrapolate: "clamp",
              });

              const rotate = scrollY.interpolate({
                inputRange,
                outputRange: ["-20deg", "0deg", "20deg"],
                extrapolate: "clamp",
              });

              return (
                <View key={i} style={styles.page}>
                  <Animated.Text
                    style={[
                      styles.text,
                      i === 0 && styles.grita,
                      {
                        opacity,
                        transform: [{ translateY }, { scale }, { rotate }],
                      },
                    ]}
                  >
                    {texto}
                  </Animated.Text>
                </View>
              );
            })}
          </Animated.ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  page: {
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 28,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  grita: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#fff",
  },
  boton: {
    marginTop: 20,
    backgroundColor: "#ff4d4d",
    padding: 15,
    borderRadius: 10,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});