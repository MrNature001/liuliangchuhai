"""DashScope temporary file hosting.

`videoretalk` fetches both its inputs by URL, so a locally rendered narration
track has to become reachable before the render can be submitted. DashScope
offers a two-step upload: ask for an OSS policy, POST the bytes straight to the
bucket, then refer to the file by an ``oss://`` URL. Nothing here needs a
public server or a tunnel, which is what keeps the whole path runnable from a
laptop.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Final

import httpx

from liuliangchuhai.application.ports.digital_human_errors import (
    DigitalHumanUnavailable,
    InvalidDigitalHumanResponse,
)

_POLICY_PATH: Final = "/uploads"
_POLICY_TIMEOUT: Final = 30.0
_UPLOAD_TIMEOUT: Final = 120.0


@dataclass(frozen=True, slots=True)
class UploadPolicy:
    """One signed OSS slot, as returned by the policy endpoint."""

    upload_host: str
    object_key: str
    signature: str
    policy: str
    access_key_id: str
    oss_access_key_id: str
    x_oss_signature_version: str
    x_oss_credential: str
    x_oss_date: str
    x_oss_security_token: str


def _policy_field(payload: object, name: str) -> str:
    if not isinstance(payload, dict):
        raise InvalidDigitalHumanResponse("DashScope returned an unreadable upload policy")
    # DashScope nests the signed fields under `data`.
    data = payload.get("data", payload)
    if not isinstance(data, dict):
        raise InvalidDigitalHumanResponse("DashScope returned an unreadable upload policy")
    value = data.get(name)
    if not isinstance(value, str) or not value.strip():
        raise InvalidDigitalHumanResponse(f"DashScope upload policy is missing {name}")
    return value.strip()


def parse_policy(payload: object) -> UploadPolicy:
    """Map the policy response onto the fields the OSS POST needs."""
    return UploadPolicy(
        upload_host=_policy_field(payload, "upload_host"),
        object_key=_policy_field(payload, "object_key"),
        signature=_policy_field(payload, "signature"),
        policy=_policy_field(payload, "policy"),
        access_key_id=_policy_field(payload, "access_key_id"),
        oss_access_key_id=_policy_field(payload, "oss_access_key_id"),
        x_oss_signature_version=_policy_field(payload, "x_oss_signature_version"),
        x_oss_credential=_policy_field(payload, "x_oss_credential"),
        x_oss_date=_policy_field(payload, "x_oss_date"),
        x_oss_security_token=_policy_field(payload, "x_oss_security_token"),
    )


async def _request_policy(client: httpx.AsyncClient, api_key: str, model: str) -> UploadPolicy:
    try:
        response = await client.get(
            _POLICY_PATH,
            params={"action": "getPolicy", "model": model},
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=_POLICY_TIMEOUT,
        )
    except httpx.HTTPError:
        raise DigitalHumanUnavailable("DashScope upload policy request failed") from None

    if response.status_code in {401, 403}:
        raise DigitalHumanUnavailable("DashScope rejected the API key")
    if not response.is_success:
        raise DigitalHumanUnavailable("DashScope upload policy request failed")

    try:
        payload = response.json()
    except ValueError:
        raise InvalidDigitalHumanResponse(
            "DashScope returned an unreadable upload policy"
        ) from None
    return parse_policy(payload)


async def upload_file(
    *,
    api_key: str,
    model: str,
    source: Path,
    transport: httpx.AsyncBaseTransport | None = None,
    base_url: str = "https://dashscope.aliyuncs.com/api/v1",
) -> str:
    """Upload ``source`` and return the ``oss://`` URL DashScope accepts.

    The multipart field order is fixed by the OSS signature, so the signed
    fields are sent before ``file`` and the file is always last.
    """
    try:
        content = source.read_bytes()
    except OSError as error:
        raise DigitalHumanUnavailable("narration audio could not be read") from error
    if not content:
        raise DigitalHumanUnavailable("narration audio is empty")

    async with httpx.AsyncClient(base_url=base_url, transport=transport) as client:
        policy = await _request_policy(client, api_key, model)
        fields = {
            "OSSAccessKeyId": policy.access_key_id,
            "Signature": policy.signature,
            "policy": policy.policy,
            "x-oss-signature-version": policy.x_oss_signature_version,
            "x-oss-credential": policy.x_oss_credential,
            "x-oss-date": policy.x_oss_date,
            "x-oss-security-token": policy.x_oss_security_token,
            "key": policy.object_key,
            "success_action_status": "200",
        }
        try:
            response = await client.post(
                policy.upload_host,
                data=fields,
                files={"file": (source.name, content, "application/octet-stream")},
                timeout=_UPLOAD_TIMEOUT,
            )
        except httpx.HTTPError:
            raise DigitalHumanUnavailable("DashScope upload failed") from None

    if not response.is_success:
        raise DigitalHumanUnavailable("DashScope upload failed")
    return f"oss://{policy.object_key}"


__all__ = ["UploadPolicy", "parse_policy", "upload_file"]
