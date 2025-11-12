import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, SafeAreaView, Dimensions, Animated } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

// Importar produtos do arquivo local
const produtosData = require('../products.json');

// Componente de ícone personalizado baseado na sua imagem
const CustomCartIcon = ({ size = 45 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 200 200">
    {/* Alça do carrinho */}
    <Path
      d="M50 40 L50 30 Q50 25 55 25 L75 25 Q80 25 80 30 L80 40"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="8"
      strokeLinecap="round"
    />
    
    {/* Corpo principal do carrinho */}
    <Path
      d="M40 40 Q35 40 35 45 L35 140 Q35 150 45 155 L155 155 Q165 150 165 140 L165 45 Q165 40 160 40 Z"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="8"
      strokeLinejoin="round"
    />
    
    {/* Produtos dentro do carrinho (QR codes representados) */}
    <Rect x="60" y="70" width="25" height="25" fill="none" stroke="#FFFFFF" strokeWidth="6" rx="3"/>
    <Rect x="100" y="70" width="25" height="25" fill="none" stroke="#FFFFFF" strokeWidth="6" rx="3"/>
    <Rect x="140" y="70" width="25" height="40" fill="#FFFFFF" rx="3"/>
    
    <Rect x="60" y="110" width="25" height="25" fill="none" stroke="#FFFFFF" strokeWidth="6" rx="3"/>
    <Rect x="100" y="110" width="15" height="15" fill="#FFFFFF" rx="2"/>
    <Rect x="120" y="110" width="8" height="25" fill="#FFFFFF" rx="2"/>
    <Rect x="132" y="120" width="18" height="8" fill="#FFFFFF" rx="2"/>
    
    {/* Rodas do carrinho */}
    <Circle cx="70" cy="175" r="12" fill="#FFFFFF"/>
    <Circle cx="140" cy="175" r="12" fill="#FFFFFF"/>
    
    {/* Base do carrinho */}
    <Path d="M30 175 L170 175" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round"/>
  </Svg>
);

type Produto = {
  id: string;
  nome: string;
  preco: number;
  qrCode: string;
};

export default function Index() {
  const [carrinho, setCarrinho] = useState<Produto[]>([]);
  const [total, setTotal] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [animatedValue] = useState(new Animated.Value(0));

  const { width } = Dimensions.get('window');

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();

    // Animação inicial
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const buscarProdutoPorQR = (qrCode: string): Produto | null => {
    return produtos.find(produto => produto.qrCode === qrCode) || null;
  };

  const onQRCodeScanned = ({ data }: { data: string }) => {
    const produto = buscarProdutoPorQR(data);
    if (produto) {
      adicionarProduto(produto);
      setShowScanner(false);
    } else {
      Alert.alert("Produto não encontrado", `QR Code: ${data}\nProduto não cadastrado no sistema.`);
    }
  };

  const iniciarScanner = async () => {
    if (hasPermission === null) {
      Alert.alert("Aguarde", "Verificando permissões da câmera...");
      return;
    }
    if (hasPermission === false) {
      Alert.alert("Permissão negada", "É necessário permitir o uso da câmera para escanear QR codes.");
      return;
    }
    setShowScanner(true);
  };

  // Usar produtos do arquivo JSON
  const produtos = produtosData;

  const adicionarProduto = (produto: Produto) => {
    setCarrinho([...carrinho, produto]);
    setTotal(total + produto.preco);
    
    // Animação de sucesso
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    Alert.alert(
      "✅ Produto Adicionado!", 
      `${produto.nome}\nR$ ${produto.preco.toFixed(2)}`,
      [{ text: "Continuar Comprando", style: "default" }]
    );
  };

  if (showScanner) {
    return (
      <SafeAreaView style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={onQRCodeScanned}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.8)']}
          style={styles.scannerOverlay}
        >
          <View style={styles.scannerHeader}>
            <LinearGradient
              colors={['#26b2b7', '#008389']}
              style={styles.scannerHeaderCard}
            >
              <Text style={styles.scannerTitle}>📱 ScanTap Ativo</Text>
              <Text style={styles.scannerSubtitle}>Posicione o QR Code no centro da tela</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.scannerFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          
          <TouchableOpacity 
            style={styles.modernCancelButton}
            onPress={() => setShowScanner(false)}
          >
            <LinearGradient
              colors={['#ff6b6b', '#ee5a24']}
              style={styles.cancelButtonGradient}
            >
              <Text style={styles.cancelButtonText}>✕ Cancelar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#f8f9fa', '#e9ecef']}
        style={styles.mainGradient}
      >
        {/* Header Melhorado */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#26b2b7', '#008389']}
            style={styles.logoContainer}
          >
            <CustomCartIcon size={45} />
          </LinearGradient>
          <Text style={styles.title}>ScanTap</Text>
          <Text style={styles.subtitle}>ESCANEOU, PAGOU, SAIU!</Text>
          <View style={styles.decorativeLine} />
        </View>

      <TouchableOpacity 
        style={styles.modernScanButton}
        onPress={iniciarScanner}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#26b2b7', '#008389']}
          style={styles.scanButtonGradient}
        >
          <View style={styles.scanButtonContent}>
            <Text style={styles.scanButtonIcon}>📷</Text>
            <Text style={styles.scanButtonText}>Escanear Produto</Text>
            <Text style={styles.scanButtonSubtext}>Toque para começar</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.modernCartSection}>
        <LinearGradient
          colors={['#ffffff', '#f8f9fa']}
          style={styles.cartGradient}
        >
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>🛒 Seu Carrinho</Text>
            {carrinho.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{carrinho.length}</Text>
              </View>
            )}
          </View>
        
        {carrinho.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartIcon}>�️</Text>
            <Text style={styles.emptyCartText}>Carrinho vazio</Text>
            <Text style={styles.emptyCartSubtext}>Escaneie um produto para começar</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={carrinho}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <Animated.View 
                  style={[
                    styles.modernCartItem,
                    {
                      opacity: animatedValue,
                      transform: [{ scale: animatedValue }]
                    }
                  ]}
                >
                  <View style={styles.cartItemLeft}>
                    <View style={styles.cartItemIcon}>
                      <Text style={styles.cartItemIconText}>🛍️</Text>
                    </View>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.nome}</Text>
                      <Text style={styles.cartItemCode}>#{item.qrCode}</Text>
                    </View>
                  </View>
                  <Text style={styles.cartItemPrice}>R$ {item.preco.toFixed(2)}</Text>
                </Animated.View>
              )}
              style={styles.cartList}
              showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.modernTotalSection}>
              <LinearGradient
                colors={['#008389', '#26b2b7']}
                style={styles.totalGradient}
              >
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>R$ {total.toFixed(2)}</Text>
              </LinearGradient>
            </View>

            <TouchableOpacity
              style={styles.modernCheckoutButton}
              activeOpacity={0.8}
              onPress={() => {
                Alert.alert(
                  "🎉 Compra Finalizada!", 
                  `Total: R$ ${total.toFixed(2)}\n\nObrigado por usar o ScanTap!`,
                  [
                    { 
                      text: "Novo Carrinho", 
                      onPress: () => {
                        setCarrinho([]);
                        setTotal(0);
                      }
                    }
                  ]
                );
              }}
            >
              <LinearGradient
                colors={['#27ae60', '#2ecc71']}
                style={styles.checkoutButtonGradient}
              >
                <Text style={styles.checkoutButtonText}>💳 Finalizar Compra</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
        </LinearGradient>
      </View>

      <Text style={styles.footer}>Produtos disponíveis: {produtos.length}</Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    paddingTop: 50,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#26b2b7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoIcon: {
    fontSize: 45,
    color: "white",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#008389",
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: "#008389",
    fontWeight: "600",
    letterSpacing: 3,
    opacity: 0.8,
  },
  decorativeLine: {
    width: 60,
    height: 4,
    backgroundColor: "#26b2b7",
    borderRadius: 2,
    marginTop: 15,
  },
  scanButtonContainer: {
    marginVertical: 25,
  },
  modernScanButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#26b2b7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanButtonGradient: {
    paddingVertical: 25,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  scanButtonContent: {
    alignItems: "center",
  },
  scanButtonIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  scanButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scanButtonSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
  },
  modernCartSection: {
    flex: 1,
    marginBottom: 20,
  },
  cartGradient: {
    flex: 1,
    borderRadius: 25,
    padding: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  cartTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008389",
  },
  cartBadge: {
    backgroundColor: "#26b2b7",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 30,
    alignItems: "center",
  },
  cartBadgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyCartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyCartCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  emptyCartIcon: {
    fontSize: 35,
  },
  emptyCartText: {
    fontSize: 20,
    color: "#008389",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyCartSubtext: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  cartList: {
    maxHeight: 200,
  },
  modernCartItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cartItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cartItemIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#26b2b7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  cartItemEmoji: {
    fontSize: 20,
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    color: "#008389",
    fontWeight: "600",
    marginBottom: 4,
  },
  cartItemCode: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  cartItemRight: {
    alignItems: "flex-end",
  },
  cartItemPrice: {
    fontSize: 18,
    color: "#26b2b7",
    fontWeight: "bold",
  },
  modernTotalSection: {
    borderRadius: 15,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#26b2b7",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  totalContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  totalLabel: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
    opacity: 0.9,
  },
  totalText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  modernCheckoutButton: {
    marginTop: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: "#3a7bd5",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  checkoutButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  checkoutButtonSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "500",
  },
  modernFooter: {
    alignItems: "center",
    paddingVertical: 15,
  },
  footerText: {
    textAlign: "center",
    color: "#008389",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  footerSubtext: {
    textAlign: "center",
    color: "#666",
    fontSize: 11,
    fontWeight: "400",
  },
  // Scanner Styles
  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 30,
  },
  scannerHeader: {
    alignItems: "center",
    paddingTop: 80,
  },
  scannerHeaderCard: {
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#26b2b7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scannerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  scannerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#26b2b7",
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#26b2b7",
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#26b2b7",
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#26b2b7",
  },
  modernCancelButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 50,
    elevation: 6,
  },
  cancelButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Estilos que estavam faltando
  mainGradient: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cartItemIconText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  totalGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
  },
  totalAmount: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
  },
  footer: {
    textAlign: "center",
    fontSize: 14,
    color: "#008389",
    marginTop: 20,
    fontWeight: "600",
  },
  // Estilos para o ícone de carrinho customizado
  customCartIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  cartIconLine1: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 12,
    letterSpacing: 2,
  },
  cartIconLine2: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 14,
    letterSpacing: 6,
  },
  cartIconLine3: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    lineHeight: 14,
    letterSpacing: 4,
  },
});
