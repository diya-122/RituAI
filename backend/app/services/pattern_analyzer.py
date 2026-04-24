import numpy as np
from app.schemas.skin_scan import PatternAnalysisResponse


class PatternAnalyzer:
    @staticmethod
    def analyze(scans: list) -> PatternAnalysisResponse:
        if len(scans) < 3:
            return PatternAnalysisResponse(
                pattern_detected="insufficient_data", confidence=0.0,
                insight="Take at least 3 scans across your cycle to see patterns.",
                jawline_dominance=0.0, luteal_spike_detected=False, consistency_score=0.0,
            )

        total_acne = sum(s.acneCount for s in scans)
        if total_acne == 0:
            return PatternAnalysisResponse(
                pattern_detected="insufficient_data", confidence=0.5,
                insight="No acne detected across your scans. Keep tracking!",
                jawline_dominance=0.0, luteal_spike_detected=False, consistency_score=1.0,
            )

        jawline_total = sum(s.zones.get("jawline", 0) for s in scans)
        chin_total = sum(s.zones.get("chin", 0) for s in scans)
        jawline_dominance = jawline_total / total_acne
        hormonal_dominance = (jawline_total + chin_total) / total_acne

        luteal = [s for s in scans if s.cyclePhase == "luteal"]
        follicular = [s for s in scans if s.cyclePhase == "follicular"]
        luteal_spike = (
            len(luteal) >= 2 and len(follicular) >= 2
            and np.mean([s.acneCount for s in luteal]) > np.mean([s.acneCount for s in follicular]) * 1.4
        )

        if hormonal_dominance > 0.5 and luteal_spike:
            pattern, confidence = "hormonal_acne_likely", min(0.95, 0.6 + len(scans) * 0.05)
            insight = (f"Your acne clusters in jawline/chin ({int(hormonal_dominance*100)}%) and spikes "
                       f"in your luteal phase — a common PCOS-linked hormonal pattern. Talk to your gynecologist.")
        elif luteal_spike:
            pattern, confidence = "luteal_flare", 0.70
            insight = "Your acne increases post-ovulation (luteal phase). Premenstrual flare-ups are common."
        elif hormonal_dominance > 0.5:
            pattern, confidence = "hormonal_acne_likely", 0.65
            insight = f"Acne concentrated in jawline/chin ({int(hormonal_dominance*100)}%) — linked to androgen activity."
        elif jawline_dominance < 0.2:
            pattern, confidence = "non_cyclical", 0.5
            insight = "Your acne appears evenly distributed and not strongly cycle-linked."
        else:
            pattern, confidence = "follicular_dominant", 0.55
            insight = "No strong hormonal pattern yet. Keep scanning for more data."

        zone_keys = ["jawline", "chin", "forehead", "cheeks", "nose"]
        vecs = np.array([[s.zones.get(z, 0) for z in zone_keys] for s in scans], dtype=float)
        sums = vecs.sum(axis=1, keepdims=True)
        sums[sums == 0] = 1
        consistency = max(0.0, round(1.0 - float((vecs / sums).std(axis=0).mean()), 2))

        return PatternAnalysisResponse(
            pattern_detected=pattern, confidence=round(confidence, 2), insight=insight,
            jawline_dominance=round(jawline_dominance, 2),
            luteal_spike_detected=luteal_spike, consistency_score=consistency,
        )
