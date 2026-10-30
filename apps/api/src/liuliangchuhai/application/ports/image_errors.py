class ImageError(Exception):
    """Base application-visible image failure, independent of providers."""


class ImageUnavailable(ImageError):
    """Provider, network, quota, auth or service availability prevents completion."""


class ImageRejected(ImageError):
    """Provider rejects validated input due to policy or input constraints."""


class InvalidImageResponse(ImageError):
    """Provider success payload cannot be mapped safely to the contract."""
