import re
from typing import Any

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from keybert import KeyBERT

_bert_model: SentenceTransformer | None = None
_kw_model: KeyBERT | None = None


def _get_bert_model() -> SentenceTransformer:
    global _bert_model
    if _bert_model is None:
        _bert_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _bert_model


def _get_kw_model() -> KeyBERT:
    global _kw_model
    if _kw_model is None:
        _kw_model = KeyBERT(model=_get_bert_model())
    return _kw_model


TECH_REPLACEMENTS = {
    r"c\+\+":      "cplusplus",
    r"c#":         "csharp",
    r"f#":         "fsharp",
    r"\.net":      "dotnet",
    r"asp\.net":   "aspnet",
    r"node\.js":   "nodejs",
    r"vue\.js":    "vuejs",
    r"next\.js":   "nextjs",
    r"grpc":       "grpc",
    r"graphql":    "graphql",
    r"signalr":    "signalr",
    r"postgresql": "postgresql",
}


def _preprocess(text: str) -> str:
    t = text.lower()
    for pattern, replacement in TECH_REPLACEMENTS.items():
        t = re.sub(pattern, replacement, t)
    return t


def _mean_encode(model: SentenceTransformer, text: str) -> np.ndarray:
    """
    Split text into word chunks and average their embeddings.
    Avoids the [:512 chars] bug that only read the first few lines.
    """
    words = text.split()
    chunk_size = 300  # ~512 tokens safely
    chunks = [
        " ".join(words[i: i + chunk_size])
        for i in range(0, len(words), chunk_size)
    ]
    if not chunks:
        chunks = [""]
    embeddings = model.encode(chunks)
    return np.mean(embeddings, axis=0)


def _extract_keywords(text: str, top_n: int = 50) -> list[str]:
    kw_model = _get_kw_model()
    preprocessed = _preprocess(text)
    keywords = kw_model.extract_keywords(
        preprocessed,
        keyphrase_ngram_range=(1, 2),
        stop_words="english",
        use_mmr=True,
        diversity=0.4,
        top_n=top_n,
    )
    return [kw for kw, score in keywords if score > 0.15]


def _semantic_match(
    jd_keywords: list[str],
    resume_keywords: list[str],
    threshold: float = 0.45,
) -> tuple[list[str], list[str]]:
    """
    Semantically match each JD keyword against all resume keywords.
    A JD keyword is 'matched' if any resume keyword scores above threshold.
    """
    model = _get_bert_model()

    if not jd_keywords or not resume_keywords:
        return [], jd_keywords

    jd_embeddings = model.encode(jd_keywords)         # (n_jd, 384)
    resume_embeddings = model.encode(resume_keywords)  # (n_resume, 384)

    # Similarity matrix: (n_jd x n_resume)
    sim_matrix = cosine_similarity(jd_embeddings, resume_embeddings)

    matched = []
    missing = []

    for i, jd_kw in enumerate(jd_keywords):
        best_score = float(np.max(sim_matrix[i]))
        if best_score >= threshold:
            matched.append(jd_kw)
        else:
            missing.append(jd_kw)

    return matched, missing


def score_resume(resume_text: str, jd_text: str) -> dict[str, Any]:
    """
    Two-stage scoring:
      Stage 1 (40%) — KeyBERT + semantic keyword matching
      Stage 2 (60%) — full-document semantic similarity (chunked)
    """

    # ---------- Stage 1: keyword extraction + semantic match ----------
    jd_keywords = _extract_keywords(jd_text, top_n=50)
    resume_keywords = _extract_keywords(resume_text, top_n=80)

    matched, missing = _semantic_match(jd_keywords, resume_keywords, threshold=0.45)

    keyword_score = len(matched) / max(len(jd_keywords), 1) * 100

    # ---------- Stage 2: full document semantic similarity ----------
    model = _get_bert_model()
    resume_emb = _mean_encode(model, _preprocess(resume_text))
    jd_emb = _mean_encode(model, _preprocess(jd_text))
    sem_score = float(cosine_similarity([resume_emb], [jd_emb])[0][0]) * 100

    # ---------- Weighted final score ----------
    final_score = round(0.4 * keyword_score + 0.6 * sem_score, 2)

    return {
        "score": min(final_score, 100.0),
        "matched_keywords": sorted(matched),
        "missing_keywords": sorted(missing),
    }