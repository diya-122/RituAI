from pydantic import BaseModel, Field
from typing import Literal, Optional
from datetime import datetime

Severity = Literal["none", "mild", "moderate", "severe"]
AcneType = Literal["papules", "pustules", "comedones", "cysts", "nodules"]
CyclePhase = Literal["menstrual", "follicular", "ovulatory", "luteal"]


class ZoneCounts(BaseModel):
    jawline: int = 0
    chin: int = 0
    forehead: int = 0
    cheeks: int = 0
    nose: int = 0


class Lesion(BaseModel):
    x: float = Field(..., ge=0, le=1)
    y: float = Field(..., ge=0, le=1)
    type: AcneType
    severity: Severity
    zone: Literal["jawline", "chin", "forehead", "cheeks", "nose"]


class ScanResponse(BaseModel):
    scan_id: int
    image_url: str
    acne_count: int
    zones: ZoneCounts
    types: list[AcneType]
    severity: Severity
    lesions: list[Lesion]
    cycle_day: Optional[int]
    cycle_phase: Optional[CyclePhase]
    created_at: datetime


class HeatmapCell(BaseModel):
    cycle_day: int
    cycle_number: int
    severity_score: float
    scan_id: Optional[int]


class HeatmapResponse(BaseModel):
    cells: list[HeatmapCell]
    face_zone_totals: ZoneCounts
    total_scans: int


class PatternAnalysisResponse(BaseModel):
    pattern_detected: Literal[
        "insufficient_data",
        "hormonal_acne_likely",
        "non_cyclical",
        "follicular_dominant",
        "luteal_flare",
    ]
    confidence: float = Field(..., ge=0, le=1)
    insight: str
    jawline_dominance: float
    luteal_spike_detected: bool
    consistency_score: float
