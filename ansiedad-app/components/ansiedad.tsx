import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

const FRASES = [
  "¿Y si sale mal?",
  "No sos suficiente",
  "Te van a juzgar",
  "Todo va a fallar",
  "No podés hacerlo",
  "Algo va a salir mal",
];
// ✅ Tipo para TypeScript
type Pensamiento = {
  id: string;
  texto: string;
  x: number;
  y: number;
};

export default function AnsiedadScreen() {
  const [pantalla, setPantalla] = useState<"inicio" | "ansiedad" | "final">("inicio");
  const [pensamientos, setPensamientos] = useState<Pensamiento[]>([]);
  const [intervaloTiempo, setIntervaloTiempo] = useState(2000);
  const [respirado, setRespirado] = useState(false);

  // Generar pensamientos (ansiedad crece)
  useEffect(() => {
    if (pantalla !== "ansiedad") return;

    const interval = setInterval(() => {
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

      // cada vez más rápido
      setIntervaloTiempo((prev) => (prev > 500 ? prev - 100 : prev));
    }, intervaloTiempo);

    return () => clearInterval(interval);
  }, [pantalla, intervaloTiempo]);

  // Botón respirar
  const respirar = () => {
    setPensamientos([]);
    setRespirado(true);
    setPantalla("final");
  };

  // Colapso automático
  useEffect(() => {
    if (pensamientos.length > 25) {
      setPantalla("final");
    }
  }, [pensamientos]);

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

        <Pressable style={styles.botonRespirar} onPress={respirar}>
          <Text style={styles.botonTexto}>RESPIRAR</Text>
        </Pressable>
      </View>
    );
  }

  // 🔵 Pantalla final
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: respirado ? "#d4f5d4" : "#000" },
      ]}
    >
      <Text style={styles.textoGrande}>
        {respirado
          ? "No desaparece… pero podés controlarlo."
          : "A veces es demasiado."}
      </Text>

      <Pressable
        style={styles.boton}
        onPress={() => {
          setPantalla("inicio");
          setPensamientos([]);
          setRespirado(false);
          setIntervaloTiempo(2000);
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
  boton: {
    backgroundColor: "#444",
    padding: 15,
    borderRadius: 10,
  },
  botonRespirar: {
    position: "absolute",
    bottom: 50,
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 10,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
  },
});