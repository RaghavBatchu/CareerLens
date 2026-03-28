from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume, culture, roadmap

app = FastAPI(title="CareerLens ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/ml")
app.include_router(culture.router, prefix="/ml")
app.include_router(roadmap.router, prefix="/ml")


@app.get("/health")
def health():
    return {"status": "ok"}
