"""Invoke the web app's TypeScript compiler without depending on a `pnpm` shim.

On Windows `pnpm` resolves to a `.cmd` file that requires `cmd.exe`; interpreter
subprocesses do not always have `ComSpec` set, so resolving the local `tsc`
directly keeps contract tests runnable from any shell.
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

WEB = Path(__file__).resolve().parents[4] / "apps" / "web"


def tsc_command() -> list[str]:
    tsc_js = WEB / "node_modules" / "typescript" / "bin" / "tsc"
    if tsc_js.is_file():
        node = shutil.which("node")
        if node:
            return [node, str(tsc_js)]
    shim = WEB / "node_modules" / ".bin" / ("tsc.CMD" if sys.platform == "win32" else "tsc")
    if shim.is_file():
        return [str(shim)]
    raise FileNotFoundError(f"TypeScript compiler not found under {WEB / 'node_modules'}")
