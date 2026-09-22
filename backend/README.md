# MediaFlow API

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

FFmpeg must be installed and available on `PATH`. Set `MEDIAFLOW_COOKIES_FILE` only when a platform requires an exported cookie jar for content you are authorized to access.

For local testing, you can use cookies from a browser profile you control instead of exporting a file:

```powershell
$env:MEDIAFLOW_COOKIES_FROM_BROWSER="chrome"
python -m uvicorn backend.main:app --reload --port 8000
```

Close the browser first if its cookie database is locked. Never expose browser cookies to the frontend or commit them to Git.
