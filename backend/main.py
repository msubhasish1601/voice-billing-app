import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(title="Voice Billing Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# 1. Stricter Field Description
class BillItem(BaseModel):
    item_name: str = Field(description="Normalized product or service name")
    quantity: int = Field(description="Quantity ordered as an integer (e.g., 'two' -> 2, 'one' -> 1)")
    price: float = Field(description="Unit price of the item as a positive float (e.g., 'at 25' -> 25.0, '3.5 0' -> 3.50). MUST NOT be 0 if a price number was stated.")

class BillingSchema(BaseModel):
    customer_name: str = Field(description="Full name of the customer verbatim")
    address: str = Field(description="Normalized full billing address")
    items: List[BillItem] = Field(description="All line items on the bill")

class IncrementalTranscriptRequest(BaseModel):
    transcript: str
    current_bill: Optional[Any] = None

    @field_validator("current_bill", mode="before")
    @classmethod
    def normalize_empty_bill(cls, value):
        if value == "" or value is None:
            return None
        return value

@app.post("/api/parse-bill", response_model=BillingSchema)
async def parse_bill(data: IncrementalTranscriptRequest):
    current_context = ""
    if data.current_bill:
        if isinstance(data.current_bill, dict):
            current_context = f"Current Existing Bill State:\n{json.dumps(data.current_bill)}\n"
        elif hasattr(data.current_bill, "model_dump_json"):
            current_context = f"Current Existing Bill State:\n{data.current_bill.model_dump_json()}\n"

    prompt = f"""
    You are an intelligent billing parser, postal address corrector, and acoustic error-correction engine.
    Extract customer details and ALL billable items with their exact quantity and price.

    {current_context}
    Incoming Voice Transcript:
    "{data.transcript}"

    CRITICAL PRICE & QUANTITY EXTRACTION RULES:
    1. PRICE BINDING:
       - Patterns like "at 25", "at 3.5 0 each", "costing 50", "for 10", "@ 15" represent the UNIT PRICE of the preceding item.
       - NEVER output a price of 0 or omit price if a number follows the item description (e.g. "one disc lamp at 25" -> item_name: "desk lamp", quantity: 1, price: 25.0).
       - Parse broken decimals like "3.5 0" into 3.50.

    2. ADDRESS & PHONETIC REPAIR:
       - "45 or Charlie" / "45 Orchid laid" -> "45 Orchid Lane"
       - "disc lamp" / "declamp" / "disclaim" -> "desk lamp"

    3. QUANTITIES:
       - "two", "to", "too" -> 2
       - "one", "won", "a" -> 1
       - "three" -> 3

    4. STATE MERGING:
       - Append new items to existing ones, update modified ones, and preserve customer/address data.
    """

    try:
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=BillingSchema,
            ),
        )
        return BillingSchema.model_validate_json(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))