from fastapi import FastAPI

app = FastAPI(title="PlaceIntel AI Service")

@app.get("/health")
def health_check():
    return {
        "status" : "ok",
        "service" : "placeintel-ai-service"
    }