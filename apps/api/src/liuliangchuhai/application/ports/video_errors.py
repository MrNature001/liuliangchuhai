class VideoError(Exception):
    """Base application-visible video failure, independent of providers."""


class VideoUnavailable(VideoError):
    """Provider, network, quota or service availability prevents completion."""


class VideoRejected(VideoError):
    """Provider rejects the request due to policy or input constraints."""


class InvalidVideoResponse(VideoError):
    """Provider success payload cannot be mapped safely to the contract."""


class VideoDeadlineExceeded(VideoError):
    """The local bounded wait ended before a terminal remote result."""
