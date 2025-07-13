from google.cloud import dialogflow
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from src import config
from src.schemas import DetectIntentResponse
from src import logging


logger = logging.getLogger(__name__)


CREDENTIALS = service_account.Credentials.from_service_account_info(
    info=config.SERVICE_ACCOUNT_JSON
)


async def detect_intent_from_text(
    text_input: str, session_id: str, language_code: str = "en-US"
) -> DetectIntentResponse:
    """
    Detects intent from text input using Dialogflow ES.

    Args:
        text_input (str): The text message to analyze
        session_id (str): Unique identifier for the conversation session
        language_code (str): Language code (default: "en-US")

    Returns:
        dict: Dictionary containing intent detection results
    """
    try:
        # Initialize the session client
        session_client = dialogflow.SessionsClient(credentials=CREDENTIALS)

        # Create session path
        session_path = session_client.session_path(config.PROJECT_ID, session_id)

        # Create text input configuration
        text_input_config = dialogflow.TextInput(
            text=text_input, language_code=language_code
        )

        # Create query input
        query_input = dialogflow.QueryInput(text=text_input_config)

        # Detect intent
        response = session_client.detect_intent(
            request={"session": session_path, "query_input": query_input}
        )

        # Extract relevant information
        detect_intent_response = DetectIntentResponse(
            query_text=response.query_result.query_text,
            fulfillment_text=response.query_result.fulfillment_text,
            session_id=session_id,
            status=True,
        )

        return detect_intent_response

    except Exception as e:
        logger.debug("Error at -> detect_intent_from_text")
        logger.error(e)
        return DetectIntentResponse(
            status=False,
            fulfillment_text="We are facing an issue detecting intent of your query at this moment.",
        )


SCOPES = ["https://www.googleapis.com/auth/chat.bot"]

CREDENTIALS_W_SCOPE = service_account.Credentials.from_service_account_info(
    info=config.SERVICE_ACCOUNT_JSON, scopes=SCOPES
)


async def send_google_chat_message(space_name: str, message_text: str) -> None:
    """
    Send a message to a Google Chat space using a service account.

    Args:
        service_account_file (str): Path to the service account JSON file
        space_name (str): The space name (e.g., 'spaces/AAAAxxxxxxx')
        message_text (str): The message text to send

    Returns:
        dict: Response from the API or None if failed
    """
    try:
        # Build the Chat API service
        service = build("chat", "v1", credentials=CREDENTIALS_W_SCOPE)

        # Create the message body
        message = {"text": message_text}

        # Send the message
        response = (
            await service.spaces()
            .messages()
            .create(parent=space_name, body=message)
            .execute()
        )

        print(f"Message sent successfully: {response.get('name')}")
        return response

    except HttpError as error:
        print(f"An HTTP error occurred: {error}")
        return None
    except Exception as error:
        print(f"An error occurred: {error}")
        return None
