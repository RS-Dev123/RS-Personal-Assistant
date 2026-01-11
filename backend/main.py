from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os

# ---------- OPENAI CLIENT ----------
client = OpenAI()  # uses OPENAI_API_KEY from environment

# ---------- APP ----------
app = FastAPI(title="RS AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # replace with Netlify URL later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- SCHEMAS ----------
class ChatRequest(BaseModel):
    message: str

class ImageRequest(BaseModel):
    prompt: str

# ---------- CHAT ----------
@app.post("/chat")
def chat(req: ChatRequest):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are RS Personal Assistant."},
            {"role": "user", "content": req.message},
        ],
    )
    return {"reply": response.choices[0].message.content}

# ---------- IMAGE ----------
@app.post("/generate-image")
def generate_image(req: ImageRequest):
    result = client.images.generate(
        model="gpt-image-1",
        prompt=req.prompt,
        size="1024x1024",
    )
    return {"image_url": result.data[0].url}
