
import json
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
import google.generativeai as genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load environment variables from .env file
load_dotenv()

def generate_recipe(ingredients, api_key):
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    prompt = (
        f" Hey, you are a well-versed chef. It is Saturday evening, and I am looking to cook dinner. "
        f"These are some ingredients in my pantry: {', '.join(ingredients)}. Generate one recipe using what I have; "
        f"it is not necessary to use everything. The output should be a JSON array of one element and should contain a recipe name field named 'name', "
        f"description field name named 'description', array of ingredients named 'ingredients', and array of step by step instructions named "
        f"instructions'. don't begin and end with ```JSON and ```. very important to be an array"
    )
    response = model.generate_content(prompt)
    return response.text

@app.route('/generate-recipes', methods=['POST'])
def generate_recipes():
    data = request.json
    ingredients = data.get('ingredients', [])
    api_key = os.getenv('GOOGLE_API_KEY')
    
    if not ingredients or not api_key:
        return jsonify({'error': 'Invalid input or API key not set'}), 400
    
    recipe = generate_recipe(ingredients, api_key)
    
    
    return {'recipe' : recipe}

if __name__ == '__main__':
    app.run(port=5000, debug=True)

