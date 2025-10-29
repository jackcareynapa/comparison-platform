from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict, Optional
import json, os, httpx
import re
from data_loader import load_developers 

router = APIRouter()

# Dev data route
@router.get("/developers")
def get_developers():
    try:
        data = load_developers()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# AI route
class DevPair(BaseModel):
    developerA: Dict[str, Any]
    developerB: Dict[str, Any]
    trimFields: Optional[list] = None


OPENAI_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_URL = "https://api.openai.com/v1/responses"
OPENAI_MODEL = "gpt-4o-mini"

async def call_openai(prompt: str):
    if not OPENAI_KEY:
        raise HTTPException(status_code=500, detail="Missing OpenAI API key.")
    payload = {"model": OPENAI_MODEL, "input": prompt, "temperature": 0.2, "max_output_tokens": 800}
    headers = {"Authorization": f"Bearer {OPENAI_KEY}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=40) as client:
        r = await client.post(OPENAI_URL, headers=headers, json=payload)
        if r.status_code >= 400:
            raise HTTPException(status_code=502, detail=f"OpenAI error: {r.text}")
        return r.json()

def build_prompt(devA, devB):
    return (
        "You are an experienced renewable-energy market analyst specializing in solar development.\n\n"
        "Compare the following two solar developers in depth. Use the data provided to identify "
        "meaningful differences in scale, focus, financial or operational maturity, and regional or technological expertise.\n\n"
        "Base your reasoning only on the information given, but make logical inferences where appropriate "
        "(for example, project size → target market segment, regions → permitting complexity, service offerings → business model).\n\n"
        "Be concise but insightful — emphasize **what each company does differently**, **why that matters**, "
        "and **which would be a better fit** under different project conditions.\n\n"
        "Then structure your output clearly using markdown sections:\n"
        "### Overview\n"
        "Short description of each company’s apparent profile.\n\n"
        "### Key Comparative Insights\n"
        "At least five numbered points describing concrete contrasts (project types, regions, services, scale, etc.).\n\n"
        "### Strategic Strengths\n"
        "Bullet points highlighting each company's strengths and strategic advantages.\n\n"
        "### Potential Risks or Weaknesses\n"
        "Bullet points noting limitations, missing capabilities, or contexts where each is weaker.\n\n"
        "### Recommendation\n"
        "Summarize which developer fits better for different project scenarios (e.g., small-scale distributed vs. utility-scale; community-owned vs. investor-led).\n\n"
        f"Developer A Data:\n{json.dumps(devA, indent=2)}\n\n"
        f"Developer B Data:\n{json.dumps(devB, indent=2)}"
    )

# Format OpenAI response to extract text
def extract_text_from_openai(response):
    if "output_text" in response:
        return response["output_text"]

    output = response.get("output", [])
    if isinstance(output, list) and len(output) > 0:
        content = output[0].get("content", [])
        if isinstance(content, list) and len(content) > 0:
            text = content[0].get("text")
            if text:
                return text

    return str(response)

import re

# AI analysis endpoint
@router.post("/analyze")
async def analyze(pair: DevPair):
    """Compare two developers using OpenAI."""
    devA, devB = pair.developerA, pair.developerB
    prompt = build_prompt(devA, devB)
    response = await call_openai(prompt)
    text = extract_text_from_openai(response)

# Get developer names for replacement
    nameA = (
        devA.get("name")
        or devA.get("Company")
        or devA.get("company")
        or "Developer A"
    )
    nameB = (
        devB.get("name")
        or devB.get("Company")
        or devB.get("company")
        or "Developer B"
    )

    replacements = [
        (r"\bDeveloper\s*A\b", nameA),
        (r"\bDeveloper\s*B\b", nameB),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

# Clean up text formatting
    text = text.strip()
    text = re.sub(r"\n{3,}", "\n\n", text) 

    return {"analysis": text}

