from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl

try:
    from .downloader import extract_media, stream_media
except ImportError:
    from downloader import extract_media, stream_media

app = FastAPI(title="MediaFlow AI API", version="1.0.0")
logger = logging.getLogger("mediaflow.api")
frontend_url = os.getenv("FRONTEND_URL")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in ["http://localhost:3000", "http://127.0.0.1:3000", frontend_url] if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExtractRequest(BaseModel):
    url: HttpUrl


class DownloadRequest(BaseModel):
    url: HttpUrl
    format_id: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "mediaflow-api"}


@app.post("/api/extract")
async def extract(request: ExtractRequest) -> dict[str, Any]:
    try:
        result = await asyncio.to_thread(extract_media, str(request.url))
        return {
            "title": result.title,
            "thumbnail": result.thumbnail,
            "duration": result.duration,
            "formats": result.formats,
        }
    except Exception as error:
        message = str(error).lower()
        logger.exception("Media extraction failed for %s", request.url)
        if "private" in message or "login" in message:
            detail = "This media is private or requires a signed-in session."
        elif "age" in message:
            detail = "This media is age-restricted and could not be accessed."
        elif "rate" in message or "429" in message:
            detail = "The platform is rate limiting requests. Please try again shortly."
        elif "unsupported url" in message or "not a valid url" in message:
            detail = "This link format is not supported. For TikTok, paste the full copied link or a vm.tiktok.com link."
        elif "tiktok" in message or "captcha" in message or "challenge" in message:
            detail = "TikTok blocked this request. Try a public video link, or configure an authorized cookie file."
        else:
            detail = f"We could not read that link: {error}"
        raise HTTPException(status_code=422, detail=detail) from error


@app.post("/api/download")
async def download(request: DownloadRequest) -> StreamingResponse:
    try:
        chunks, filename, media_type = await asyncio.to_thread(stream_media, str(request.url), request.format_id)
        return StreamingResponse(
            chunks,
            media_type=media_type,
            headers={"Content-Disposition": f'attachment; filename="{filename}"', "X-Content-Type-Options": "nosniff"},
        )
    except FileNotFoundError as error:
        raise HTTPException(status_code=503, detail="FFmpeg is required for this stream combination.") from error
    except Exception as error:
        raise HTTPException(status_code=422, detail="That format could not be streamed. Try another quality.") from error
