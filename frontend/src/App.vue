<script setup>
import { ref } from 'vue'

const selectedFile = ref(null)
const previewUrl = ref(null)
const errorMessage = ref('')
const ingredients = ref([])
const isAnalyzing = ref(false)

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function handleFileChange(event) {
  const file = event.target.files[0]
  errorMessage.value = ''
  ingredients.value = []

  if (!file) return

  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = 'File is too large. Please choose an image under 5MB.'
    selectedFile.value = null
    previewUrl.value = null
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function analyzePhoto() {
  if (!selectedFile.value) return

  isAnalyzing.value = true
  errorMessage.value = ''
  ingredients.value = []

  try {
    const base64Image = await fileToBase64(selectedFile.value)

    const response = await fetch('http://localhost:3000/api/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    })

    if (!response.ok) {
      throw new Error('Failed to analyze image')
    }

    const data = await response.json()
    ingredients.value = data.ingredients || []
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Something went wrong analyzing your photo. Please try again.'
  } finally {
    isAnalyzing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Fridge to Recipe</h1>

    <div class="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
      <label
        for="photo-input"
        class="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition"
      >
        <span class="text-gray-500">Tap to upload or take a photo of your fridge</span>
        <input
          id="photo-input"
          type="file"
          accept="image/*"
          capture="environment"
          class="hidden"
          @change="handleFileChange"
        />
      </label>

      <p v-if="errorMessage" class="text-red-500 text-sm mt-3">
        {{ errorMessage }}
      </p>

      <div v-if="previewUrl" class="mt-6">
        <img :src="previewUrl" alt="Preview" class="w-full rounded-xl shadow-sm" />
      </div>

      <button
        v-if="previewUrl"
        @click="analyzePhoto"
        :disabled="isAnalyzing"
        class="mt-4 w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition"
      >
        {{ isAnalyzing ? 'Analyzing...' : 'Analyze My Fridge' }}
      </button>

      <div v-if="ingredients.length > 0" class="mt-6">
        <h2 class="font-semibold text-gray-700 mb-2">Detected ingredients:</h2>
        <ul class="text-gray-600 list-disc list-inside">
          <li v-for="(item, index) in ingredients" :key="index">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>