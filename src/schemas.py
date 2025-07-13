from pydantic import BaseModel


class DetectIntentResponse(BaseModel):
    status: bool
    query_text: str = None
    fulfillment_text: str = None
    session_id: str = None
