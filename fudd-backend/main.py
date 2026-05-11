from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import router

app = FastAPI(title="FUDD Finance Studio", description="Modular Quantitative Financial Models")

# ----- CORS CONFIGURATION -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fudd-financial-unified-data-dashboard.netlify.app",
        "http://localhost:3000",
        "http://localhost:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "engine": "modular-numpy"}

@app.get("/")
def root():
    return {"message": "FUDD is alive. Modular engines loaded.", "status": "institutional grade"}

# Include the modular API router
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
