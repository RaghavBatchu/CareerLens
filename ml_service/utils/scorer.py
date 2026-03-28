import re
from typing import Any

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# Load once at import time (cached globally)
_bert_model: SentenceTransformer | None = None


def _get_bert_model() -> SentenceTransformer:
    global _bert_model
    if _bert_model is None:
        _bert_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _bert_model


def _tokenize(text: str) -> list[str]:
    """Lower-case word tokenizer, strips punctuation."""
    return re.findall(r"\b[a-z][a-z0-9+#\.]*\b", text.lower())


def score_resume(resume_text: str, jd_text: str) -> dict[str, Any]:
    """
    Two-stage scoring:
      Stage 1 (40%) — TF-IDF keyword overlap
      Stage 2 (60%) — all-MiniLM-L6-v2 semantic similarity

    Returns:
      score            : float 0-100
      matched_keywords : list[str]
      missing_keywords : list[str]
    """
    # ---------- Stage 1: keyword overlap ----------
    resume_tokens = set(_tokenize(resume_text))
    jd_tokens = set(_tokenize(jd_text))

    # TF-IDF over JD to extract meaningful keywords (ignore stopwords)
    vectorizer = TfidfVectorizer(stop_words="english", max_features=60)
    try:
        vectorizer.fit([jd_text])
        jd_keywords = set(vectorizer.get_feature_names_out())
    except ValueError:
        jd_keywords = jd_tokens  # fallback if JD too short

    matched = sorted(jd_keywords & resume_tokens)
    missing = sorted(jd_keywords - resume_tokens)

    keyword_score = len(matched) / max(len(jd_keywords), 1) * 100

    # ---------- Stage 2: semantic similarity ----------
    model = _get_bert_model()
    embeddings = model.encode([resume_text[:512], jd_text[:512]])
    sem_score = float(cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]) * 100

    # ---------- Weighted average ----------
    final_score = round(0.4 * keyword_score + 0.6 * sem_score, 2)

    return {
        "score": min(final_score, 100.0),
        "matched_keywords": matched,
        "missing_keywords": missing,
    }
