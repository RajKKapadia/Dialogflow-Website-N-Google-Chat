from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.requests import Request
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

from src.routes.health_route import router as health_router
from src.routes.widget_route import router as widget_router
from src.routes.chat_route import router as chat_router
from src import config

app = FastAPI()

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="src/templates")


@app.get("/")
async def handle_get_home():
    return RedirectResponse("/health/status")


@app.get("/test")
async def handle_get_chat(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")


app.include_router(health_router)
app.include_router(widget_router)
app.include_router(chat_router)
