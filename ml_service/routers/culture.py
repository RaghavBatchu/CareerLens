import os
import joblib
import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["Culture Fit"])

COMPANY_TYPES = ["Startup", "Enterprise", "Consultancy", "Non-profit", "Research"]

_pipeline = None


def _load_pipeline():
    global _pipeline
    if _pipeline is None:
        model_path = os.path.join(os.path.dirname(__file__), "..", "models", "knn_culture.pkl")
        if not os.path.exists(model_path):
            raise HTTPException(
                503,
                "Culture model not trained yet. Run: python models/train_culture.py"
            )
        _pipeline = joblib.load(model_path)
    return _pipeline


class CultureRequest(BaseModel):
    # 12 Likert answers (1–5) mapped to 6 personality dimensions (avg of 2 questions each)
    answers: list[int]


@router.post("/culture")
def predict_culture(body: CultureRequest):
    if len(body.answers) != 12:
        raise HTTPException(400, "Exactly 12 answers required (1-5 each)")
    if any(a < 1 or a > 5 for a in body.answers):
        raise HTTPException(400, "Each answer must be between 1 and 5")

    # Average pairs → 6 dimensions
    ans = body.answers
    dims = [
        (ans[0] + ans[1]) / 2,   # pace
        (ans[2] + ans[3]) / 2,   # collaboration
        (ans[4] + ans[5]) / 2,   # structure
        (ans[6] + ans[7]) / 2,   # ambiguity_tolerance
        (ans[8] + ans[9]) / 2,   # feedback_style
        (ans[10] + ans[11]) / 2, # growth_mindset
    ]

    pipeline = _load_pipeline()
    X = np.array([dims])
    proba = pipeline.predict_proba(X)[0]

    result = {ct: round(float(p), 4) for ct, p in zip(COMPANY_TYPES, proba)}
    top = max(result, key=result.get)  # type: ignore
    return {"probabilities": result, "top_match": top, "dimensions": {
        "pace": dims[0],
        "collaboration": dims[1],
        "structure": dims[2],
        "ambiguity_tolerance": dims[3],
        "feedback_style": dims[4],
        "growth_mindset": dims[5],
    }}
