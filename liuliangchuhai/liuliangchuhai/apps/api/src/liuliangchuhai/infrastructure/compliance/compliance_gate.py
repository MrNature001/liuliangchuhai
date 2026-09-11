"""Compliance gate for content moderation."""
from pathlib import Path
from typing import Optional

from liuliangchuhai.infrastructure.compliance.sensitive_word_filter import SensitiveWordFilter


class ComplianceGate:
    """Content moderation compliance gate."""

    def __init__(self, word_list_paths: Optional[list[str]] = None):
        self.filter = SensitiveWordFilter()

        # Load default word lists
        default_paths = [
            "data/sensitive_words/base.txt",
            "data/sensitive_words/ad_law.txt"
        ]

        paths_to_load = word_list_paths or default_paths
        for path in paths_to_load:
            if Path(path).exists():
                self.filter.load_from_file(path)

    def check_text(self, text: str) -> dict:
        """Check text for sensitive words.

        Returns:
            dict with 'passed', 'violations', 'sanitized_text'
        """
        violations = self.filter.find_all(text)

        return {
            "passed": len(violations) == 0,
            "violations": [
                {"word": word, "start": start, "end": end}
                for word, start, end in violations
            ],
            "sanitized_text": self.filter.replace(text) if violations else text
        }

    def check_multiple(self, texts: list[str]) -> list[dict]:
        """Check multiple texts."""
        return [self.check_text(text) for text in texts]
