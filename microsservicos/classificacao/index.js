require('dotenv').config()

const express = require('express')
const axios = require('axios')
const app = express()
const { GoogleGenerativeAI } = require("@google/generative-ai");
app.use(express.json())

const genAI = new GoogleGenerativeAI(process.env.APIKEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const palavraChave = 'importante'
const funcoes = {
  ObservacaoCriada: (observacao) => {
    observacao.status =
      observacao.status.includes(palavraChave) ? 'importante' : 'comum'
    axios.post('http://localhost:10000/eventos', {
      type: 'ObservacaoClassificada',
      payload: observacao
    })
  },
  LembreteCriado: async (lembrete) => {
    const prompt = `Classifique o lembrete com base na urgencia, ele parece urgente? ${lembrete.texto}`;
    try {
      const result = await model.generateContent(prompt);
      // Extrai a classificação da resposta e atualiza o status do lembrete
      const classificacao = result.response.text().trim().toLowerCase()
      lembrete.status = classificacao.includes('sim') ? 'Urgente' : 'Normal'
      axios.post('http://localhost:10000/eventos', {
        type: 'LembreteClassificado',
        payload: {
          id: lembrete.id,
          texto: lembrete.texto,
          status: lembrete.status
        }
      })
    } catch (error) {
        console.log("Algo deu errado com a classificação", error.message)
    }
  }
}

app.post('/eventos', (req, res) => {
  try {
    const evento = req.body
    funcoes[evento.type](evento.payload)
  }
  catch (e) { }
  res.status(200).end()
})

const port = 7000
app.listen(port, () => console.log(`Classificação. Porta ${port}.`))
