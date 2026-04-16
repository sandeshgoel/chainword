import os
import json
import re
from collections import Counter

def extract_js_variable(filepath, variable_name):
    """
    Extracts the value of a given variable from a given javascript file.
    Assumes the value is a JSON-serializable structure like an array or object.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        data = f.read()

    # Find the declaration of the variable: start matching at `[var|let|const] name = `
    pattern = r'(?:export\s+)?(?:const|let|var)\s+' + re.escape(variable_name) + r'\s*=\s*(.*)'
    match = re.search(pattern, data, re.DOTALL)
    
    if not match:
        raise ValueError(f"Variable '{variable_name}' not found in {filepath}")
    
    content = match.group(1).strip()
    
    # Try to find the matching brackets to extract just the value portion
    if content.startswith('['):
        open_char, close_char = '[', ']'
    elif content.startswith('{'):
        open_char, close_char = '{', '}'
    else:
        # Extract until semicolon or newline for primitives
        val_match = re.search(r'(.*?)(?:;|\n|$)', content)
        if not val_match:
            raise ValueError("Could not parse value structure")
        val_str = val_match.group(1).strip()
        try:
            return json.loads(val_str)
        except json.JSONDecodeError:
            # Maybe it's a string mapped with single quotes, etc
            # Return as is
            return val_str.strip("'\"")

    # Find matching brace/bracket
    depth = 0
    end_index = -1
    for i, char in enumerate(content):
        if char == open_char:
            depth += 1
        elif char == close_char:
            depth -= 1
            if depth == 0:
                end_index = i
                break
                
    if end_index == -1:
        raise ValueError(f"Could not find matching {close_char} for variable '{variable_name}'")
        
    val_str = content[:end_index+1]
    
    # Clean up trailing commas which are valid in JS but invalid in JSON
    val_str = re.sub(r',\s*]', ']', val_str)
    val_str = re.sub(r',\s*}', '}', val_str)
    
    try:
        return json.loads(val_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Could not parse extracted value as JSON: {e}\nValue parsed:\n{val_str[:100]}...")


def check_words(tiles):
    valid_words_path = os.path.join(os.path.dirname(__file__), '../src/validWords.js')
    valid_words = extract_js_variable(valid_words_path, 'VALID_WORDS')
    print(f'Total valid words: {len(valid_words)}')
    
    # Pre-calculate counts of characters for each word for efficiency
    # Words in validWords.js are lowercase; tiles use uppercase, so we'll standardize on uppercase
    word_counts = [(word.upper(), Counter(word.upper())) for word in valid_words]
    
    valid_tiles = []
    
    for tile in tiles:
        t_counts = Counter(tile)
        formed_count = 0
        
        for _, w_counts in word_counts:
            # Check if all characters in the word are available in the tile in sufficient quantity
            can_form = True
            for char, count in w_counts.items():
                if t_counts.get(char, 0) < count:
                    can_form = False
                    break
            
            if can_form:
                formed_count += 1
                if formed_count >= 5:
                    break
                    
        if formed_count >= 5:
            valid_tiles.append(tile)

    print(f"Found {len(valid_tiles)} tiles out of {len(tiles)} that can form at least 5 words.")
    return valid_tiles


if __name__ == "__main__":
    # Test the function using a relative path evaluated from the current script location
    filepath = os.path.join(os.path.dirname(__file__), '../src/games/tiles/data/tilesData.js')
    if os.path.exists(filepath):
        try:
            tiles = extract_js_variable(filepath, 'DAILY_TILES')
            print(f"Successfully extracted {len(tiles)} tiles.")
            print(f"First 5 tiles: {tiles[:5]}")
            
            valid_tiles = check_words(tiles)
            print("First 10 valid_tiles:", valid_tiles[:10])
        except Exception as e:
            print("Error validating function:", e)
    else:
        print("Required file was not found")

    # Output the valid tiles to validTilesData.js
    if 'valid_tiles' in locals():
        out_path = os.path.join(os.path.dirname(__file__), '../src/games/tiles/data/validTilesData.js')
        js_content = "export const DAILY_TILES = [\n"
        for tile in valid_tiles:
            js_content += f'  "{tile}",\n'
        js_content += "];\n"
        
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(js_content)
        print(f"Successfully wrote valid_tiles to {out_path}")
