 6"""
KNN Culture Fit Model — Training Script
Run: python models/train_culture.py

Generates:
  models/knn_culture.pkl
  models/preprocessor.pkl
"""

import os
import sys
import numpy as np
import joblib
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# ---------------------------------------------------------------------------
# 6 personality dimensions (each scored 1-5):
#   pace, collaboration, structure, ambiguity_tolerance, feedback_style, growth_mindset
#
# 5 company archetypes:
#   0=Startup  1=Enterprise  2=Consultancy  3=Non-profit  4=Research
# ---------------------------------------------------------------------------

COMPANY_TYPES = ["Startup", "Enterprise", "Consultancy", "Non-profit", "Research"]

# ~200 synthetic training samples
# fmt: off
SAMPLES = [
    # [pace, collaboration, structure, ambiguity_tolerance, feedback_style, growth_mindset], label
    # Startup (label=0) — fast pace, high collab, low structure, high ambiguity
    *[([5,4,2,5,4,5], 0)] * 20,
    *[([4,5,2,4,5,5], 0)] * 15,
    *[([5,3,1,5,3,5], 0)] * 10,
    # Enterprise (label=1) — moderate pace, structured, low ambiguity
    *[([3,3,5,2,3,3], 1)] * 20,
    *[([2,4,5,1,2,2], 1)] * 15,
    *[([3,2,4,2,3,3], 1)] * 10,
    # Consultancy (label=2) — fast pace, high structure, client-facing feedback
    *[([4,4,4,3,5,4], 2)] * 20,
    *[([5,4,4,3,4,4], 2)] * 15,
    *[([4,3,5,3,5,3], 2)] * 10,
    # Non-profit (label=3) — moderate pace, mission-driven, collaborative
    *[([2,5,3,3,4,4], 3)] * 15,
    *[([3,5,2,3,3,5], 3)] * 15,
    *[([2,4,3,4,4,4], 3)] * 10,
    # Research (label=4) — slow pace, low collab, high ambiguity
    *[([1,2,3,5,2,5], 4)] * 15,
    *[([2,1,4,5,1,5], 4)] * 15,
    *[([1,2,2,4,2,4], 4)] * 10,
]
# fmt: on

np.random.seed(42)


def add_noise(samples, noise_std=0.4):
    X, y = zip(*samples)
    X = np.array(X, dtype=float)
    y = np.array(y)
    X += np.random.normal(0, noise_std, X.shape)
    X = np.clip(X, 1, 5)
    return X, y


def train():
    X, y = add_noise(SAMPLES)

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("knn", KNeighborsClassifier(n_neighbors=5, metric="euclidean", weights="distance")),
    ])
    pipeline.fit(X, y)

    out_dir = os.path.dirname(__file__)
    joblib.dump(pipeline, os.path.join(out_dir, "knn_culture.pkl"))
    print(f"✅ Trained on {len(X)} samples — saved to models/knn_culture.pkl")
    print(f"   Classes: {COMPANY_TYPES}")


if __name__ == "__main__":
    train()
