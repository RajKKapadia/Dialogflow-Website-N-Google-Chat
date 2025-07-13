from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi import Body

from src.utils import detect_intent_from_text, send_google_chat_message
from src import logging
from src import config

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", tags=["chat"])
async def handle_post_message(request: Request, data: dict = Body(...)):
    origin = request.headers.get("origin")
    if origin != config.ALLOWED_ORIGINS:
        logger.warning(f"Blocked /chat/message request from origin: {origin}")
        raise HTTPException(status_code=403, detail="Forbidden")
    text_input = data.get("message")
    session_id = data.get("session_id", "abcd-efgh-1234-5678")
    detect_intent_response = await detect_intent_from_text(
        text_input=text_input, session_id=session_id
    )

    if detect_intent_response.status:
        # await send_google_chat_message(
        #     space_name="test", message_text=detect_intent_response.fulfillment_text
        # )
        return {"status": "success", "response": detect_intent_response.fulfillment_text}
    else:
        logger.error(f"Error detecting intent.")
        # await send_google_chat_message(
        #     space_name="test", message_text=detect_intent_response.error
        # )
        return {"status": "error", "response": "Error detecting intent."}
        