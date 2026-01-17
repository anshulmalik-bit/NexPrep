from PIL import Image
import os

def crop_transparency(path):
    print(f"Processing {path}...")
    try:
        img = Image.open(path)
        img = img.convert("RGBA")
        
        # Get bounding box of non-zero alpha pixels
        bbox = img.getbbox()
        
        if bbox:
            print(f"Original Size: {img.size}")
            print(f"Cropping to: {bbox}")
            
            cropped = img.crop(bbox)
            print(f"New Size: {cropped.size}")
            
            cropped.save(path)
            print("Successfully cropped and overwritten.")
        else:
            print("Image is fully transparent or empty. No crop needed.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    target_path = r"c:\Users\n\.gemini\antigravity\playground\blazing-aldrin\client\public\quinn-knot.png"
    crop_transparency(target_path)
