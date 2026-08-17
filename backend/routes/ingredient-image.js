const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  const { query } = req.query

  if (!query) {
    return res.status(400).json({ error: 'No query provided' })
  }

  try {
    const response = await fetch(
      `https://pixabay.com/api/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&image_type=photo&category=food&per_page=3&safesearch=true`
    )

    if (!response.ok) {
      throw new Error('Pixabay request failed')
    }

    const data = await response.json()
    const imageUrl = data.hits?.[0]?.webformatURL || null

    res.json({ imageUrl })
  } catch (error) {
    console.error('Pixabay error:', error.message)
    res.status(500).json({ imageUrl: null })
  }
})

module.exports = router