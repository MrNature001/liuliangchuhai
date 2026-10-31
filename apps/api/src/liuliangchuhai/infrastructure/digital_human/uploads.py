"""DashScope temporary file hosting.

The talking-head and speech-to-video models fetch their inputs by URL, so a
locally rendered narration has to become reachable before a render can be
submitted. DashScope offers a two-step upload: ask for an OSS policy, POST the
bytes straight to the bucket, then refer to the file by an ``oss://`` URL.
Nothing here needs a public server or a tunnel, which is what keeps the whole
path runnable from a laptop.

The policy response has two shapes in the wild. The older one hands back a
fixed ``object_key`` plus a full set of signed ``x-oss-*`` fields; the current
one hands back an ``upload_dir`` and leaves you to name the object. Both are
accepted here, because which one you get depends on the model and the account.
"""

from __future__ import annotations

from dataclasses import dataclass, field
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
    """One signed OSS slot, in either of the shapes DashScope returns."""

    upload_host: str
    signature: str
    policy: str
    oss_access_key_id: str
    # Older shape: the server names the object and signs every x-oss-* field.
    object_key: str = ""
    access_key_id: str = ""
    x_oss_signature_version: str = ""
    x_oss_credential: str = ""
    x_oss_date: str = ""
    x_oss_security_token: str = ""
    # Current shape: a directory prefix, and the caller picks the object name.
    upload_dir: str = ""
    x_oss_object_acl: str = ""
    x_oss_forbid_overwrite: str = ""
    extra: dict[str, str] = field(default_factory=dict)

    def key_for(self, filename: str) -> str:
        """Object key to POST, honouring whichever shape the server sent."""
        if self.object_key:
            return self.object_key
        directory = self.upload_dir.strip("/")
        return f"{directory}/{filename}" if directory else filename

    def form_fields(self, key: str) -> dict[str, str]:
        """Fields the OSS signature covers, in the order it expects them."""
        fields = {
            "OSSAccessKeyId": self.access_key_id or self.oss_access_key_id,
            "Signature": self.signature,
            "policy": self.policy,
            "key": key,
            "success_action_status": "200",
        }
        if self.x_oss_signature_version:
            fields["x-oss-signature-version"] = self.x_oss_signature_version
        if self.x_oss_credential:
            fields["x-oss-credential"] = self.x_oss_credential
        if self.x_oss_date:
            fields["x-oss-date"] = self.x_oss_date
        if self.x_oss_security_token:
            fields["x-oss-security-token"] = self.x_oss_security_token
        if self.x_oss_object_acl:
            fields["x-oss-object-acl"] = self.x_oss_object_acl
        if self.x_oss_forbid_overwrite:
            fields["x-oss-forbid-overwrite"] = self.x_oss_forbid_overwrite
        fields.update(self.extra)
        return fields


def _data(payload: object) -> dict[str, object]:
    if not isinstance(payload, dict):
        raise InvalidDigitalHumanResponse("DashScope returned an unreadable upload policy")
    # DashScope nests the signed fields under `data`.
    data = payload.get("data", payload)
    if not isinstance(data, dict):
        raise InvalidDigitalHumanResponse("DashScope returned an unreadable upload policy")
    return data


def _text(data: dict[str, object], name: str) -> str:
    value = data.get(name)
    return value.strip() if isinstance(value, str) and value.strip() else ""


def _require(value: str, name: str) -> str:
    if not value:
        raise InvalidDigitalHumanResponse(f"DashScope upload policy is missing {name}")
    return value


def parse_policy(payload: object) -> UploadPolicy:
    """Map either policy shape onto the fields the OSS POST needs."""
    data = _data(payload)
    object_key = _text(data, "object_key")
    upload_dir = _text(data, "upload_dir")
    if not object_key and not upload_dir:
        raise InvalidDigitalHumanResponse("DashScope upload policy is missing object_key")

    known = {
        "upload_host",
        "object_key",
        "signature",
        "policy",
        "access_key_id",
        "oss_access_key_id",
        "x_oss_signature_version",
        "x_oss_credential",
        "x_oss_date",
        "x_oss_security_token",
        "upload_dir",
        "x_oss_object_acl",
        "x_oss_forbid_overwrite",
        "expire_in_seconds",
        "max_file_size_mb",
        "capacity_limit_mb",
    }
    extra = {
        key: str(value)
        for key, value in data.items()
        if key not in known and isinstance(value, str) and key.startswith("x-oss-")
    }
    return UploadPolicy(
        upload_host=_require(_text(data, "upload_host"), "upload_host"),
        signature=_require(_text(data, "signature"), "signature"),
        policy=_require(_text(data, "policy"), "policy"),
        oss_access_key_id=_require(_text(data, "oss_access_key_id"), "oss_access_key_id"),
        object_key=object_key,
        access_key_id=_text(data, "access_key_id"),
        x_oss_signature_version=_text(data, "x_oss_signature_version"),
        x_oss_credential=_text(data, "x_oss_credential"),
        x_oss_date=_text(data, "x_oss_date"),
        x_oss_security_token=_text(data, "x_oss_security_token"),
        upload_dir=upload_dir,
        x_oss_object_acl=_text(data, "x_oss_object_acl"),
        x_oss_forbid_overwrite=_text(data, "x_oss_forbid_overwrite"),
        extra=extra,
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

    async with httpx.AsyncClient(trust_env=False, base_url=base_url, transport=transport) as client:
        policy = await _request_policy(client, api_key, model)
        key = policy.key_for(source.name)
        try:
            response = await client.post(
                policy.upload_host,
                data=policy.form_fields(key),
                files={"file": (source.name, content, "application/octet-stream")},
                timeout=_UPLOAD_TIMEOUT,
            )
        except httpx.HTTPError:
            raise DigitalHumanUnavailable("DashScope upload failed") from None

    if not response.is_success:
        raise DigitalHumanUnavailable("DashScope upload failed")
    return f"oss://{key}"


__all__ = ["UploadPolicy", "parse_policy", "upload_file"]
