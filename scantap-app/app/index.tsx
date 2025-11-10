import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

type Produto = {
  nome: string;
  preco: number;
};

export default function Index() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const produto = JSON.parse(data);
      if (produto.nome && produto.preco) {
        setCarrinho([...carrinho, produto]);
        setTotal(total + produto.preco);
        Alert.alert("Produto adicionado!", `${produto.nome} - R$${produto.preco.toFixed(2)}`);
      } else {
        Alert.alert("QR inválido", "O QR code não contém informações de produto válidas.");
      }
    } catch {
      Alert.alert("Erro", "Não foi possível ler este QR Code.");
    }
    setShowScanner(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>Permissão negada! Vá nas configurações e libere a câmera.</Text>
      </View>
    );
  }

  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <Button title="Cancelar" onPress={() => setShowScanner(false)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 ScanTap</Text>
      <Text style={styles.subtitle}>Simule um carrinho com QR Codes</Text>

      <View style={styles.buttons}>
        <Button title="📷 Escanear Produto" onPress={() => { setShowScanner(true); setScanned(false); }} />
      </View>

      <Text style={styles.cartTitle}>Carrinho:</Text>

      {carrinho.length === 0 ? (
        <Text style={styles.emptyCart}>Nenhum produto adicionado ainda.</Text>
      ) : (
        <FlatList
          data={carrinho}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.item}>{item.nome} — R$ {item.preco.toFixed(2)}</Text>
          )}
        />
      )}

      <Text style={styles.total}>Total: R$ {total.toFixed(2)}</Text>

      {carrinho.length > 0 && (
        <Button
          title="🧾 Finalizar Compra"
          onPress={() => {
            Alert.alert("Compra Finalizada", "Obrigado por usar o ScanTap!");
            setCarrinho([]);
            setTotal(0);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007bff",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  buttons: {
    marginVertical: 10,
  },
  cartTitle: {
    fontSize: 20,
    marginTop: 20,
    fontWeight: "bold",
  },
  emptyCart: {
    fontSize: 16,
    color: "#888",
    marginTop: 10,
  },
  item: {
    fontSize: 16,
    padding: 5,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
});
