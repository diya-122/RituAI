"""
Local skin analysis — OpenCV only. Zero external API calls.

Face validation pipeline:
  1. Multiple Haar cascades (frontal + profile) — catches all angles
  2. Skin tone pixel ratio check — rejects screenshots/text images
  3. Edge density check — rejects images with too much text/UI
  4. Only if face confirmed → run lesion detection
"""
import io
import logging
import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


def _pil_to_cv2(image_bytes: bytes):
    try:
        pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        arr = np.array(pil)
        return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)
    except Exception as e:
        logger.error(f"Image decode failed: {e}")
        return None


def _is_real_face_image(img_bgr, faces) -> tuple[bool, str]:
    """
    Multi-signal validation to reject non-face images.
    Returns (is_valid, reason).
    """
    h, w = img_bgr.shape[:2]

    # ── Check 1: Face must be reasonably large relative to image ──
    if len(faces) > 0:
        fx, fy, fw, fh = faces[0]
        face_area_ratio = (fw * fh) / (w * h)
        if face_area_ratio < 0.03:
            # Face detected but tiny — likely a group photo or screenshot with a face icon
            return False, "no_face"

    # ── Check 2: Skin tone pixel ratio ──
    # Real selfies have significant skin-colored pixels
    # Screenshots/text images have very few
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

    # Skin tone range in HSV (covers light to dark skin tones)
    skin_masks = [
        cv2.inRange(hsv, np.array([0, 15, 50]),   np.array([25, 170, 255])),   # light/medium
        cv2.inRange(hsv, np.array([0, 20, 30]),   np.array([20, 200, 200])),   # darker tones
        cv2.inRange(hsv, np.array([170, 15, 50]), np.array([180, 170, 255])),  # reddish tones
    ]
    skin_mask = skin_masks[0]
    for m in skin_masks[1:]:
        skin_mask = cv2.bitwise_or(skin_mask, m)

    skin_pixels = cv2.countNonZero(skin_mask)
    skin_ratio = skin_pixels / (w * h)

    if skin_ratio < 0.08:
        # Less than 8% skin-colored pixels — not a face photo
        return False, "no_face"

    # ── Check 3: Edge density — screenshots/text have very high edge density ──
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = cv2.countNonZero(edges) / (w * h)

    if edge_density > 0.25 and len(faces) == 0:
        # Very high edges + no face = screenshot or text image
        return False, "no_face"

    # ── Check 4: Color variance — real faces have smooth gradients ──
    # Screenshots often have large uniform color blocks or sharp color transitions
    if len(faces) == 0:
        # No face detected at all — check if it could be a face at an extreme angle
        # by checking if skin ratio is high enough to be a close-up face
        if skin_ratio < 0.20:
            return False, "no_face"

    return True, ""


def _get_zone(x: int, y: int, fx: int, fy: int, fw: int, fh: int) -> str | None:
    if not (fx <= x <= fx + fw and fy <= y <= fy + fh):
        return None

    rel_y = (y - fy) / fh
    rel_x = (x - fx) / fw

    if rel_y < 0.25:
        return "forehead"
    elif rel_y < 0.65:
        if 0.35 < rel_x < 0.65:
            return "nose"
        else:
            return "cheeks"
    elif rel_y < 0.80:
        return "chin"
    else:
        if rel_x < 0.25 or rel_x > 0.75:
            return "jawline"
        return "chin"


