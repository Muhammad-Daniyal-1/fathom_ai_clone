#!/usr/bin/env python3
"""Capture Cursor prompt + final response turns into .agent-logs/."""

from __future__ import annotations

import fcntl
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

AUTHOR = "Muhammad-Daniyal-1"
TOOL = "cursor"
PROJECT = "fathom_ai_clone"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso(ts: datetime) -> str:
    return ts.strftime("%Y-%m-%dT%H:%M:%S.") + f"{ts.microsecond // 1000:03d}Z"


def model_name(payload: dict) -> str:
    return (
        payload.get("model_id")
        or payload.get("model")
        or "unknown"
    )


def repo_root(payload: dict) -> Path:
    roots = payload.get("workspace_roots") or []
    for root in roots:
        p = Path(root)
        if (p / ".cursor" / "hooks" / "agent-capture.py").exists():
            return p
        if (p / ".agent-logs").exists() or (p / ".git").exists():
            return p
    # Fallback: walk up from this script
    return Path(__file__).resolve().parents[2]


def short_id(session_id: str) -> str:
    return (session_id or "unknown")[:8]


def state_paths(root: Path, session_id: str) -> tuple[Path, Path]:
    state_dir = root / ".agent-logs" / ".state"
    state_dir.mkdir(parents=True, exist_ok=True)
    return state_dir / f"{session_id}.json", state_dir / f"{session_id}.lock"


