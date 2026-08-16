const express = require('express')
const cors = require('cors')
require('dotenv').config()

const detectRoute = require('./routes/detect')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/', (req, res) => {
  res.json({ message: 'Fridge-to-Recipe backend is running!' })
})

app.use('/api/detect', detectRoute)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})