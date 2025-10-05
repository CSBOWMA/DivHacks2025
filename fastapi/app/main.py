from fastapi import FastAPI
from app.routers import health, auth, fraud, accounts, forecasting, graph
from app.middleware_layer import add_middleware

app = FastAPI(title="OAuth Test App", version="1.0.0")

# Add middleware (CORS and Session)
add_middleware(app)

# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(fraud.router)
app.include_router(accounts.router)
app.include_router(forecasting.router)
app.include_router(graph.router)


@app.get("/health")
async def read_root():
    return {"message": "Healthy"}