#!/usr/bin/env python3
"""Export legacy tc-hawk aigc.Flow declarations as Pipeline candidates."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tempfile
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = PROJECT_ROOT / "src" / "lib" / "pipeline-data.ts"


def find_balanced(source: str, open_index: int) -> tuple[str, int]:
    depth = 0
    quote = ""
    escaped = False
    for index in range(open_index, len(source)):
        char = source[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = ""
            continue
        if char in {'"', "'", "`"}:
            quote = char
        elif char == "(":
            depth += 1
        elif char == ")":
            depth -= 1
            if depth == 0:
                return source[open_index + 1 : index], index + 1
    raise ValueError("unbalanced Go call")


def split_top_level(source: str) -> list[str]:
    result: list[str] = []
    start = 0
    depths = {"(": 0, "[": 0, "{": 0}
    closing = {")": "(", "]": "[", "}": "{"}
    quote = ""
    escaped = False
    for index, char in enumerate(source):
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = ""
            continue
        if char in {'"', "'", "`"}:
            quote = char
        elif char in depths:
            depths[char] += 1
        elif char in closing:
            depths[closing[char]] -= 1
        elif char == "," and all(depth == 0 for depth in depths.values()):
            result.append(source[start:index].strip())
            start = index + 1
    result.append(source[start:].strip())
    return result


def go_string(value: str) -> str:
    value = value.strip()
    if len(value) < 2 or value[0] != '"' or value[-1] != '"':
        return ""
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value[1:-1]


def extract_string_list(expression: str) -> list[str]:
    return re.findall(r'"((?:\\.|[^"\\])*)"', expression)


def flow_variable(source: str, index: int) -> str:
    line_start = source.rfind("\n", 0, index) + 1
    prefix = source[line_start:index]
    match = re.search(r"(\w+)\s*:?=\s*$", prefix)
    return match.group(1) if match else ""


def flow_block(source: str, start: int, variable: str) -> str:
    if variable:
        register = re.search(r"\b" + re.escape(variable) + r"\.Register\s*\(\s*\)", source[start:])
        if register:
            return source[start : start + register.end()]
    next_function = source.find("\nfunc ", start + 1)
    return source[start : next_function if next_function != -1 else len(source)]


def extract_steps(block: str) -> list[dict[str, object]]:
    steps: list[dict[str, object]] = []
    for order, stage_match in enumerate(re.finditer(r"\bAddStage\s*\(", block), start=1):
        stage_args, _ = find_balanced(block, block.find("(", stage_match.start()))
        if "aigc.NewStage" in stage_args:
            nested_index = stage_args.find("aigc.NewStage")
            new_stage_args, _ = find_balanced(stage_args, stage_args.find("(", nested_index))
            parts = split_top_level(new_stage_args)
            stage_id = go_string(parts[0]) if parts else ""
            stage_name = go_string(parts[1]) if len(parts) > 1 else ""
            steps.append({
                "stepOrder": order,
                "stepKind": "inline",
                "entityId": None,
                "sourceReference": stage_id or None,
                "displayName": stage_name or stage_id or "内联步骤",
                "provenanceStatus": "verified" if stage_id else "unknown",
            })
            continue

        get_match = re.search(r"\bstages\.Get\s*\(", stage_args)
        if get_match:
            steps.append({
                "stepOrder": order,
                "stepKind": "handler",
                "entityId": None,
                "sourceReference": None,
                "displayName": "Handler 引用待映射",
                "provenanceStatus": "needs_confirmation",
            })
            continue

        steps.append({
            "stepOrder": order,
            "stepKind": "unknown",
            "entityId": None,
            "sourceReference": None,
            "displayName": "未解析步骤",
            "provenanceStatus": "unknown",
        })
    return steps


def extract_pipelines(path: Path) -> list[dict[str, object]]:
    source = path.read_text("utf-8", errors="ignore")
    pipelines: list[dict[str, object]] = []
    for match in re.finditer(r"\baigc\.NewFlow\s*\(", source):
        arguments, end = find_balanced(source, source.find("(", match.start()))
        parts = split_top_level(arguments)
        source_flow_id = go_string(parts[0]) if parts else ""
        if not source_flow_id:
            continue
        block = flow_block(source, end, flow_variable(source, match.start()))
        key_match = re.search(r'\bWithKeyField\s*\(\s*"([^"]+)"', arguments)
        output_match = re.search(r"\bWithOutputFields\s*\(", arguments)
        output_fields: list[str] = []
        if output_match:
            output_args, _ = find_balanced(arguments, arguments.find("(", output_match.start()))
            output_fields = extract_string_list(output_args)
        pipelines.append({
            "entityType": "pipeline",
            "pipelineId": source_flow_id,
            "displayName": source_flow_id,
            "sourceFlowIds": [source_flow_id],
            "status": "needs_confirmation",
            "registrationSource": "auto",
            "recommendable": False,
            "keyField": key_match.group(1) if key_match else None,
            "outputFields": output_fields,
            "steps": extract_steps(block),
            "provenanceStatus": "needs_confirmation",
            "costProfile": {
                "costValue": None,
                "costUnit": "次",
                "currency": "CNY",
                "isPlaceholder": True,
                "sourceStatus": "placeholder",
            },
            "resourceProfile": {
                "resourceId": None,
                "usageValue": None,
                "usageUnit": "路并发",
                "isPlaceholder": True,
                "sourceStatus": "placeholder",
            },
        })
    return pipelines


def render(pipelines: list[dict[str, object]]) -> str:
    serialized = json.dumps(pipelines, ensure_ascii=False, indent=2)
    return (
        "/* Generated by scripts/export_pipeline_candidates.py. Do not hand-edit. */\n\n"
        'import type { PipelineRecord } from "@/lib/catalog-types";\n\n'
        f"export const pipelineRecords: PipelineRecord[] = {serialized};\n"
    )


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(prefix=path.name, dir=path.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as temporary:
            temporary.write(content)
        Path(temporary_name).replace(path)
    except Exception:
        Path(temporary_name).unlink(missing_ok=True)
        raise


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    flow_root = args.source_root / "flows"
    if not flow_root.is_dir():
        raise SystemExit(f"tc-hawk flows directory not found: {flow_root}")
    pipelines = [
        pipeline
        for path in sorted(flow_root.glob("**/*.go"))
        for pipeline in extract_pipelines(path)
    ]
    ids = [str(pipeline["pipelineId"]) for pipeline in pipelines]
    duplicates = sorted({pipeline_id for pipeline_id in ids if ids.count(pipeline_id) > 1})
    if duplicates:
        raise SystemExit("duplicate Pipeline candidate IDs: " + ", ".join(duplicates))

    atomic_write(args.output.resolve(), render(pipelines))
    print(json.dumps({"pipelines": len(pipelines), "output": str(args.output.resolve())}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError) as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), file=sys.stderr)
        raise SystemExit(1)
