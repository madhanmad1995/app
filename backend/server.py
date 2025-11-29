from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, date, time

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class Worker(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    worker_id: str
    daily_wage_rate: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class WorkerCreate(BaseModel):
    name: str
    worker_id: str
    daily_wage_rate: float

class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    worker_id: Optional[str] = None
    daily_wage_rate: Optional[float] = None

class Attendance(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    worker_id: str
    worker_name: str
    date: str
    clock_in: Optional[str] = None
    clock_out: Optional[str] = None
    hours_worked: float = 0.0
    wage_earned: float = 0.0
    status: str = "absent"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AttendanceCreate(BaseModel):
    worker_id: str
    clock_in: Optional[str] = None
    clock_out: Optional[str] = None

class DashboardStats(BaseModel):
    total_workers: int
    present_today: int
    absent_today: int
    total_hours_today: float
    total_wages_today: float

# Worker Endpoints
@api_router.post("/workers", response_model=Worker)
async def create_worker(worker: WorkerCreate):
    existing = await db.workers.find_one({"worker_id": worker.worker_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Worker ID already exists")
    
    worker_obj = Worker(**worker.model_dump())
    doc = worker_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.workers.insert_one(doc)
    return worker_obj

@api_router.get("/workers", response_model=List[Worker])
async def get_workers():
    workers = await db.workers.find({}, {"_id": 0}).to_list(1000)
    for worker in workers:
        if isinstance(worker.get('created_at'), str):
            worker['created_at'] = datetime.fromisoformat(worker['created_at'])
    return workers

@api_router.get("/workers/{worker_id}", response_model=Worker)
async def get_worker(worker_id: str):
    worker = await db.workers.find_one({"id": worker_id}, {"_id": 0})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    if isinstance(worker.get('created_at'), str):
        worker['created_at'] = datetime.fromisoformat(worker['created_at'])
    return worker

@api_router.put("/workers/{worker_id}", response_model=Worker)
async def update_worker(worker_id: str, worker_update: WorkerUpdate):
    worker = await db.workers.find_one({"id": worker_id}, {"_id": 0})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    update_data = {k: v for k, v in worker_update.model_dump().items() if v is not None}
    if update_data:
        await db.workers.update_one({"id": worker_id}, {"$set": update_data})
    
    updated_worker = await db.workers.find_one({"id": worker_id}, {"_id": 0})
    if isinstance(updated_worker.get('created_at'), str):
        updated_worker['created_at'] = datetime.fromisoformat(updated_worker['created_at'])
    return updated_worker

@api_router.delete("/workers/{worker_id}")
async def delete_worker(worker_id: str):
    result = await db.workers.delete_one({"id": worker_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Worker not found")
    return {"message": "Worker deleted successfully"}

# Attendance Endpoints
@api_router.post("/attendance", response_model=Attendance)
async def mark_attendance(attendance: AttendanceCreate):
    worker = await db.workers.find_one({"id": attendance.worker_id}, {"_id": 0})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    today = datetime.now(timezone.utc).date().isoformat()
    existing = await db.attendance.find_one({"worker_id": attendance.worker_id, "date": today}, {"_id": 0})
    
    hours_worked = 0.0
    wage_earned = 0.0
    status = "absent"
    
    if attendance.clock_in and attendance.clock_out:
        clock_in_time = datetime.fromisoformat(attendance.clock_in)
        clock_out_time = datetime.fromisoformat(attendance.clock_out)
        hours_worked = (clock_out_time - clock_in_time).total_seconds() / 3600
        wage_earned = hours_worked * worker['daily_wage_rate']
        status = "present"
    elif attendance.clock_in:
        status = "clocked_in"
    
    attendance_obj = Attendance(
        worker_id=attendance.worker_id,
        worker_name=worker['name'],
        date=today,
        clock_in=attendance.clock_in,
        clock_out=attendance.clock_out,
        hours_worked=round(hours_worked, 2),
        wage_earned=round(wage_earned, 2),
        status=status
    )
    
    doc = attendance_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    if existing:
        await db.attendance.update_one(
            {"worker_id": attendance.worker_id, "date": today},
            {"$set": doc}
        )
    else:
        await db.attendance.insert_one(doc)
    
    return attendance_obj

@api_router.get("/attendance/today", response_model=List[Attendance])
async def get_today_attendance():
    today = datetime.now(timezone.utc).date().isoformat()
    attendance = await db.attendance.find({"date": today}, {"_id": 0}).to_list(1000)
    for att in attendance:
        if isinstance(att.get('created_at'), str):
            att['created_at'] = datetime.fromisoformat(att['created_at'])
    return attendance

@api_router.get("/attendance/date/{date_str}", response_model=List[Attendance])
async def get_attendance_by_date(date_str: str):
    attendance = await db.attendance.find({"date": date_str}, {"_id": 0}).to_list(1000)
    for att in attendance:
        if isinstance(att.get('created_at'), str):
            att['created_at'] = datetime.fromisoformat(att['created_at'])
    return attendance

@api_router.get("/attendance/monthly/{year}/{month}")
async def get_monthly_report(year: int, month: int):
    workers = await db.workers.find({}, {"_id": 0}).to_list(1000)
    report = []
    
    for worker in workers:
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year+1}-01-01"
        else:
            end_date = f"{year}-{month+1:02d}-01"
        
        attendance = await db.attendance.find({
            "worker_id": worker['id'],
            "date": {"$gte": start_date, "$lt": end_date}
        }, {"_id": 0}).to_list(1000)
        
        total_days = len(attendance)
        present_days = len([a for a in attendance if a['status'] == 'present'])
        total_hours = sum(a.get('hours_worked', 0) for a in attendance)
        total_wages = sum(a.get('wage_earned', 0) for a in attendance)
        
        report.append({
            "worker_id": worker['id'],
            "worker_name": worker['name'],
            "worker_number": worker['worker_id'],
            "daily_wage_rate": worker['daily_wage_rate'],
            "total_days": total_days,
            "present_days": present_days,
            "absent_days": total_days - present_days if total_days > present_days else 0,
            "total_hours": round(total_hours, 2),
            "total_wages": round(total_wages, 2)
        })
    
    return report

@api_router.get("/attendance/worker/{worker_id}", response_model=List[Attendance])
async def get_worker_attendance(worker_id: str):
    attendance = await db.attendance.find({"worker_id": worker_id}, {"_id": 0}).sort("date", -1).to_list(1000)
    for att in attendance:
        if isinstance(att.get('created_at'), str):
            att['created_at'] = datetime.fromisoformat(att['created_at'])
    return attendance

@api_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    total_workers = await db.workers.count_documents({})
    today = datetime.now(timezone.utc).date().isoformat()
    today_attendance = await db.attendance.find({"date": today}, {"_id": 0}).to_list(1000)
    
    present_today = len([a for a in today_attendance if a['status'] in ['present', 'clocked_in']])
    absent_today = total_workers - present_today
    total_hours_today = sum(a.get('hours_worked', 0) for a in today_attendance)
    total_wages_today = sum(a.get('wage_earned', 0) for a in today_attendance)
    
    return DashboardStats(
        total_workers=total_workers,
        present_today=present_today,
        absent_today=absent_today,
        total_hours_today=round(total_hours_today, 2),
        total_wages_today=round(total_wages_today, 2)
    )

@api_router.get("/")
async def root():
    return {"message": "WageFlow API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()