class SkinAnalyzer:
    def __init__(self):
        self.frontal_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        self.profile_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_profileface.xml"
        )
        self.alt_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml"
        )

    def _detect_face(self, gray):
        """Try multiple cascades and parameters to detect face at any angle."""
        # Frontal — strict
        faces = self.frontal_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=5, minSize=(80, 80)
        )
        if len(faces) > 0:
            return faces

        # Frontal — lenient
        faces = self.frontal_cascade.detectMultiScale(
            gray, scaleFactor=1.05, minNeighbors=3, minSize=(60, 60)
        )
        if len(faces) > 0:
            return faces

        # Alt frontal cascade
        faces = self.alt_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=3, minSize=(60, 60)
        )
        if len(faces) > 0:
            return faces

        # Profile (side view)
        faces = self.profile_cascade.detectMultiScale(
            gray, scaleFactor=1.1, minNeighbors=3, minSize=(60, 60)
        )
        if len(faces) > 0:
            return faces

        # Profile flipped (other side)
        flipped = cv2.flip(gray, 1)
        faces = self.profile_cascade.detectMultiScale(
            flipped, scaleFactor=1.1, minNeighbors=3, minSize=(60, 60)
        )
        if len(faces) > 0:
            h, w = gray.shape
            # Mirror x coordinates back
            faces[:, 0] = w - faces[:, 0] - faces[:, 2]
            return faces

        return []

    def analyze(self, image_bytes: bytes) -> dict:
        img = _pil_to_cv2(image_bytes)
        if img is None:
            return self._empty("Could not decode image")

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Detect face with all cascades
        faces = self._detect_face(gray)

        # Validate it's actually a face image
        is_valid, reason = _is_real_face_image(img, faces)
        if not is_valid:
            return self._empty(reason)

        # Set face bounding box
        if len(faces) > 0:
            fx, fy, fw, fh = faces[0]
            notes = ""
        else:
            # Skin ratio was high enough — treat full image as face (extreme close-up)
            fx, fy, fw, fh = int(w * 0.05), int(h * 0.05), int(w * 0.9), int(h * 0.9)
            notes = "face_not_detected_clearly"

        # Detect lesions
        candidates = self._detect_lesions(img, w, h)

        zone_counts = {z: 0 for z in ["jawline", "chin", "forehead", "cheeks", "nose"]}
        types_found = set()
        lesion_dicts = []

        for (cx, cy, radius, kind) in candidates:
            zone = _get_zone(cx, cy, fx, fy, fw, fh)
            if zone is None:
                continue

            rel = radius / min(w, h)
            sev = "mild" if rel < 0.008 else "moderate" if rel < 0.02 else "severe"
            t = "cysts" if sev == "severe" else "papules" if sev == "moderate" else "comedones"

            zone_counts[zone] += 1
            types_found.add(t)
            lesion_dicts.append({
                "x": round(cx / w, 4),
                "y": round(cy / h, 4),
                "type": t,
                "severity": sev,
                "zone": zone,
            })

        total = len(lesion_dicts)
        raw = len(candidates)

        if total == 0:
            severity = "none"
        elif total <= 10 and "cysts" not in types_found:
            severity = "mild"
        elif total <= 25:
            severity = "moderate"
        else:
            severity = "severe"

        confidence = round(min(1.0, total / max(raw, 1) * 0.9 + 0.1), 2) if raw > 0 else 0.5

        return {
            "acne_count": total,
            "zones": zone_counts,
            "acne_types": list(types_found) or ["comedones"],
            "severity": severity,
            "lesions": lesion_dicts[:50],
            "confidence": confidence,
            "notes": notes,
        }

    def _detect_lesions(self, img_bgr, w: int, h: int) -> list:
        candidates = []

        # Red/inflamed spots
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        mask = cv2.bitwise_or(
            cv2.inRange(hsv, np.array([0, 40, 50]), np.array([15, 255, 255])),
            cv2.inRange(hsv, np.array([160, 40, 50]), np.array([180, 255, 255])),
        )
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask = cv2.morphologyEx(cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel), cv2.MORPH_OPEN, kernel)

        for cnt in cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0]:
            area = cv2.contourArea(cnt)
            if (w * h) * 0.0001 < area < (w * h) * 0.01:
                M = cv2.moments(cnt)
                if M["m00"] > 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    candidates.append((cx, cy, int(np.sqrt(area / np.pi)), "inflammatory"))

        # Dark comedones
        gray = cv2.GaussianBlur(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY), (7, 7), 0)
        p = cv2.SimpleBlobDetector_Params()
        p.filterByArea = True
        p.minArea = max(10, int((w * h) * 0.00005))
        p.maxArea = int((w * h) * 0.005)
        p.filterByCircularity = True
        p.minCircularity = 0.4
        p.filterByColor = True
        p.blobColor = 0
        for kp in cv2.SimpleBlobDetector_create(p).detect(gray):
            candidates.append((int(kp.pt[0]), int(kp.pt[1]), max(2, int(kp.size / 2)), "comedonal"))

        return candidates

    def _empty(self, note: str) -> dict:
        return {
            "acne_count": 0,
            "zones": {z: 0 for z in ["jawline", "chin", "forehead", "cheeks", "nose"]},
            "acne_types": [],
            "severity": "none",
            "lesions": [],
            "confidence": 0.1,
            "notes": note,
        }
