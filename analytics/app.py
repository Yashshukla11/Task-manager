from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from bson.errors import InvalidId
from typing import Optional
import os
from dotenv import load_dotenv

from utils.db import get_tasks_collection
from utils.aggregations import get_user_stats_pipeline, get_productivity_pipeline

load_dotenv()

app = FastAPI(
    title="QuickTask Analytics API",
    description="Analytics microservice for QuickTask application",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "service": "QuickTask Analytics API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/analytics/user-stats/{user_id}")
def get_user_stats(user_id: str):
    """
    Get comprehensive statistics for a user
    Returns: total tasks, completed, pending, completion rate, breakdown by priority
    """
    try:
        # Validate ObjectId
        try:
            ObjectId(user_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        tasks_collection = get_tasks_collection()
        pipeline = get_user_stats_pipeline(user_id)
        
        try:
            result = list(tasks_collection.aggregate(pipeline))
        except Exception as db_error:
            print(f"Database error: {db_error}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
        
        if not result:
            return {
                "userId": user_id,
                "totalTasks": 0,
                "completed": 0,
                "pending": 0,
                "inProgress": 0,
                "completionRate": 0,
                "byPriority": {
                    "Low": 0,
                    "Medium": 0,
                    "High": 0
                }
            }
        
        data = result[0]
        
        # Process status counts
        status_counts = {item['_id']: item['count'] for item in data.get('statusCounts', [])}
        completed = status_counts.get('Completed', 0)
        pending = status_counts.get('Todo', 0)
        in_progress = status_counts.get('In Progress', 0)
        
        # Process priority counts
        priority_counts = {item['_id']: item['count'] for item in data.get('priorityCounts', [])}
        
        # Calculate total
        total_tasks = data['totalCount'][0]['total'] if data.get('totalCount') else 0
        
        # Calculate completion rate
        completion_rate = round((completed / total_tasks * 100), 2) if total_tasks > 0 else 0
        
        return {
            "userId": user_id,
            "totalTasks": total_tasks,
            "completed": completed,
            "pending": pending,
            "inProgress": in_progress,
            "completionRate": completion_rate,
            "byPriority": {
                "Low": priority_counts.get('Low', 0),
                "Medium": priority_counts.get('Medium', 0),
                "High": priority_counts.get('High', 0)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in get_user_stats: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/analytics/productivity/{user_id}")
def get_productivity(
    user_id: str,
    start: Optional[str] = Query(None, description="Start date (ISO format: YYYY-MM-DD)"),
    end: Optional[str] = Query(None, description="End date (ISO format: YYYY-MM-DD)")
):
    """
    Get productivity statistics over time
    Returns: time series of completed tasks per day
    """
    try:
        # Validate ObjectId
        try:
            ObjectId(user_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        tasks_collection = get_tasks_collection()
        pipeline = get_productivity_pipeline(user_id, start, end)
        
        try:
            series = list(tasks_collection.aggregate(pipeline))
        except Exception as db_error:
            print(f"Database error: {db_error}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(db_error)}")
        
        total_completed = sum(item['completed'] for item in series)
        
        return {
            "userId": user_id,
            "series": series,
            "totalCompleted": total_completed,
            "dateRange": {
                "start": start,
                "end": end
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in get_productivity: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
