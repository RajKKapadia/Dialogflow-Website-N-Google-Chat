from fastapi import APIRouter

from src import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/status", tags=["health"])
async def handle_get_status():
    logger.debug("Health check endpoint called")
    return {"message": "Application working okay."}
