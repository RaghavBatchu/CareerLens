import fitz  # PyMuPDF
import re
from typing import Any

SECTION_HEADERS = [
    "experience", "work experience", "employment",
    "education", "skills", "technical skills",
    "projects", "summary", "objective", "certifications",
    "achievements", "publications", "languages",
]


def parse_pdf(file_bytes: bytes) -> dict[str, Any]:
    """
    Parse a PDF resume and extract:
      - full_text: entire plain text
      - sections: dict mapping section name → section content
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    for page in doc:
        full_text += page.get_text("text")
    doc.close()

    sections = _extract_sections(full_text)
    return {"full_text": full_text.strip(), "sections": sections}


def _extract_sections(text: str) -> dict[str, str]:
    lines = text.splitlines()
    sections: dict[str, str] = {}
    current_section = "header"
    buffer: list[str] = []

    for line in lines:
        stripped = line.strip()
        lower = stripped.lower()

        matched = next((h for h in SECTION_HEADERS if re.fullmatch(rf"{re.escape(h)}[:\s]*", lower)), None)
        if matched:
            if buffer:
                sections[current_section] = "\n".join(buffer).strip()
            current_section = matched
            buffer = []
        else:
            if stripped:
                buffer.append(stripped)

    if buffer:
        sections[current_section] = "\n".join(buffer).strip()

    return sections
