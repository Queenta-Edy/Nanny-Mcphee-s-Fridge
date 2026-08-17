const express = require('express')
const cors = require('cors')
const ingredientImageRoute = require('./routes/ingredient-image')
require('dotenv').config()

const detectRoute = require('./routes/detect')
const recipesRoute = require('./routes/recipes')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use('/api/ingredient-image', ingredientImageRoute)

app.get('/', (req, res) => {
  res.json({ message: 'Fridge-to-Recipe backend is running!' })
})

app.use('/api/detect', detectRoute)
app.use('/api/recipes', recipesRoute)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})