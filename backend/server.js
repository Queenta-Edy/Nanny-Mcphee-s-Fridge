const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' })) // allows parsing JSON bodies, raised limit for base64 images

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Fridge-to-Recipe backend is running!' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})