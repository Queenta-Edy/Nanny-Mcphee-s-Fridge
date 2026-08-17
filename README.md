My fridgechef's name is Nanny Mcphee's Fridge. I choose this name because people used to call me that Nanny Mcphee because i used to have almost everything in my bag, so this project reminded me of that time.
However, this project is an AI-powered app that turns a photo of your fridge into food recipe ideas. With it, you take or upload a photo of your fridge, review the ingredients and their quantities the AI detects, and get recipes generated live based on what you have in your fridge.

So, to achiece this goal, i built:
        the frontend with Vue 3 and Tailwind CSS; 
        the backend: Node.js + Express handles all communication with the AI APIs and keeps the API keys secure.


the tech stack is: 
    
    Frontend: Vue 3 (Composition API)
    Styling: Tailwind CSS
    Backend: Node.js + Express
    AI Vision: OpenAI GPT-4o Vision API
    AI Recipes: OpenAI Chat Completions API (streamed)
    Ingredient photos: Pixabay API
    Markdown rendering: marked  

To run this app locally,
    1. I installed Node.js 18+ and npm

    2. I used an OpenAI API key with billing enabled 

    3. I also used a free Pixabay API key: pixabay.com/api/docs

    4. I cloned the repository: 
        git clone <your-repo-url>
        cd fridge-to-recipe

    5. I set up the backend:
        cd backend
        npm install

    6. I created a .env file inside backend with the following:
        PORT=3000
        OPENAI_API_KEY=your_openai_api_key_here
        PIXABAY_API_KEY=your_pixabay_api_key_here

    7. To start the backend server:
        npm run dev
        Then the server will run at http://localhost:3000.

    8. To set up the frontend:
        cd frontend
        npm install
        npm run dev
        Then the app will be available at http://localhost:5173.

    9. To be able to use the app:
      
        With both servers running, open http://localhost:5173 in your browser:

        Upload or take a photo of your fridge (max 5MB)
        Click Analyze My Fridge to detect ingredients and their estimated quantities
        Review the detected ingredients, grouped by category (Vegetables, Dairy, Drinks, Pantry, Other). Here you can add or remove any as needed
        Click Generate Recipes to stream the AI-generated recipes
        Click Save Recipe on any recipe to store it locally
        View saved recipes anytime under "My Recipes"


The AI Models I used, and why i used them:
    1. GPT-4o Vision (/api/detect/): analyzes the uploaded fridge photo, identifies visible food ingredients, and estimates the quantity of each, returned as structured JSON. GPT-4o was chosen because it natively supports image input alongside text in a single API call, and reliably follows instructions to return a specific JSON shape, which the frontend needs to build the ingredient cards.
    
    2. GPT-4o Chat Completions with streaming (/api/recipes): generates 3 recipes from the confirmed ingredient list. This endpoint uses stream: true so recipes appear progressively in the UI (via Server-Sent Events) rather than making the user wait for the full response, and one that also makes the app be more responsive.

        Both AI endpoints use the same model (gpt-4o) for consistency and simplicity, since it handles both vision and text generation well without needing to juggle multiple different models.

    3. A third backend route (/api/ingredient-image/) calls the Pixabay API (not an AI model) to fetch a real representative photo for each detected ingredient, keeping that API key server-side for the same security reasons as the OpenAI key.


My personal reflection

    What worked well?

        The part I enjoyed most was designing the UI, that is, picking the color palette (off-white, lime green, and warm accent colors for each ingredient category), building the custom SVG loading animation, and iterating on the ingredient cards until they felt fun rather than just functional. This was also the part that came together most smoothly for me; once the Tailwind setup was in place, styling and restyling components was quick, and I could see the results immediately.


    What was difficult?

        The most frustrating part was matching detected ingredients to real photos. AI-detected ingredient names dont always match cleanly against an external image APIs search terms (e.g. canned drinks vs. a specific product name), so I had to iterate through a few different approaches, by first trying a fixed ingredient database, then switching to a broader image search API routed through my own backend, with fallback styling for anything that still didnt match. It took several rounds of adjusting before the results looked consistently good.

    What would youdo differently, or what did you learn?

        I feel like I understand how the frontend, backend, and AI calls fit together, though I am still learning on some parts particularly around exactly how the streaming (SSE) response is read and reassembled on the frontend side. One concept I learned that I didnt know before this project is how base64 image encoding works, which is, converting an uploaded photo into a text string that can be sent as JSON in an API request, which is how the fridge photo gets from the browser to the backend to OpenAIs Vision API.

    Anything else worth mentioning?

        Overall, I am satisfied with what I built. It does what I want it to do whch is: take a photo, detect ingredients, and generate real recipes from them, with a nice UI. One known limitation is that ingredient quantity estimates from the AI are approximate (a visual guess, not an exact count), and a few ingredient images fall back to a colored placeholder when the image API doesnt have a good match for that specific item.
