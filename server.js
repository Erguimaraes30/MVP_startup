import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Banco de dados fake (simulado)
const produtos = [
  { id: "12345", nome: "Coca-Cola 350ml", preco: 5.50 },
  { id: "67890", nome: "Chocolate Nestlé", preco: 7.20 },
  { id: "11111", nome: "Batata Chips", preco: 9.90 },
];

// Endpoint pra retornar produto pelo ID do QR
app.get("/produto/:id", (req, res) => {
  const produto = produtos.find(p => p.id === req.params.id);
  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
  res.json(produto);
});

app.listen(3000, () => console.log("✅ API rodando em http://localhost:3000"));
