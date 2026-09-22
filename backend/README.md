# MediaFlow API

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

FFmpeg must be installed and available on `PATH`. Set `MEDIAFLOW_COOKIES_FILE` only when a platform requires an exported cookie jar for content you are authorized to access.
