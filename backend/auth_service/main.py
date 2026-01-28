import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Auth service running"}


@app.get("/hello")
def hello():
    return {"message": "this is hello endpoint"}


@app.post("/analyze")
def hello():
    return {"message": "this is analyze endpoint"}




# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)  # <-- important
