<script setup>
defineProps({
  message: {
    type: String,
    default: 'Cooking something up...',
  },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-8">
    <svg width="110" height="100" viewBox="0 0 100 95" xmlns="http://www.w3.org/2000/svg">
      <!-- Steam (from your SVG, split into 3 animatable paths) -->
      <path
        class="steam steam-1"
        fill="#C9971C"
        d="M39.519,30.035c0.662-0.537,1.041-1.323,1.041-2.148c0-0.825-0.382-1.611-1.043-2.148c-1.283-1.043-2.02-2.575-2.02-4.204s0.737-3.16,2.024-4.199c0.563-0.462,1.4-0.373,1.857,0.195c0.459,0.568,0.371,1.398-0.197,1.86c-0.662,0.537-1.041,1.318-1.041,2.144s0.382,1.611,1.045,2.153c1.283,1.043,2.02,2.574,2.02,4.199c0,1.629-0.737,3.161-2.022,4.204h-0.002c-0.659,0.537-1.041,1.323-1.041,2.148c0,0.825,0.382,1.606,1.045,2.148c0.566,0.462,0.652,1.292,0.191,1.86c-0.262,0.32-0.642,0.488-1.025,0.488c-0.293,0-0.588-0.098-0.834-0.297c-1.283-1.043-2.02-2.574-2.02-4.199s0.737-3.156,2.015-4.199C39.514,30.04,39.517,30.035,39.519,30.035z"
      />
      <path
        class="steam steam-2"
        fill="#C9971C"
        d="M47.146,27.887c0,1.629,0.737,3.161,2.024,4.204c0.242,0.195,0.537,0.293,0.83,0.293c0.386,0,0.768-0.169,1.028-0.493c0.459-0.568,0.37-1.398-0.198-1.855c-0.661-0.537-1.041-1.323-1.041-2.148c0-0.825,0.382-1.611,1.045-2.148c1.283-1.043,2.02-2.575,2.02-4.204s-0.736-3.156-2.02-4.199c-0.664-0.537-1.045-1.323-1.045-2.148s0.382-1.611,1.045-2.153c0.566-0.457,0.652-1.287,0.191-1.855c-0.46-0.563-1.292-0.657-1.86-0.19c-1.283,1.043-2.02,2.57-2.02,4.199c0,1.625,0.737,3.156,2.02,4.199h0.002l0.002,0.005c0.662,0.537,1.041,1.318,1.041,2.144s-0.382,1.611-1.045,2.153C47.883,24.731,47.146,26.262,47.146,27.887z"
      />
      <path
        class="steam steam-3"
        fill="#C9971C"
        d="M58.815,30.035c-1.282,1.043-2.02,2.574-2.02,4.204c0,1.625,0.737,3.156,2.02,4.199c0.247,0.2,0.542,0.297,0.835,0.297c0.384,0,0.764-0.168,1.025-0.488c0.461-0.568,0.375-1.398-0.191-1.86c-0.661-0.542-1.043-1.323-1.043-2.148c0-0.83,0.382-1.611,1.043-2.153c1.283-1.039,2.02-2.57,2.02-4.199c0-1.625-0.736-3.156-2.02-4.199c-0.661-0.542-1.043-1.327-1.043-2.153s0.38-1.607,1.041-2.144c0.566-0.462,0.654-1.296,0.193-1.86c-0.457-0.568-1.287-0.657-1.857-0.195c-1.285,1.039-2.022,2.57-2.022,4.199s0.737,3.16,2.02,4.204c0.664,0.537,1.046,1.323,1.046,2.148c0,0.826-0.38,1.611-1.041,2.148H58.815z"
      />

      <!-- Plate (from your SVG, recolored gold) -->
      <g class="plate">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          fill="url(#goldGradient)"
          d="M95,86.668c0,1.46-1.184,2.641-2.642,2.641H7.643C6.185,89.309,5,88.128,5,86.668c0-1.465,1.185-2.646,2.643-2.646h3.564c1.309-19.366,16.816-34.861,36.19-36.153c-0.007-0.066-0.04-0.125-0.04-0.195v-1.42c0-1.46,1.183-2.641,2.643-2.641c1.46,0,2.643,1.181,2.643,2.641v1.42c0,0.071-0.033,0.129-0.04,0.195c19.375,1.292,34.882,16.787,36.19,36.153h3.564C93.816,84.022,95,85.203,95,86.668z M13.853,84.022h72.296C84.784,65.251,69.115,50.382,50,50.382S15.217,65.251,13.853,84.022z"
        />
        <!-- Shine highlight -->
        <path
          fill="#FCE8B3"
          opacity="0.7"
          d="M80.94,78.465c-1.583-6.378-4.979-12.135-9.812-16.645c-1.07-0.994-2.739-0.941-3.737,0.133c-0.997,1.065-0.937,2.739,0.128,3.737c4.088,3.805,6.951,8.665,8.287,14.049c0.3,1.203,1.378,2.006,2.565,2.006c0.211,0,0.427-0.026,0.64-0.075C80.428,81.314,81.291,79.881,80.94,78.465z"
        />
      </g>

      <defs>
        <linearGradient id="goldGradient" x1="50" y1="46" x2="50" y2="89" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#F4C542" />
          <stop offset="0.5" stop-color="#D4AF37" />
          <stop offset="1" stop-color="#B8860B" />
        </linearGradient>
      </defs>
    </svg>

    <p class="mt-3 text-sm text-[#2D2D2D]/70 font-medium">{{ message }}</p>

    <div class="flex gap-1.5 mt-2">
      <span class="dot dot-1"></span>
      <span class="dot dot-2"></span>
      <span class="dot dot-3"></span>
    </div>
  </div>
</template>

<style scoped>
.plate {
  transform-origin: 50px 68px;
  animation: wobble 1.8s ease-in-out infinite;
}

@keyframes wobble {
  0%, 100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}

.steam {
  transform-origin: bottom center;
  animation: steamRise 2s ease-in-out infinite;
  opacity: 0.5;
}

.steam-1 {
  animation-delay: 0s;
}

.steam-2 {
  animation-delay: 0.4s;
}

.steam-3 {
  animation-delay: 0.8s;
}

@keyframes steamRise {
  0% {
    opacity: 0;
    transform: translateY(6px);
  }
  30% {
    opacity: 0.7;
  }
  70% {
    opacity: 0.4;
  }
  100% {
    opacity: 0;
    transform: translateY(-8px);
  }
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #B8860B;
  animation: bounce 1.4s ease-in-out infinite;
}

.dot-1 {
  animation-delay: 0s;
}
.dot-2 {
  animation-delay: 0.2s;
}
.dot-3 {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  40% {
    transform: translateY(-6px);
    opacity: 1;
  }
}
</style>