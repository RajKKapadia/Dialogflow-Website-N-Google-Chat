import os
import json

from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

SERVICE_ACCOUNT_JSON = json.loads(os.getenv("SERVICE_ACCOUNT_JSON"))
PROJECT_ID = os.getenv("PROJECT_ID")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")
