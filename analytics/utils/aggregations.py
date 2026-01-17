from bson import ObjectId
from datetime import datetime
from typing import Optional

def get_user_stats_pipeline(user_id: str):
    """
    Aggregation pipeline to get user statistics
    Returns total tasks, completed, pending, completion rate, and breakdown by priority
    """
    return [
        {
            '$match': {
                'userId': ObjectId(user_id)
            }
        },
        {
            '$facet': {
                'statusCounts': [
                    {
                        '$group': {
                            '_id': '$status',
                            'count': {'$sum': 1}
                        }
                    }
                ],
                'priorityCounts': [
                    {
                        '$group': {
                            '_id': '$priority',
                            'count': {'$sum': 1}
                        }
                    }
                ],
                'totalCount': [
                    {
                        '$count': 'total'
                    }
                ]
            }
        }
    ]

def get_productivity_pipeline(user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """
    Aggregation pipeline to get productivity over time
    Returns completed tasks grouped by date
    """
    match_stage = {
        'userId': ObjectId(user_id),
        'status': 'Completed',
        'completedAt': {'$exists': True, '$ne': None}
    }
    
    # Add date range filter if provided
    if start_date or end_date:
        date_filter = {}
        if start_date:
            date_filter['$gte'] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            date_filter['$lte'] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        if date_filter:
            match_stage['completedAt'].update(date_filter)
    
    return [
        {
            '$match': match_stage
        },
        {
            '$group': {
                '_id': {
                    '$dateToString': {
                        'format': '%Y-%m-%d',
                        'date': '$completedAt'
                    }
                },
                'completed': {'$sum': 1}
            }
        },
        {
            '$sort': {'_id': 1}
        },
        {
            '$project': {
                '_id': 0,
                'date': '$_id',
                'completed': 1
            }
        }
    ]
