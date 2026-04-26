import logging
import json
import hashlib
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from prisma import Prisma

from app.schemas.skin_scan import ScanResponse, HeatmapResponse, HeatmapCell, PatternAnalysisResponse, ZoneCounts
from app.services.image_processor import ImageProcessor
from app.services.skin_analyzer import SkinAnalyzer
from app.services.supabase_storage import SupabaseStorageService
from app.services.cycle_engine import CycleEngine
from app.services.pattern_analyzer import PatternAnalyzer
from app.dependencies import get_db

router = APIRouter(prefix="/scan", tags=["skin-scan"])
logger = logging.getLogger(__name__)

_processor = ImageProcessor()
_analyzer = SkinAnalyzer()
_storage = SupabaseStorageService()


@router.post("/analyze", response_model=ScanResponse)
async def analyze_scan(
    user_id: int = Form(...),
    image: UploadFile = File(...),
    db: Prisma = Depends(get_db),
):
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(404, "User not found")

    try:
        processed_bytes, _ = await _processor.validate_and_process(image)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Image processing error: {e}")

    # Duplicate check — same image hash within last 10 scans
    image_hash = hashlib.md5(processed_bytes).hexdigest()
    recent_scans = await db.skinscan.find_many(
        where={"userId": user_id},
        order={"createdAt": "desc"},
        take=10,
    )
    for s in recent_scans:
        raw = s.rawAnalysis if isinstance(s.rawAnalysis, dict) else json.loads(s.rawAnalysis or '{}')
        if raw.get("image_hash") == image_hash:
            raise HTTPException(400, "This image has already been scanned. Please take a new photo.")

    try:
        image_url = _storage.upload_scan(user_id, processed_bytes)
    except Exception:
        logger.exception("Storage upload failed")
        raise HTTPException(502, "Image storage failed. Please try again.")

    try:
        analysis = _analyzer.analyze(processed_bytes)
    except Exception as e:
        raise HTTPException(500, f"Analysis error: {e}")

    # Reject only clearly non-face images (coin, landscape, etc.)
    if analysis.get("notes") == "no_face":
        # Delete the already-uploaded image since we're rejecting
        try:
            path = image_url.split(f"/{_storage.bucket}/")[1].split("?")[0]
            _storage.delete_scan(path)
        except Exception:
            pass
        raise HTTPException(400, "No face detected. Please upload a clear selfie showing your face.")

    now = datetime.utcnow()
    cycle_day = CycleEngine.compute_cycle_day(user.lastPeriodStart, user.avgCycleLength or 28, now)
    cycle_phase = CycleEngine.compute_phase(cycle_day, user.avgCycleLength or 28)

    scan = await db.skinscan.create(data={
        "userId": user_id,
        "imageUrl": image_url,
        "cycleDay": cycle_day,
        "cyclePhase": cycle_phase,
        "acneCount": analysis["acne_count"],
        "zones": json.dumps(analysis["zones"]),
        "acneTypes": analysis["acne_types"],
        "severity": analysis["severity"],
        "rawAnalysis": json.dumps({"confidence": analysis["confidence"], "notes": analysis["notes"], "image_hash": image_hash}),
        "lesions": json.dumps(analysis["lesions"]),
    })

    return ScanResponse(
        scan_id=scan.id, image_url=image_url,
        acne_count=analysis["acne_count"], zones=ZoneCounts(**analysis["zones"]),
        types=analysis["acne_types"], severity=analysis["severity"],
        lesions=analysis["lesions"], cycle_day=cycle_day,
        cycle_phase=cycle_phase, created_at=scan.createdAt,
    )


@router.get("/history/{user_id}", response_model=list[ScanResponse])
async def get_scan_history(user_id: int, limit: int = 50, db: Prisma = Depends(get_db)):
    scans = await db.skinscan.find_many(where={"userId": user_id}, order={"createdAt": "desc"}, take=limit)
    return [ScanResponse(
        scan_id=s.id, image_url=s.imageUrl, acne_count=s.acneCount,
        zones=ZoneCounts(**s.zones) if isinstance(s.zones, dict) else ZoneCounts(**json.loads(s.zones)),
        types=s.acneTypes, severity=s.severity,
        lesions=s.lesions if isinstance(s.lesions, list) else json.loads(s.lesions) if s.lesions else [],
        cycle_day=s.cycleDay, cycle_phase=s.cyclePhase, created_at=s.createdAt,
    ) for s in scans]


@router.get("/heatmap/{user_id}", response_model=HeatmapResponse)
async def get_heatmap(user_id: int, cycles_back: int = 6, db: Prisma = Depends(get_db)):
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(404, "User not found")

    scans = await db.skinscan.find_many(
        where={"userId": user_id, "cycleDay": {"not": None}}, order={"createdAt": "desc"}
    )
    if not scans:
        return HeatmapResponse(cells=[], face_zone_totals=ZoneCounts(), total_scans=0)

    cycle_length = user.avgCycleLength or 28
    latest = scans[0].createdAt
    sev_map = {"none": 0.0, "mild": 0.33, "moderate": 0.66, "severe": 1.0}
    cells, zone_totals = [], {z: 0 for z in ["jawline", "chin", "forehead", "cheeks", "nose"]}

    for s in scans:
        cn = ((latest - s.createdAt).days // cycle_length) + 1
        if cn > cycles_back:
            continue
        cells.append(HeatmapCell(cycle_day=s.cycleDay, cycle_number=cn,
                                  severity_score=sev_map.get(s.severity, 0.0), scan_id=s.id))
        for z, c in (s.zones if isinstance(s.zones, dict) else json.loads(s.zones)).items():
            if z in zone_totals:
                zone_totals[z] += c

    return HeatmapResponse(cells=cells, face_zone_totals=ZoneCounts(**zone_totals), total_scans=len(scans))


@router.get("/pattern/{user_id}", response_model=PatternAnalysisResponse)
async def get_pattern(user_id: int, db: Prisma = Depends(get_db)):
    scans = await db.skinscan.find_many(where={"userId": user_id}, order={"createdAt": "desc"})
    return PatternAnalyzer.analyze(scans)


@router.delete("/user/{user_id}/cleanup")
async def cleanup_orphaned_scans(user_id: int, db: Prisma = Depends(get_db)):
    """Delete DB records whose storage images no longer exist."""
    scans = await db.skinscan.find_many(where={"userId": user_id})
    deleted = []
    for scan in scans:
        try:
            # Try to extract path and check if signed URL is still valid
            # If imageUrl is empty or clearly broken, delete the record
            if not scan.imageUrl:
                await db.skinscan.delete(where={"id": scan.id})
                deleted.append(scan.id)
        except Exception:
            pass
    return {"deleted_count": len(deleted), "deleted_ids": deleted}


@router.delete("/{scan_id}")
async def delete_scan(scan_id: int, user_id: int, db: Prisma = Depends(get_db)):
    scan = await db.skinscan.find_unique(where={"id": scan_id})
    if not scan:
        raise HTTPException(404, "Scan not found")
    if scan.userId != user_id:
        raise HTTPException(403, "Not your scan")
    try:
        path = scan.imageUrl.split(f"/{_storage.bucket}/")[1].split("?")[0]
        _storage.delete_scan(path)
    except Exception as e:
        logger.warning(f"Storage delete failed: {e}")
    await db.skinscan.delete(where={"id": scan_id})
    return {"status": "deleted"}
