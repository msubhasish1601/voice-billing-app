from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Bill(Base):
    __tablename__ = "bills"

    # Fixed: primary_key=True
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, index=True)
    address = Column(String)
    grand_total = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("Item", back_populates="bill", cascade="all, delete-orphan")

class Item(Base):
    __tablename__ = "bill_items"

    # Fixed: primary_key=True
    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id"))
    item_name = Column(String, index=True)
    quantity = Column(Integer)
    price = Column(Float)
    total = Column(Float)

    bill = relationship("Bill", back_populates="items")