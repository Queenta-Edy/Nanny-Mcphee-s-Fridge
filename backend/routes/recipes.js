const express = require('express')
const router = express.Router()
const OpenAI = require('openai')

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

router.post('/', async (req, res) => {
  const { ingredients } = req.body || {}

  // Validation
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'No ingredients provided' })
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders() // send headers immediately, before any data

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      stream: true,
      messages: [
        {
          role: 'user',
          content: `Using these ingredients: ${ingredients.join(', ')}, suggest exactly 3 recipes that can be made with them (it's fine to assume basic pantry staples like salt, oil, pepper are also available). For each recipe, include: a name, the total time required, a difficulty level (Easy, Medium, or Hard), and clear step-by-step preparation instructions. Format your entire response as it comes.`,
        },
      ],
    })

    // Forward each chunk to the client as it arrives
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`)
      }
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    console.error('OpenAI streaming error:', error.message)
    res.write(`data: ${JSON.stringify({ error: 'Failed to generate recipes' })}\n\n`)
    res.end()
  }
})

module.exports = router