from datetime import datetime
from typing import Optional


class CycleEngine:
    @staticmethod
    def compute_cycle_day(last_period_start, avg_cycle_length: int, scan_date: datetime) -> Optional[int]:
        if not last_period_start:
            return None
        delta = (scan_date.date() - last_period_start.date()).days
        if delta < 0:
            return None
        return (delta % avg_cycle_length) + 1

    @staticmethod
    def compute_phase(cycle_day: Optional[int], cycle_length: int = 28) -> Optional[str]:
        if cycle_day is None:
            return None
        if cycle_day <= max(5, int(cycle_length * 0.18)):
            return "menstrual"
        elif cycle_day <= int(cycle_length * 0.50):
            return "follicular"
        elif cycle_day <= int(cycle_length * 0.57):
            return "ovulatory"
        return "luteal"