def load_state(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_state(path: Path, state: dict) -> None:
    path.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def frontmatter(state: dict) -> str:
    return (
        "\n".join(
            [
                "---",
                f"session_id: {state['session_id']}",
                f"date: {state['date']}",
                f"author: {AUTHOR}",
                f"model: {state.get('last_model', 'unknown')}",
                f"tool: {TOOL}",
                f"project: {PROJECT}",
                f"total_exchanges: {state.get('total_exchanges', 0)}",
                f"first_prompt_time: {state.get('first_prompt_time', '')}",
                f"last_prompt_time: {state.get('last_prompt_time', '')}",
                "---",
                "",
                f"# Session Log - {state['date']}",
                "",
                f"Session: `{short_id(state['session_id'])}` | Project: `{PROJECT}` | Author: `{AUTHOR}`",
                "",
                "---",
            ]
        )
        + "\n\n"
    )


def ensure_log(root: Path, state: dict) -> Path:
    logs = root / ".agent-logs"
    logs.mkdir(parents=True, exist_ok=True)
    log_path = Path(state["log_path"])
    if not log_path.is_absolute():
        log_path = root / log_path
    if not log_path.exists():
        log_path.write_text(frontmatter(state), encoding="utf-8")
    return log_path


def rewrite_frontmatter(log_path: Path, state: dict) -> None:
    text = log_path.read_text(encoding="utf-8")
    entry_idx = text.find("[LOG_ENTRY")
    if entry_idx != -1:
        log_path.write_text(frontmatter(state) + text[entry_idx:], encoding="utf-8")
    else:
        log_path.write_text(frontmatter(state), encoding="utf-8")


def append_entry(log_path: Path, entry: str) -> None:
    with log_path.open("a", encoding="utf-8") as f:
        f.write(entry)
        if not entry.endswith("\n"):
            f.write("\n")


def replace_response_entry(log_path: Path, num: int, session_short: str, timestamp: str, model: str, text: str) -> None:
    content = log_path.read_text(encoding="utf-8")
    pattern = re.compile(
        rf"\[LOG_ENTRY type=RESPONSE num={num} session={re.escape(session_short)}\].*?(?=\n\[LOG_ENTRY |\Z)",
        re.DOTALL,
    )
    new_block = (
        f"[LOG_ENTRY type=RESPONSE num={num} session={session_short}]\n"
        f"timestamp: {timestamp}\n"
        f"model: {model}\n"
        f"\n"
        f"{text.rstrip()}\n"
        f"\n"
    )
    if pattern.search(content):
        content = pattern.sub(new_block, content, count=1)
        log_path.write_text(content, encoding="utf-8")
    else:
        append_entry(log_path, "\n" + new_block if not content.endswith("\n") else new_block)


def handle_prompt(payload: dict, root: Path) -> dict:
    session_id = payload.get("conversation_id") or payload.get("session_id") or "unknown"
    state_path, lock_path = state_paths(root, session_id)
    lock_path.touch(exist_ok=True)
    with lock_path.open("a+", encoding="utf-8") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        state = load_state(state_path)
        now = utc_now()
        ts = iso(now)
        model = model_name(payload)
        prompt = payload.get("prompt") or ""

        if not state:
            fname = f"{now.strftime('%Y-%m-%d_%H-%M-%S')}_{session_id}.md"
            state = {
                "session_id": session_id,
                "date": now.strftime("%Y-%m-%d"),
                "log_path": str(Path(".agent-logs") / fname),
                "total_exchanges": 0,
                "first_prompt_time": ts,
                "last_prompt_time": ts,
                "last_model": model,
                "pending_num": 0,
                "pending_generation_id": None,
            }

        state["total_exchanges"] = int(state.get("total_exchanges", 0)) + 1
        num = state["total_exchanges"]
        state["pending_num"] = num
        state["pending_generation_id"] = payload.get("generation_id")
        state["last_prompt_time"] = ts
        state["last_model"] = model
        if not state.get("first_prompt_time"):
            state["first_prompt_time"] = ts

        log_path = ensure_log(root, state)
        rewrite_frontmatter(log_path, state)

        sid = short_id(session_id)
        entry = (
            f"[LOG_ENTRY type=PROMPT num={num} session={sid}]\n"
            f"timestamp: {ts}\n"
            f"model: {model}\n"
            f"\n"
            f"{prompt.rstrip()}\n"
            f"\n"
        )
        append_entry(log_path, entry)
        save_state(state_path, state)

    return {"continue": True}


def handle_response(payload: dict, root: Path) -> dict:
    session_id = payload.get("conversation_id") or payload.get("session_id") or "unknown"
    state_path, lock_path = state_paths(root, session_id)
    if not state_path.exists():
        # Response without a captured prompt in this repo — ignore
        return {}

    lock_path.touch(exist_ok=True)
    with lock_path.open("a+", encoding="utf-8") as lock:
        fcntl.flock(lock.fileno(), fcntl.LOCK_EX)
        state = load_state(state_path)
        if not state:
            return {}

        now = utc_now()
        ts = iso(now)
        model = model_name(payload)
        text = payload.get("text") or ""
        num = int(state.get("pending_num") or state.get("total_exchanges") or 1)
        state["last_model"] = model

        log_path = ensure_log(root, state)
        rewrite_frontmatter(log_path, state)
        replace_response_entry(log_path, num, short_id(session_id), ts, model, text)
        save_state(state_path, state)

    return {}


def main() -> None:
    raw = sys.stdin.read()
    if not raw.strip():
        print("{}")
        return

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        print("{}")
        return

    event = payload.get("hook_event_name") or ""
    root = repo_root(payload)

    # Debug breadcrumb for Hooks output channel troubleshooting
    debug_path = root / ".agent-logs" / ".state" / "last-hook.json"
    try:
        debug_path.parent.mkdir(parents=True, exist_ok=True)
        debug_path.write_text(
            json.dumps(
                {
                    "event": event,
                    "conversation_id": payload.get("conversation_id"),
                    "generation_id": payload.get("generation_id"),
                    "model": model_name(payload),
                    "received_at": iso(utc_now()),
                    "prompt_len": len(payload.get("prompt") or ""),
                    "text_len": len(payload.get("text") or ""),
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
    except Exception:
        pass

    if event == "beforeSubmitPrompt":
        out = handle_prompt(payload, root)
        print(json.dumps(out))
    elif event == "afterAgentResponse":
        out = handle_response(payload, root)
        print(json.dumps(out))
    else:
        print("{}")


if __name__ == "__main__":
    main()
