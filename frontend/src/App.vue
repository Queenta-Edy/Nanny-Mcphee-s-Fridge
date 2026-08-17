<script setup>
import { ref, computed, onMounted } from 'vue'
import { marked } from 'marked'
import LoadingPlate from './components/LoadingPlate.vue'

const selectedFile = ref(null)
const previewUrl = ref(null)
const errorMessage = ref('')
const ingredients = ref([])
const isAnalyzing = ref(false)
const newIngredient = ref('')
const recipesText = ref('')
const isGeneratingRecipes = ref(false)
const savedRecipes = ref([])
const showMyRecipes = ref(false)
const expandedCategories = ref({})
const ingredientImages = ref({})

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const STORAGE_KEY = 'fridgeai-saved-recipes'

const CATEGORY_RULES = [
  { category: 'Vegetables', keywords: ['lettuce', 'tomato', 'onion', 'carrot', 'celery', 'cucumber', 'apple', 'banana', 'lime', 'lemon', 'orange', 'beetroot', 'beet', 'strawberr', 'fruit', 'vegetable', 'pepper', 'garlic', 'potato', 'spinach', 'kale', 'avocado'] },
  { category: 'Dairy', keywords: ['cheese', 'yogurt', 'yoghurt', 'milk', 'butter', 'cream'] },
  { category: 'Drinks', keywords: ['juice', 'soda', 'cola', 'drink', 'beer', 'wine', 'water', 'can'] },
  { category: 'Pantry', keywords: ['pasta', 'rice', 'sauce', 'mayonnaise', 'mustard', 'oil', 'flour', 'sugar', 'salt', 'condiment'] },
]

const CATEGORY_COLORS = {
  Vegetables: 'from-lime-300 to-lime-400',
  Dairy: 'from-amber-200 to-amber-300',
  Drinks: 'from-sky-200 to-sky-300',
  Pantry: 'from-orange-200 to-orange-300',
  Other: 'from-gray-200 to-gray-300',
}

const CATEGORY_SECTION_COLORS = {
  Vegetables: 'bg-lime-200 hover:bg-lime-300',
  Dairy: 'bg-amber-200 hover:bg-amber-300',
  Drinks: 'bg-orange-200 hover:bg-orange-300',
  Pantry: 'bg-fuchsia-200 hover:bg-fuchsia-300',
  Other: 'bg-yellow-200 hover:bg-yellow-300',
}

function getIngredientCategory(name) {
  const lower = name.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.category
    }
  }
  return 'Other'
}

function toggleCategory(category) {
  expandedCategories.value[category] = !expandedCategories.value[category]
}

async function fetchIngredientImage(name) {
  if (ingredientImages.value[name] !== undefined) return

  try {
    const response = await fetch(`http://localhost:3000/api/ingredient-image?query=${encodeURIComponent(name)}`)
    const data = await response.json()
    ingredientImages.value[name] = data.imageUrl || null
  } catch {
    ingredientImages.value[name] = null
  }
}

const groupedIngredients = computed(() => {
  const groups = {}

  ingredients.value.forEach((item, index) => {
    const category = getIngredientCategory(item.name)
    if (!groups[category]) groups[category] = []
    groups[category].push({ name: item.name, quantity: item.quantity, index })
  })

  return groups
})

const recipeChunks = computed(() => {
  if (!recipesText.value) return []
  const chunks = recipesText.value
    .split(/\n(?=## )/)
    .filter((chunk) => chunk.trim().startsWith('##'))
  return chunks.map((chunk) => chunk.trim())
})

const recipeCards = computed(() => recipeChunks.value.map((chunk) => marked.parse(chunk)))

function extractTitle(markdown) {
  const match = markdown.match(/^##\s+(.+)$/m)
  return match ? match[1].trim() : 'Untitled Recipe'
}

function isSaved(markdown) {
  const title = extractTitle(markdown)
  return savedRecipes.value.some((r) => r.title === title)
}

function loadSavedRecipes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    savedRecipes.value = stored ? JSON.parse(stored) : []
  } catch {
    savedRecipes.value = []
  }
}

function saveRecipe(markdown) {
  const title = extractTitle(markdown)
  if (isSaved(markdown)) return

  const newEntry = {
    id: Date.now(),
    title,
    markdown,
    savedAt: new Date().toISOString(),
  }

  savedRecipes.value.push(newEntry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes.value))
}

