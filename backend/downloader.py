from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Any, Iterator
from urllib.parse import urlparse

import requests
import yt_dlp


USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)


@dataclass
class MediaResult:
    title: str
    thumbnail: str | None
    duration: int | None
    formats: list[dict[str, Any]]
    original: dict[str, Any]


def _base_options() -> dict[str, Any]:
    options: dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "http_headers": {"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"},
        "socket_timeout": 20,
        "retries": 2,
        "extractor_args": {"tiktok": {"app_name": "musical_ly"}},
    }
    cookies_file = os.getenv("MEDIAFLOW_COOKIES_FILE")
    if cookies_file:
        options["cookiefile"] = cookies_file
    cookies_browser = os.getenv("MEDIAFLOW_COOKIES_FROM_BROWSER")
    if cookies_browser and not cookies_file:
        options["cookiesfrombrowser"] = (cookies_browser,)
    return options


def _resolve_platform_url(url: str) -> str:
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()
    is_tiktok_short_link = hostname in {"vm.tiktok.com", "vt.tiktok.com"}
    is_tiktok_short_path = hostname.endswith("tiktok.com") and parsed.path.startswith("/t/")
    if not (is_tiktok_short_link or is_tiktok_short_path):
        return url

    response = requests.get(
        url,
        headers={"User-Agent": USER_AGENT, "Accept-Language": "en-US,en;q=0.9"},
        allow_redirects=True,
        stream=True,
        timeout=15,
    )
    try:
        return response.url
    finally:
        response.close()


def _format_label(item: dict[str, Any]) -> str:
    height = item.get("height")
    ext = item.get("ext", "mp4")
    note = item.get("format_note") or (f"{height}p" if height else ext.upper())
    return str(note).replace("(best)", "").strip()


def extract_media(url: str) -> MediaResult:
    url = _resolve_platform_url(url)
    with yt_dlp.YoutubeDL(_base_options()) as client:
        info = client.extract_info(url, download=False)

    raw_formats = info.get("formats", [])
    formats: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in raw_formats:
        format_id = str(item.get("format_id", ""))
        if not format_id or format_id in seen:
            continue
        has_video = item.get("vcodec") not in (None, "none")
        has_audio = item.get("acodec") not in (None, "none")
        if not has_video and not has_audio:
            continue
        seen.add(format_id)
        formats.append(
            {
                "id": format_id,
                "label": _format_label(item),
                "ext": item.get("ext", "mp4"),
                "height": item.get("height"),
                "filesize": item.get("filesize") or item.get("filesize_approx"),
                "has_audio": has_audio,
                "has_video": has_video,
                "is_progressive": has_video and has_audio,
            }
        )

    formats.sort(key=lambda item: (item.get("height") or 0, item["has_audio"]), reverse=True)
    return MediaResult(
        title=info.get("title") or "Untitled media",
        thumbnail=info.get("thumbnail"),
        duration=info.get("duration"),
        formats=formats[:30],
        original=info,
    )


def stream_media(url: str, format_id: str) -> tuple[Iterator[bytes], str, str]:
    url = _resolve_platform_url(url)
    options = _base_options()
    options.update(
        {
            "format": f"{format_id}+bestaudio/{format_id}",
            "merge_output_format": "mp4",
            "outtmpl": "-",
            "quiet": True,
        }
    )
    with yt_dlp.YoutubeDL(options) as client:
        info = client.extract_info(url, download=False)
        requested = info.get("requested_formats") or []
        video_url = requested[0].get("url") if requested else info.get("url")
        audio_url = requested[1].get("url") if len(requested) > 1 else None
        title = re.sub(r"[^A-Za-z0-9._ -]", "", info.get("title", "media")).strip() or "media"
        if not video_url:
            raise ValueError("No playable stream was returned by the extractor")

    if audio_url:
        import subprocess

        command = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-i", video_url,
            "-i", audio_url, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
            "-c:a", "aac", "-movflags", "frag_keyframe+empty_moov", "-f", "mp4", "pipe:1",
        ]
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        assert process.stdout is not None
        return iter(lambda: process.stdout.read(1024 * 256), b""), f"{title}.mp4", "video/mp4"

    response = requests.get(video_url, headers={"User-Agent": USER_AGENT}, stream=True, timeout=30)
    response.raise_for_status()
    return response.iter_content(chunk_size=1024 * 256), f"{title}.{info.get('ext', 'mp4')}", f"video/{info.get('ext', 'mp4')}"
