const axios = require('axios')
const express = require('express')
const app = express()
app.use(express.json())

/*
  {
    1: {
      id: 1,
      texto: fazer cafe
    },
    2: {
      id: 2,
      texto: nadar
    }
  }
*/
let id = 1
const baseLembretes = {}

//GET /lembretes
app.get('/lembretes', (req, res) => {
  res.status(200).json(baseLembretes)  
})
//POST /lembretes
app.post('/lembretes', async function(req, res){
  const texto = req.body.texto
  const lembrete = { id: id, texto: texto, status: 'aguardando' }
  baseLembretes[id] = lembrete
  id++
  await axios.post('http://localhost:10000/eventos', {
    type: 'LembreteCriado',
    payload: lembrete
  })
  res.status(201).json(baseLembretes)
})

//escrever o endpoint da caixinha amarela
//ou seja, receber um evento
//o que fazer com ele? apenas log
//não esqueça de responder a quem te enviou a requisição
app.post('/eventos', (req, res) => {
  try{
    const evento = req.body
    console.log(evento)
  }
  catch(e){}
  res.end()
})

const port = 4000
app.listen(port, () => {
  console.log(`Lembretes. Porta ${port}.`)
})


