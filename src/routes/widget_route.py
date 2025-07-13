from fastapi import APIRouter
from fastapi.responses import FileResponse
from fastapi import Request, HTTPException

from src import logging
from src import config

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/widget", tags=["widget"])


@router.get("/chatWidget.js", tags=["widget"])
async def handle_get_chat_widget(request: Request):
    referer = request.headers.get("referer")
    if not referer or not referer.startswith(config.ALLOWED_ORIGINS):
        logger.warning(f"Blocked chat_widget.js request from referer: {referer}")
        raise HTTPException(status_code=403, detail="Forbidden")
    return FileResponse(
        path="src/static/chat_widget.js",
        media_type="application/javascript",
        headers={
            "Cache-Control": "public, max-age=3600",
            "Content-Type": "application/javascript; charset=utf-8",
        },
    )
