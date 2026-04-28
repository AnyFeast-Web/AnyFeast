from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

# Import Route Controllers
from api.routes import clients
from api.routes import mealplans
from api.routes import consultations
from api.routes import dashboard
from api.routes import ingredients
from api.routes import webhooks
from api.routes import messages
from api.routes import auth
app = FastAPI(title=settings.PROJECT_NAME)

# CORS Middleware (crucial for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to standard domains (e.g. localhost:5173, app.anyfeast.com)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Application Routes Registry
app.include_router(clients.router, prefix=f"{settings.API_V1_STR}/clients", tags=["Clients"])
app.include_router(mealplans.router, prefix=f"{settings.API_V1_STR}/mealplans", tags=["Meal Plans"])
app.include_router(consultations.router, prefix=f"{settings.API_V1_STR}/consultations", tags=["Consultations"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["Dashboard"])
app.include_router(ingredients.router, prefix=f"{settings.API_V1_STR}/ingredients", tags=["Ingredients"])
app.include_router(webhooks.router, prefix=f"{settings.API_V1_STR}/webhooks", tags=["Automations"])
app.include_router(messages.router, prefix=f"{settings.API_V1_STR}/messages", tags=["SMS Chat"])
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])

@app.get("/")
def root():
    return {"message": "Welcome to the AnyFeast FastAPI Server. Visit /docs to view schemas."}
