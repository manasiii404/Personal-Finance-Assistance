"""
PERSONAL-FINANCE-ASSISTANCE — MASTER SETUP SCRIPT
Run this from inside the Personal-Finance-Assistance folder.

Usage (PowerShell):
    cd Personal-Finance-Assistance
    python setup.py

Installs:
  - Web Frontend  (React + Vite + Tailwind)
  - Backend       (Node.js + Express + Prisma)
  - ML Service    (Python + FastAPI + Prophet + scikit-learn)

Also auto-detects DATABASE_URL and patches prisma/schema.prisma
to match the correct database provider (mongodb/postgresql/mysql/sqlite).
"""

import subprocess
import sys
import os
import shutil
import platform
import re
import time

# ─── Colors ───────────────────────────────────────────────────────────────────
class C:
    CYAN   = "\033[96m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    RED    = "\033[91m"
    WHITE  = "\033[97m"
    RESET  = "\033[0m"

def header(text):
    print(f"\n{C.CYAN}{'='*60}{C.RESET}")
    print(f"{C.CYAN}  {text}{C.RESET}")
    print(f"{C.CYAN}{'='*60}{C.RESET}")

def ok(text):    print(f"{C.GREEN}  [OK]    {text}{C.RESET}")
def warn(text):  print(f"{C.YELLOW}  [WARN]  {text}{C.RESET}")
def error(text): print(f"{C.RED}  [ERROR] {text}{C.RESET}")
def info(text):  print(f"{C.WHITE}  [INFO]  {text}{C.RESET}")

# ─── Paths ────────────────────────────────────────────────────────────────────
ROOT        = os.path.dirname(os.path.abspath(__file__))   # Personal-Finance-Assistance/
BACKEND_DIR = os.path.join(ROOT, "backend")                # backend/
ML_DIR      = os.path.join(ROOT, "ml-service")             # ml-service/
SCHEMA_FILE = os.path.join(BACKEND_DIR, "prisma", "schema.prisma")
ENV_FILE    = os.path.join(BACKEND_DIR, ".env")

IS_WIN = platform.system() == "Windows"

# ─── Helpers ──────────────────────────────────────────────────────────────────
def run(cmd, cwd=None, fail_ok=False):
    if isinstance(cmd, list):
        info(f"Running: {' '.join(cmd)}")
    else:
        info(f"Running: {cmd}")
    result = subprocess.run(cmd, cwd=cwd, shell=IS_WIN or isinstance(cmd, str))
    if result.returncode != 0 and not fail_ok:
        warn(f"Command exited with code {result.returncode}")
    return result.returncode

def get_version(cmd):
    try:
        r = subprocess.run(f"{cmd} --version", capture_output=True, text=True, shell=True)
        return (r.stdout + r.stderr).strip()
    except Exception:
        return None

def npm_install(directory, label):
    if not os.path.isdir(directory):
        warn(f"{label} folder not found — skipping: {directory}")
        return
    info(f"Installing {label} packages...")
    code = run(["npm", "install", "--legacy-peer-deps"], cwd=directory)
    if code != 0:
        warn("Retrying with --force...")
        run(["npm", "install", "--force"], cwd=directory, fail_ok=True)
    else:
        ok(f"{label} npm packages installed")

# ─── DB Detection ─────────────────────────────────────────────────────────────
def detect_db_provider(env_path: str) -> str:
    """
    Read DATABASE_URL from .env and detect provider.
    Returns: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite'
    """
    if not os.path.isfile(env_path):
        return "mongodb"  # default

    with open(env_path, "r") as f:
        for line in f:
            line = line.strip()
            if line.startswith("DATABASE_URL"):
                url = line.split("=", 1)[1].strip().strip('"').strip("'")
                if url.startswith("mongodb"):
                    return "mongodb"
                elif url.startswith("postgresql") or url.startswith("postgres"):
                    return "postgresql"
                elif url.startswith("mysql"):
                    return "mysql"
                elif url.startswith("sqlite") or url.endswith(".db"):
                    return "sqlite"
    return "mongodb"

# ─── Prisma Schema Patcher ────────────────────────────────────────────────────
def patch_prisma_schema(schema_path: str, provider: str):
    """
    Dynamically update prisma/schema.prisma based on detected DB provider.
    - MongoDB   : keeps @db.ObjectId, @map("_id"), auto() IDs    (no change)
    - PostgreSQL/MySQL/SQLite : removes MongoDB-specific annotations, switches to uuid()
    """
    if not os.path.isfile(schema_path):
        error(f"schema.prisma not found at: {schema_path}")
        return

    with open(schema_path, "r") as f:
        content = f.read()

    # ── Always update the datasource provider ──────────────────────────────
    content = re.sub(
        r'(datasource\s+db\s*\{[^}]*provider\s*=\s*")[^"]*(")',
        rf'\g<1>{provider}\g<2>',
        content,
        flags=re.DOTALL
    )

    if provider == "mongodb":
        # MongoDB: restore ObjectId-style IDs if they were changed
        # Check if already correct
        if '@db.ObjectId' in content:
            ok("schema.prisma already has MongoDB annotations — no change needed")
        else:
            # Re-patch to MongoDB style
            content = patch_to_mongo(content)
        info(f"Prisma schema set to provider: mongodb")

    else:
        # SQL databases: remove ALL MongoDB-specific annotations
        original = content

        # 1. Replace @id @default(auto()) @map("_id") @db.ObjectId → @id @default(uuid())
        content = re.sub(
            r'@id\s+@default\(auto\(\)\)\s+@map\("_id"\)\s+@db\.ObjectId',
            '@id @default(uuid())',
            content
        )

        # 2. Remove @db.ObjectId from foreign key fields (e.g. userId String @db.ObjectId)
        content = re.sub(r'\s*@db\.ObjectId', '', content)

        # 3. Remove @map("_id") anywhere remaining
        content = re.sub(r'\s*@map\("_id"\)', '', content)

        if content != original:
            ok(f"Patched schema.prisma for provider: {provider} — removed MongoDB annotations, switched to uuid()")
        else:
            ok(f"schema.prisma already compatible with {provider}")

    # Write back
    with open(schema_path, "w") as f:
        f.write(content)

    # Show the resulting datasource block for confirmation
    ds_match = re.search(r'datasource\s+db\s*\{[^}]*\}', content, re.DOTALL)
    if ds_match:
        info(f"Resulting datasource block:\n{ds_match.group()}")

def patch_to_mongo(content: str) -> str:
    """Restore MongoDB-style IDs if somehow stripped."""
    content = re.sub(
        r'@id\s+@default\(uuid\(\)\)',
        '@id @default(auto()) @map("_id") @db.ObjectId',
        content
    )
    return content

# ─── Prisma Generate with EPERM retry ─────────────────────────────────────────
def prisma_generate(backend_dir: str):
    """
    Run prisma generate. On EPERM (file locked by running backend), retry after delay.
    The backend process locks query_engine-windows.dll.node — we wait and retry.
    """
    info("Generating Prisma client...")
    for attempt in range(1, 4):
        result = subprocess.run(
            ["npx", "prisma", "generate"],
            cwd=backend_dir,
            shell=IS_WIN,
            capture_output=True,
            text=True
        )
        output = result.stdout + result.stderr

        if result.returncode == 0:
            ok("Prisma client generated successfully")
            return True

        if "EPERM" in output or "operation not permitted" in output.lower():
            warn(f"EPERM error — the backend server may be running and locking the file.")
            warn(f"Please STOP the running backend (Ctrl+C in its terminal), then press Enter here.")
            input("  Press Enter to retry...")
            time.sleep(2)
        else:
            warn(f"Prisma generate failed (attempt {attempt}/3):\n{output[-500:]}")
            if attempt < 3:
                info("Retrying in 3 seconds...")
                time.sleep(3)
            else:
                error("Prisma generate failed after 3 attempts.")
                warn("You can run manually: cd backend && npx prisma generate")
                return False

    return False

# ══════════════════════════════════════════════════════════════════════════════
#  MAIN SETUP
# ══════════════════════════════════════════════════════════════════════════════

# ─── STEP 0 — System Checks ───────────────────────────────────────────────────
header("STEP 0 — Checking System Requirements")

# Node.js
node_ver = get_version("node")
if node_ver:
    try:
        major = int(node_ver.lstrip("v").split(".")[0])
        if major >= 18:
            ok(f"Node.js {node_ver} (required: v18+)")
        else:
            warn(f"Node.js {node_ver} too old. Need v18+. Download: https://nodejs.org")
    except Exception:
        ok(f"Node.js found: {node_ver}")
else:
    error("Node.js NOT found. Download: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi")
    input("Install Node.js v20 LTS then press Enter to exit...")
    sys.exit(1)

npm_ver = get_version("npm")
if npm_ver:
    ok(f"npm {npm_ver}")
else:
    error("npm not found. Reinstall Node.js.")
    sys.exit(1)

ok(f"Python {platform.python_version()} (current interpreter)")

pip_ver = get_version("pip")
if pip_ver:
    ok(f"pip {pip_ver}")
else:
    warn("pip not found — bootstrapping...")
    run([sys.executable, "-m", "ensurepip", "--upgrade"], fail_ok=True)

git_ver = get_version("git")
if git_ver:
    ok(f"Git: {git_ver}")
else:
    warn("Git not found. Download: https://git-scm.com/download/win")

# ─── STEP 1 — Detect Database & Patch Schema ──────────────────────────────────
header("STEP 1 — Database Detection & Schema Configuration")

# Check .env first
if not os.path.isfile(ENV_FILE):
    env_example = os.path.join(BACKEND_DIR, ".env.example")
    if os.path.isfile(env_example):
        shutil.copy(env_example, ENV_FILE)
        ok("Copied .env.example → backend/.env")
    else:
        warn("No backend/.env found. Defaulting to MongoDB.")

provider = detect_db_provider(ENV_FILE)
info(f"Detected database provider: {C.CYAN}{provider.upper()}{C.WHITE}")

# Patch schema.prisma based on provider
if os.path.isfile(SCHEMA_FILE):
    patch_prisma_schema(SCHEMA_FILE, provider)
else:
    warn(f"schema.prisma not found at {SCHEMA_FILE}")

# ─── STEP 2 — Web Frontend ────────────────────────────────────────────────────
header("STEP 2 — Web Frontend (React + Vite + Tailwind)")
npm_install(ROOT, "Web Frontend")

# ─── STEP 3 — Backend ─────────────────────────────────────────────────────────
header("STEP 3 — Backend (Node.js + Express + Prisma)")
npm_install(BACKEND_DIR, "Backend")
prisma_generate(BACKEND_DIR)

# ─── STEP 4 — ML Service ──────────────────────────────────────────────────────
header("STEP 4 — ML Service (Python + FastAPI + Prophet + scikit-learn)")

req_file = os.path.join(ML_DIR, "requirements.txt")
if os.path.isfile(req_file):
    info(f"Installing from requirements.txt...")
    code = run(
        [sys.executable, "-m", "pip", "install", "-r", req_file],
        cwd=ML_DIR
    )
    if code == 0:
        ok("ML service packages installed from requirements.txt")
    else:
        warn("requirements.txt install failed. Trying pinned fallback list...")
        # Fallback: install only the core packages needed
        FALLBACK = [
            "fastapi==0.109.2",
            "uvicorn==0.27.1",
            "pydantic==2.6.1",
            "python-multipart==0.0.9",
            "scikit-learn==1.4.0",
            "pandas==2.2.0",
            "numpy==1.26.4",
            "joblib==1.3.2",
            "python-dotenv==1.0.0",
        ]
        run([sys.executable, "-m", "pip", "install"] + FALLBACK, fail_ok=True)

        # Prophet separately — it has special build deps
        info("Installing prophet (may take a few minutes — it builds from source)...")
        code2 = run([sys.executable, "-m", "pip", "install", "prophet==1.1.5"], fail_ok=True)
        if code2 != 0:
            warn("Prophet install failed. Trying pystan + prophet separately...")
            run([sys.executable, "-m", "pip", "install", "pystan==3.7.0"], fail_ok=True)
            run([sys.executable, "-m", "pip", "install", "prophet==1.1.5"], fail_ok=True)
else:
    warn("requirements.txt not found in ml-service/ — skipping ML install")

# ─── STEP 5 — Final .env Check ────────────────────────────────────────────────
header("STEP 5 — Verifying .env Files")

if os.path.isfile(ENV_FILE):
    ok("backend/.env found")
    # Print current DATABASE_URL (masked)
    with open(ENV_FILE) as f:
        for line in f:
            if line.startswith("DATABASE_URL"):
                url = line.split("=", 1)[1].strip().strip('"')
                # Mask password
                masked = re.sub(r':[^:@]+@', ':****@', url)
                info(f"DATABASE_URL: {masked}")
                break
else:
    error("backend/.env still missing — please create it manually.")

# ─── DONE ─────────────────────────────────────────────────────────────────────
header("SETUP COMPLETE!")
print(f"""
{C.GREEN}Start the project — open 3 separate terminals:{C.RESET}

  {C.CYAN}TERMINAL 1 — Backend:{C.RESET}
    cd backend
    {C.YELLOW}npm run dev{C.RESET}          → http://localhost:3000

  {C.CYAN}TERMINAL 2 — ML Service:{C.RESET}
    cd ml-service
    {C.YELLOW}python main.py{C.RESET}       → http://localhost:8000

  {C.CYAN}TERMINAL 3 — Web Frontend:{C.RESET}
    (stay in this folder)
    {C.YELLOW}npm run dev{C.RESET}          → http://localhost:5173

  {C.CYAN}Database detected:{C.RESET} {C.YELLOW}{provider.upper()}{C.RESET}
""")

input("Press Enter to exit...")