function deleteRecipe(id) {
  savedRecipes.value = savedRecipes.value.filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecipes.value))
}

onMounted(() => {
  loadSavedRecipes()
})

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
    ingredients.value.forEach((item) => fetchIngredientImage(item.name))
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Something went wrong analyzing your photo. Please try again.'
  } finally {
    isAnalyzing.value = false
  }
}

function removeIngredient(index) {
  ingredients.value.splice(index, 1)
}

function addIngredient() {
  const trimmed = newIngredient.value.trim()
  if (trimmed && !ingredients.value.some((i) => i.name === trimmed)) {
    ingredients.value.push({ name: trimmed, quantity: 1 })
    fetchIngredientImage(trimmed)
  }
  newIngredient.value = ''
}

async function generateRecipes() {
  if (ingredients.value.length === 0) return

  isGeneratingRecipes.value = true
  recipesText.value = ''
  errorMessage.value = ''

  try {
    const response = await fetch('http://localhost:3000/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: ingredients.value.map((i) => i.name) }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate recipes')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const parts = buffer.split('\n\n')
      buffer = parts.pop()

      for (const part of parts) {
        if (!part.startsWith('data: ')) continue
        const dataStr = part.slice(6)

        if (dataStr === '[DONE]') continue

        try {
          const parsed = JSON.parse(dataStr)
          if (parsed.content) {
            recipesText.value += parsed.content
          }
        } catch {
          // ignore malformed partial chunks
        }
      }
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Something went wrong generating recipes. Please try again.'
  } finally {
    isGeneratingRecipes.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FAFAF8] flex flex-col items-center p-6">
    <div class="w-full max-w-md flex items-center justify-between mb-8">
      <h1 class="text-4xl font-bold text-[#2D2D2D] tracking-tight flex items-baseline flex-wrap gap-x-2">
        Nanny <span class="text-lime-500">Mcphee's</span>
        <span class="text-sm font-normal text-gray-500">Fridge</span>
      </h1>
      <button
        @click="showMyRecipes = !showMyRecipes"
        class="text-sm font-medium text-lime-700 bg-lime-100 hover:bg-lime-200 px-4 py-2 rounded-full transition"
      >
        {{ showMyRecipes ? 'Back' : 'My Recipes' }}
      </button>
    </div>

    <!-- MY RECIPES VIEW -->
    <div v-if="showMyRecipes" class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
      <h2 class="font-semibold text-[#2D2D2D] mb-4">Saved Recipes</h2>

      <p v-if="savedRecipes.length === 0" class="text-gray-400 text-sm">
        No saved recipes yet. Generate some recipes and save your favorites!
      </p>

      <div v-else class="space-y-4">
        <div
          v-for="recipe in savedRecipes"
          :key="recipe.id"
          class="bg-lime-50 rounded-2xl p-5 border border-lime-200 shadow-sm text-[#2D2D2D] text-sm leading-relaxed recipe-content relative"
        >
          <div class="flex items-start justify-between gap-4 mb-2">
            <div class="flex-1"></div>
            <button
              @click="deleteRecipe(recipe.id)"
              class="text-gray-400 hover:text-lime-700 text-2xl font-light leading-none"
              aria-label="Remove recipe"
            >
              ×
            </button>
          </div>
          <div v-html="marked.parse(recipe.markdown)"></div>
        </div>
      </div>
    </div>

    <!-- MAIN APP VIEW -->
    <div v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
      <label
        for="photo-input"
        class="block w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-lime-400 transition"
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
        <img :src="previewUrl" alt="Preview" class="w-full rounded-2xl shadow-sm" />
      </div>

      <LoadingPlate v-if="isAnalyzing" message="Sniffing out ingredients..." />
      <button
        v-else-if="previewUrl"
        @click="analyzePhoto"
        class="mt-4 w-full bg-lime-200 text-[#2D2D2D] font-medium py-3 rounded-full hover:bg-lime-300 transition"
      >
        Analyze My Fridge
      </button>

      <div v-if="ingredients.length > 0" class="mt-6">
        <h2 class="font-semibold text-[#2D2D2D] mb-3">Detected ingredients:</h2>

        <div class="space-y-6 mb-4">
          <div
            v-for="(items, category) in groupedIngredients"
            :key="category"
            :class="['rounded-3xl p-4 transition-colors duration-200', CATEGORY_SECTION_COLORS[category] || CATEGORY_SECTION_COLORS.Other]"
          >
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-semibold text-[#2D2D2D]">{{ category }}</h3>
              <button
                v-if="items.length > 4"
                @click="toggleCategory(category)"
                class="text-xs font-medium text-lime-700 hover:text-lime-800"
              >
                {{ expandedCategories[category] ? 'Show less' : 'See all' }}
              </button>
            </div>

            <!-- Horizontal scroll (default) -->
            <div
              v-if="!expandedCategories[category]"
              class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
            >
              <div
                v-for="item in items"
                :key="item.index"
                class="relative flex-shrink-0 w-28 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div class="h-16 relative overflow-hidden">
                  <img
                    v-if="ingredientImages[item.name]"
                    :src="ingredientImages[item.name]"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    :class="['w-full h-full bg-gradient-to-br', CATEGORY_COLORS[category] || CATEGORY_COLORS.Other]"
                  ></div>
                </div>
                <button
                  @click="removeIngredient(item.index)"
                  class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-lime-700 text-sm font-light"
                  aria-label="Remove ingredient"
                >
                  ×
                </button>
                <div class="p-2">
                  <p class="text-xs font-semibold text-[#2D2D2D] truncate">{{ item.name }}</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">{{ item.quantity }} in fridge</p>
                </div>
              </div>
            </div>

            <!-- Expanded grid ("See all") -->
            <div v-else class="grid grid-cols-3 gap-3">
              <div
                v-for="item in items"
                :key="item.index"
                class="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div class="h-16 relative overflow-hidden">
                  <img
                    v-if="ingredientImages[item.name]"
                    :src="ingredientImages[item.name]"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    :class="['w-full h-full bg-gradient-to-br', CATEGORY_COLORS[category] || CATEGORY_COLORS.Other]"
                  ></div>
                </div>
                <button
                  @click="removeIngredient(item.index)"
                  class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-lime-700 text-sm font-light"
                  aria-label="Remove ingredient"
                >
                  ×
                </button>
                <div class="p-2">
                  <p class="text-xs font-semibold text-[#2D2D2D] truncate">{{ item.name }}</p>
                  <p class="text-[11px] text-gray-400 mt-0.5">{{ item.quantity }} in fridge</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <input
            v-model="newIngredient"
            @keyup.enter="addIngredient"
            type="text"
            placeholder="Add an ingredient..."
            class="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-lime-400"
          />
          <button
            @click="addIngredient"
            class="bg-lime-600 hover:bg-lime-700 text-white px-5 rounded-full text-sm font-medium transition"
          >
            Add
          </button>
        </div>

        <LoadingPlate v-if="isGeneratingRecipes" message="Whisking up recipes..." />
        <button
          v-else-if="ingredients.length > 0"
          @click="generateRecipes"
          class="mt-4 w-full bg-lime-600 text-white font-medium py-3 rounded-full hover:bg-lime-700 transition"
        >
          Generate Recipes
        </button>

        <div v-if="recipeCards.length > 0" class="mt-6 space-y-4">
          <div
            v-for="(cardHtml, index) in recipeCards"
            :key="index"
            class="bg-lime-50 rounded-2xl p-5 border border-lime-200 shadow-sm text-[#2D2D2D] text-sm leading-relaxed recipe-content"
          >
            <div v-html="cardHtml"></div>
            <button
              @click="saveRecipe(recipeChunks[index])"
              :disabled="isSaved(recipeChunks[index])"
              class="mt-3 text-sm font-medium px-4 py-2 rounded-full transition"
              :class="isSaved(recipeChunks[index])
                ? 'bg-gray-100 text-gray-400 cursor-default'
                : 'bg-lime-600 text-white hover:bg-lime-500'"
            >
              {{ isSaved(recipeChunks[index]) ? 'Saved' : 'Save Recipe' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>