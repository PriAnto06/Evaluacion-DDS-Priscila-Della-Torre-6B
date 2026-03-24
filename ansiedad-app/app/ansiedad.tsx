import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("window");

const FRASES = [
  "¿Y si sale mal?",
  "No sos suficiente",
  "Te van a juzgar",
  "Todo va a fallar",
  "No podés hacerlo",
  "Algo va a salir mal",
];

type Pensamiento = {
  id: string;
  texto: string;
  x: number;
  y: number;
};

export default function AnsiedadScreen() {
  const [pantalla, setPantalla] = useState<"inicio" | "ansiedad" | "final">("inicio");
  const [pensamientos, setPensamientos] = useState<Pensamiento[]>([]);
  const [grabando, setGrabando] = useState(false);

  // 🎤 Generar pensamientos
  const generarPensamiento = () => {
    const frase =
      FRASES[Math.floor(Math.random() * FRASES.length)];

    setPensamientos((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        texto: frase,
        x: Math.random() * (width - 100),
        y: Math.random() * (height - 100),
      },
    ]);
  };

  // 🎤 Activar micrófono (simula grito)
  const empezarAGritar = async () => {
    const permiso = await Audio.requestPermissionsAsync();
    if (!permiso.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    setGrabando(true);

    // Mientras "grita", aparecen pensamientos
    const interval = setInterval(() => {
      generarPensamiento();
    }, 700);

    // parar automáticamente después de 10 segundos
    setTimeout(() => {
      clearInterval(interval);
      setGrabando(false);
      setPantalla("final");
    }, 10000);
  };

  // 🟢 Pantalla inicio
  if (pantalla === "inicio") {
    return (
      <View style={styles.container}>
        <Text style={styles.textoGrande}>Todo está tranquilo…</Text>

        <Pressable
          style={styles.boton}
          onPress={() => setPantalla("ansiedad")}
        >
          <Text style={styles.botonTexto}>Empezar</Text>
        </Pressable>
      </View>
    );
  }

  // 🔴 Pantalla ansiedad
  if (pantalla === "ansiedad") {
    return (
      <View style={styles.container}>
        {pensamientos.map((p) => (
          <Text
            key={p.id}
            style={[
              styles.pensamiento,
              { top: p.y, left: p.x },
            ]}
          >
            {p.texto}
          </Text>
        ))}

        <Pressable style={styles.botonRespirar} onPress={empezarAGritar}>
          <Text style={styles.botonTexto}>
            {grabando ? "GRITANDO..." : "GRITAR 🎤"}
          </Text>
        </Pressable>
      </View>
    );
  }

  // 🔵 Pantalla final
  return (
    <View style={[styles.container, { backgroundColor: "#d4f5d4" }]}>
      <Text style={styles.textoGrande}>
        Lo sacaste afuera.
      </Text>

      <Pressable
        style={styles.boton}
        onPress={() => {
          setPantalla("inicio");
          setPensamientos([]);
          setGrabando(false);
        }}
      >
        <Text style={styles.botonTexto}>Reiniciar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  textoGrande: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  pensamiento: {
    position: "absolute",
    color: "white",
    fontSize: 16,
  },
  boton: {import { Audio } from "expo-av";

  },
  botonRespirar: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 10,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
  },
});