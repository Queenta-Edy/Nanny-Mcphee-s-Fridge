const express = require('express')
const router = express.Router()
const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

router.post('/', async (req, res) => {
  const { image } = req.body || {}

  if (!image) {
    return res.status(400).json({ error: 'No image provided' })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Identify all visible food ingredients in this fridge photo. Respond ONLY with valid JSON in this exact format, no other text: {"ingredients": ["item1", "item2"]}',
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const raw = response.choices[0].message.content

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', raw)
      return res.status(500).json({ error: 'AI returned an unexpected format' })
    }

    res.json(parsed)
  } catch (error) {
    console.error('OpenAI Vision API error:', error.message)
    res.status(500).json({ error: 'Failed to analyze image' })
  }
})

module.exports = router