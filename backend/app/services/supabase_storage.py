import time
import uuid
import logging
from supabase import create_client, Client
from app.config import get_settings

logger = logging.getLogger(__name__)


class SupabaseStorageService:
    def __init__(self):
        s = get_settings()
        self.client: Client = create_client(s.SUPABASE_URL, s.SUPABASE_SERVICE_ROLE_KEY)
        self.bucket = s.SUPABASE_STORAGE_BUCKET

    def upload_scan(self, user_id: int, image_bytes: bytes) -> str:
        path = f"{user_id}/{int(time.time())}-{uuid.uuid4().hex[:8]}.jpg"
        self.client.storage.from_(self.bucket).upload(
            path=path,
            file=image_bytes,
            file_options={"content-type": "image/jpeg", "cache-control": "3600"},
        )
        return self.client.storage.from_(self.bucket).create_signed_url(path, expires_in=604800)["signedURL"]

    def delete_scan(self, storage_path: str) -> None:
        try:
            self.client.storage.from_(self.bucket).remove([storage_path])
        except Exception as e:
            logger.warning(f"Storage delete failed: {e}")
