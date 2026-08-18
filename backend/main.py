import os
import json
from contextlib import asynccontextmanager # <-- 1. Add this import
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any
from dotenv import load_dotenv
from google import genai
from google.genai import types

from datetime import datetime
# Add these to your existing imports
from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
import models
from database import get_db, engine, Base

# (Ensure this line exists to create the tables on startup)
Base.metadata.create_all(bind=engine)

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Everything before yield runs on STARTUP
    yield
    # Everything after yield runs on SHUTDOWN
    print("Shutting down... closing database connections.")
    engine.dispose() # Forcefully close all PostgreSQL connections

app = FastAPI(title="Voice Billing Backend", lifespan=lifespan)

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

# --- Response Schemas ---
class ItemResponse(BaseModel):
    id: int
    item_name: str
    quantity: int
    price: float
    total: float
    model_config = {"from_attributes": True}

class BillResponse(BaseModel):
    id: int
    customer_name: str
    address: str
    grand_total: float
    created_at: datetime
    items: List[ItemResponse] = []
    model_config = {"from_attributes": True}

class BillListResponse(BaseModel):
    id: int
    customer_name: str
    address: str
    grand_total: float
    created_at: datetime
    model_config = {"from_attributes": True}

# --- CRUD Endpoints ---
# Add this new paginated wrapper schema
class PaginatedBillResponse(BaseModel):
    total: int
    page: int
    limit: int
    data: List[BillListResponse]

@app.get("/api/bills", response_model=PaginatedBillResponse)
def get_all_bills(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    search: str = "",
    sort_by: str = "created_at",
    sort_desc: bool = True
):
    """Fetch paginated, sorted, and filtered bills."""
    query = db.query(models.Bill)

    # 1. Apply Search Filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Bill.customer_name.ilike(search_term),
                models.Bill.address.ilike(search_term)
            )
        )

    # 2. Get Total Count (before pagination)
    total_records = query.count()

    # 3. Apply Sorting
    if hasattr(models.Bill, sort_by):
        sort_column = getattr(models.Bill, sort_by)
        if sort_desc:
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(models.Bill.created_at.desc())

    # 4. Apply Pagination
    offset = (page - 1) * limit
    bills = query.offset(offset).limit(limit).all()

    return {
        "total": total_records,
        "page": page,
        "limit": limit,
        "data": bills
    }

@app.post("/api/save-bill")
def save_new_bill(bill_data: BillingSchema, db: Session = Depends(get_db)):
    """Create a brand new bill"""
    try:
        # Calculate the grand total
        grand_total = sum(item.quantity * item.price for item in bill_data.items)

        # Create the parent Bill record
        new_bill = models.Bill(
            customer_name=bill_data.customer_name,
            address=bill_data.address,
            grand_total=grand_total
        )
        db.add(new_bill)
        db.flush() # Flushes to DB to generate the new_bill.id

        # Create the Line Item records tied to the parent bill
        for item in bill_data.items:
            new_item = models.Item(
                bill_id=new_bill.id,
                item_name=item.item_name,
                quantity=item.quantity,
                price=item.price,
                total=item.quantity * item.price
            )
            db.add(new_item)

        # Commit the transaction
        db.commit()
        db.refresh(new_bill)

        return {
            "status": "success",
            "message": "Bill saved to database successfully!",
            "bill_id": new_bill.id,
            "grand_total": new_bill.grand_total
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bills/{bill_id}", response_model=BillResponse)
def get_single_bill(bill_id: int, db: Session = Depends(get_db)):
    """Fetch a single bill with its line items for Editing."""
    bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

@app.put("/api/save-bill/{bill_id}")
def update_bill(bill_id: int, bill_data: BillingSchema, db: Session = Depends(get_db)):
    """Update an existing bill (Delete old items, insert new items)."""
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")

    try:
        # Update parent record
        db_bill.customer_name = bill_data.customer_name
        db_bill.address = bill_data.address
        db_bill.grand_total = sum(item.quantity * item.price for item in bill_data.items)

        # Clear existing line items
        db.query(models.Item).filter(models.Item.bill_id == bill_id).delete()

        # Insert new line items
        for item in bill_data.items:
            new_item = models.Item(
                bill_id=bill_id,
                item_name=item.item_name,
                quantity=item.quantity,
                price=item.price,
                total=item.quantity * item.price
            )
            db.add(new_item)

        db.commit()
        return {"status": "success", "message": "Bill updated successfully!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/bills/{bill_id}")
def delete_bill(bill_id: int, db: Session = Depends(get_db)):
    """Delete a bill (Cascade deletes items automatically)."""
    db_bill = db.query(models.Bill).filter(models.Bill.id == bill_id).first()
    if not db_bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    
    db.delete(db_bill)
    db.commit()
    return {"status": "success", "message": "Bill deleted"}


    """Create a brand new bill"""
    try:
        # Calculate the grand total
        grand_total = sum(item.quantity * item.price for item in bill_data.items)

        # Create the parent Bill record
        new_bill = models.Bill(
            customer_name=bill_data.customer_name,
            address=bill_data.address,
            grand_total=grand_total
        )
        db.add(new_bill)
        db.flush() # Flushes to DB to generate the new_bill.id

        # Create the Line Item records tied to the parent bill
        for item in bill_data.items:
            new_item = models.Item(
                bill_id=new_bill.id,
                item_name=item.item_name,
                quantity=item.quantity,
                price=item.price,
                total=item.quantity * item.price
            )
            db.add(new_item)

        # Commit the transaction
        db.commit()
        db.refresh(new_bill)

        return {
            "status": "success",
            "message": "Bill saved to database successfully!",
            "bill_id": new_bill.id,
            "grand_total": new_bill.grand_total
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    """Create a brand new bill"""
    try:
        grand_total = sum(item.quantity * item.price for item in bill_data.items)

        new_bill = models.Bill(
            customer_name=bill_data.customer_name,
            address=bill_data.address,
            grand_total=grand_total
        )
        db.add(new_bill)
        db.flush() # Generate the ID

        for item in bill_data.items:
            new_item = models.Item(
                bill_id=new_bill.id,
                item_name=item.item_name,
                quantity=item.quantity,
                price=item.price,
                total=item.quantity * item.price
            )
            db.add(new_item)

        db.commit()
        db.refresh(new_bill)

        return {
            "status": "success",
            "message": "Bill saved to database successfully!",
            "bill_id": new_bill.id,
            "grand_total": new_bill.grand_total
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))