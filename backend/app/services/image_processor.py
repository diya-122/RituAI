import io
from PIL import Image, ImageOps
from fastapi import HTTPException, UploadFile
from app.config import get_settings

ALLOWED_SIGNATURES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG": "image/png",
    b"RIFF": "image/webp",
}


def _detect_mime(data: bytes) -> str:
    for sig, mime in ALLOWED_SIGNATURES.items():
        if data[: len(sig)] == sig:
            return mime
    return "unknown"


class ImageProcessor:
    def __init__(self):
        self.settings = get_settings()
        self.max_bytes = self.settings.MAX_IMAGE_SIZE_MB * 1024 * 1024

    async def validate_and_process(self, upload: UploadFile) -> tuple[bytes, str]:
        contents = await upload.read()

        if len(contents) == 0:
            raise HTTPException(400, "Empty file uploaded")
        if len(contents) > self.max_bytes:
            raise HTTPException(413, f"File too large. Max {self.settings.MAX_IMAGE_SIZE_MB}MB")

        mime = _detect_mime(contents)
        if mime not in self.settings.allowed_mimes_list:
            raise HTTPException(400, "Invalid file type. Allowed: jpeg, png, webp")

        try:
            img = Image.open(io.BytesIO(contents))
            img.verify()
            img = Image.open(io.BytesIO(contents))
        except Exception:
            raise HTTPException(400, "Corrupted or invalid image")

        img = ImageOps.exif_transpose(img)
        if img.mode != "RGB":
            img = img.convert("RGB")

        MAX_DIM = 1024
        if max(img.size) > MAX_DIM:
            img.thumbnail((MAX_DIM, MAX_DIM), Image.Resampling.LANCZOS)

        output = io.BytesIO()
        img.save(output, format="JPEG", quality=88, optimize=True)
        return output.getvalue(), "image/jpeg"
