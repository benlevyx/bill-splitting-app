from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import base64
from PIL import Image
import io
import os
import pillow_heif

# Register HEIF opener with Pillow
pillow_heif.register_heif_opener()

app = FastAPI(title="Bill Splitting API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BillItem(BaseModel):
    name: str
    price: float
    quantity: int = 1

class BillData(BaseModel):
    items: List[BillItem]
    tax: Optional[float] = None
    tip: Optional[float] = None

class SplitRequest(BaseModel):
    items: List[BillItem]
    tax: float
    tip: float
    people_count: int
    split_type: str

class ItemSplitRequest(BaseModel):
    items: List[BillItem]
    tax: float
    tip: float
    assignments: List[List[int]]

@app.get("/")
async def root():
    return {"message": "Bill Splitting API"}

@app.post("/parse-bill")
async def parse_bill(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/") and file.content_type != "image/heic":
        raise HTTPException(status_code=400, detail="File must be an image")
    
    contents = await file.read()
    
    # Convert HEIC to JPEG if needed
    media_type = file.content_type
    image_data = contents
    
    if file.content_type == "image/heic" or file.filename.lower().endswith(('.heic', '.heif')):
        try:
            # Open HEIC image with Pillow
            image = Image.open(io.BytesIO(contents))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Save as JPEG
            jpeg_buffer = io.BytesIO()
            image.save(jpeg_buffer, format='JPEG', quality=85)
            image_data = jpeg_buffer.getvalue()
            media_type = "image/jpeg"
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error converting HEIC image: {str(e)}")
    
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    base64_image = base64.b64encode(image_data).decode()
    
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": base64_image
                        }
                    },
                    {
                        "type": "text",
                        "text": "Parse this bill/receipt and extract all items with their names, prices, and quantities. Also identify the tax amount if shown. Return the response in this exact JSON format: {\"items\": [{\"name\": \"item name\", \"price\": 12.99, \"quantity\": 1}], \"tax\": 2.50}. Only return the JSON, no other text."
                    }
                ]
            }]
        )
        
        bill_text = response.content[0].text
        import json
        bill_data = json.loads(bill_text)
        return bill_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing bill: {str(e)}")

@app.post("/split-equal")
async def split_equal(request: SplitRequest):
    subtotal = sum(item.price * item.quantity for item in request.items)
    total = subtotal + request.tax + request.tip
    per_person = total / request.people_count
    
    return {
        "subtotal": subtotal,
        "tax": request.tax,
        "tip": request.tip,
        "total": total,
        "per_person": per_person,
        "tax_per_person": request.tax / request.people_count,
        "tip_per_person": request.tip / request.people_count
    }

@app.post("/split-by-item")
async def split_by_item(request: ItemSplitRequest):
    person_totals = [0.0] * len(request.assignments[0])
    
    for i, item in enumerate(request.items):
        assignment = request.assignments[i]
        people_count = sum(assignment)
        if people_count == 0:
            raise HTTPException(status_code=400, detail=f"Item '{item.name}' has no people assigned")
        
        item_total = item.price * item.quantity
        per_person_item = item_total / people_count
        
        for j, assigned in enumerate(assignment):
            if assigned:
                person_totals[j] += per_person_item
    
    tax_per_person = request.tax / len(person_totals)
    tip_per_person = request.tip / len(person_totals)
    
    final_totals = [
        total + tax_per_person + tip_per_person 
        for total in person_totals
    ]
    
    return {
        "person_subtotals": person_totals,
        "tax_per_person": tax_per_person,
        "tip_per_person": tip_per_person,
        "person_totals": final_totals,
        "total": sum(final_totals)
    }