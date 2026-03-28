import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.gemini_client import generate

router = APIRouter(tags=["Roadmap"])

ROADMAP_SYSTEM = (
    "You are a career coach specialising in tech roles. "
    "Given a candidate's missing skills, their culture fit result, and target company type, "
    "generate a structured 30/60/90-day career roadmap. "
    "Return ONLY valid JSON (no markdown). "
    "Schema: { \"tasks\": [ { \"category\": string, \"task\": string, "
    "\"priority\": \"high\"|\"medium\"|\"low\", \"day_target\": 30|60|90 } ] }"
)


class RoadmapRequest(BaseModel):
    missing_keywords: list[str]
    top_match: str
    culture_dimensions: dict[str, float] | None = None
    job_role: str | None = None


@router.post("/roadmap")
def generate_roadmap(body: RoadmapRequest):
    user_prompt = (
        f"Job role: {body.job_role or 'Software Engineer'}\n"
        f"Target company type: {body.top_match}\n"
        f"Missing skills/keywords: {', '.join(body.missing_keywords[:30])}\n"
        f"Culture dimensions: {json.dumps(body.culture_dimensions or {})}\n\n"
        "Generate a personalised 30/60/90-day roadmap with ~10 tasks."
    )
    try:
        raw = generate(ROADMAP_SYSTEM, user_prompt)
        raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
        data = json.loads(raw)
        return data
    except json.JSONDecodeError as e:
        raise HTTPException(500, f"Gemini returned invalid JSON: {e}")
    except Exception as e:
        raise HTTPException(500, str(e))
