import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from utils.pdf_parser import parse_pdf
from utils.scorer import score_resume
from utils.gemini_client import generate

router = APIRouter(tags=["Resume"])

ENHANCE_SYSTEM = (
    "You are a senior technical recruiter. Given a resume section and a target "
    "job description, rewrite the section with: stronger action verbs, quantified "
    "metrics where possible, and natural insertion of relevant JD keywords. "
    "Respond ONLY with valid JSON — no markdown, no commentary."
)


@router.post("/score")
async def score(
    resume: UploadFile = File(...),
    jd_text: str = Form(...),
):
    if resume.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files accepted")

    file_bytes = await resume.read()
    parsed = parse_pdf(file_bytes)
    result = score_resume(parsed["full_text"], jd_text)
    result["resume_text"] = parsed["full_text"]
    return result


@router.post("/enhance")
async def enhance(
    resume: UploadFile = File(...),
    jd_text: str = Form(...),
):
    if resume.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files accepted")

    file_bytes = await resume.read()
    parsed = parse_pdf(file_bytes)
    sections = parsed["sections"]

    enhancements: dict = {}
    for section_name, section_text in sections.items():
        if not section_text or len(section_text) < 20:
            continue
        user_prompt = (
            f"Section: {section_name}\n\n"
            f"Original:\n{section_text}\n\n"
            f"Target JD keywords:\n{jd_text[:800]}\n\n"
            f'Response format: {{"original": "...", "enhanced": "...", "changes": ["..."]}}'
        )
        try:
            raw = generate(ENHANCE_SYSTEM, user_prompt)
            # Strip code fences if model returns them
            raw = raw.strip().removeprefix("```json").removesuffix("```").strip()
            enhancements[section_name] = json.loads(raw)
        except Exception as e:
            enhancements[section_name] = {"original": section_text, "error": str(e)}

    return {"enhancements": enhancements}
