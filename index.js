const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Caminho do arquivo com produtos
const DB_FILE = path.join(__dirname, "products.json");

// Lê os produtos
function readProducts() {
  const raw = fs.readFileSync(DB_FILE);
  return JSON.parse(raw);
}

// Atualiza o arquivo de produtos
function writeProducts(obj) {
  fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2));
}

// Teste: rota principal
app.get("/", (req, res) => res.send("ScanTap backend OK"));

// Retorna um produto pelo ID
app.get("/product/:id", (req, res) => {
  try {
    const id = req.params.id;
    const products = readProducts();
    const p = products[id];
    if (!p) return res.status(404).json({ error: "Produto não encontrado" });
    return res.json(p);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Simula uma compra
app.post("/purchase", (req, res) => {
  try {
    const { items, total } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Pedido inválido" });
    }

    const products = readProducts();

    // verifica estoque
    for (const it of items) {
      const product = products[it.id];
      if (!product) return res.status(400).json({ error: `Produto ${it.id} não encontrado` });
      if ((product.stock || 0) < (it.qty || 1)) {
        return res.status(400).json({ error: `Estoque insuficiente para ${product.name}` });
      }
    }

    // reduz estoque
    for (const it of items) {
      products[it.id].stock = (products[it.id].stock || 0) - (it.qty || 1);
    }
    writeProducts(products);

    const order = {
      id: uuidv4(),
      items,
      total,
      createdAt: new Date().toISOString()
    };

    return res.json({ message: "Compra simulada com sucesso", order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`🚀 ScanTap backend rodando na porta ${port}`));
