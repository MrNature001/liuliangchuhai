import json
from pathlib import Path

import httpx
import pytest
from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanUnavailable,
    InvalidDigitalHumanResponse,
)
from liuliangchuhai.infrastructure.digital_human.uploads import parse_policy, upload_file

POLICY = {
    "data": {
        "upload_host": "https://bucket.oss.example",
        "object_key": "dashscope/narration.mp3",
        "signature": "sig",
        "policy": "pol",
        "access_key_id": "ak",
        "oss_access_key_id": "oak",
        "x_oss_signature_version": "OSS4-HMAC-SHA256",
        "x_oss_credential": "cred",
        "x_oss_date": "2026-10-23T00:00:00Z",
        "x_oss_security_token": "token",
    }
}


def _audio(tmp_path: Path) -> Path:
    path = tmp_path / "narration.mp3"
    path.write_bytes(b"ID3-fake-audio")
    return path


def test_parse_policy_reads_the_nested_data_object() -> None:
    policy = parse_policy(POLICY)

    assert policy.upload_host == "https://bucket.oss.example"
    assert policy.object_key == "dashscope/narration.mp3"
    assert policy.x_oss_security_token == "token"


@pytest.mark.parametrize("missing", ["upload_host", "object_key", "policy"])
def test_parse_policy_reports_the_missing_field(missing: str) -> None:
    payload = {"data": {**POLICY["data"], missing: ""}}

    with pytest.raises(InvalidDigitalHumanResponse, match=missing):
        parse_policy(payload)


def test_parse_policy_rejects_a_non_object_payload() -> None:
    with pytest.raises(InvalidDigitalHumanResponse):
        parse_policy(["not", "an", "object"])


@pytest.mark.asyncio
async def test_upload_file_returns_an_oss_url(tmp_path: Path) -> None:
    seen: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "GET":
            return httpx.Response(200, json=POLICY)
        seen["url"] = str(request.url)
        seen["body"] = request.content
        return httpx.Response(200, text="")

    transport = httpx.MockTransport(handler)
    url = await upload_file(
        api_key="sk-test", model="videoretalk", source=_audio(tmp_path), transport=transport
    )

    assert url == "oss://dashscope/narration.mp3"
    assert seen["url"] == "https://bucket.oss.example"
    assert b"ID3-fake-audio" in seen["body"]


@pytest.mark.asyncio
async def test_upload_file_rejects_an_empty_file(tmp_path: Path) -> None:
    empty = tmp_path / "empty.mp3"
    empty.write_bytes(b"")

    with pytest.raises(DigitalHumanUnavailable, match="empty"):
        await upload_file(
            api_key="sk-test",
            model="videoretalk",
            source=empty,
            transport=httpx.MockTransport(lambda request: httpx.Response(200, json=POLICY)),
        )


@pytest.mark.asyncio
async def test_upload_file_maps_an_auth_failure(tmp_path: Path) -> None:
    transport = httpx.MockTransport(
        lambda request: httpx.Response(401, json={"code": "InvalidApiKey"})
    )

    with pytest.raises(DigitalHumanUnavailable, match="API key"):
        await upload_file(
            api_key="sk-bad", model="videoretalk", source=_audio(tmp_path), transport=transport
        )


@pytest.mark.asyncio
async def test_upload_file_maps_a_storage_failure(tmp_path: Path) -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        if request.method == "GET":
            return httpx.Response(200, json=POLICY)
        return httpx.Response(403, text="denied")

    with pytest.raises(DigitalHumanUnavailable, match="upload failed"):
        await upload_file(
            api_key="sk-test",
            model="videoretalk",
            source=_audio(tmp_path),
            transport=httpx.MockTransport(handler),
        )


@pytest.mark.asyncio
async def test_upload_file_rejects_an_unreadable_policy(tmp_path: Path) -> None:
    transport = httpx.MockTransport(lambda request: httpx.Response(200, text="not json"))

    with pytest.raises(InvalidDigitalHumanResponse):
        await upload_file(
            api_key="sk-test", model="videoretalk", source=_audio(tmp_path), transport=transport
        )


def test_policy_json_is_plain_data() -> None:
    assert json.loads(json.dumps(POLICY))["data"]["upload_host"] == "https://bucket.oss.example"
