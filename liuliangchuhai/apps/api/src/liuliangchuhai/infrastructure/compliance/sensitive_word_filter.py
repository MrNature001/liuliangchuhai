"""Sensitive word filter using DFA algorithm."""
from typing import Set, Dict, Optional


class SensitiveWordFilter:
    """DFA-based sensitive word filter for content moderation."""

    def __init__(self):
        self.root = {}
        self.word_count = 0

    def add_word(self, word: str):
        """Add a sensitive word to the filter."""
        if not word:
            return

        node = self.root
        for char in word:
            if char not in node:
                node[char] = {}
            node = node[char]
        node["is_end"] = True
        self.word_count += 1

    def load_from_file(self, file_path: str):
        """Load sensitive words from a text file (one word per line)."""
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                word = line.strip()
                if word and not word.startswith("#"):
                    self.add_word(word)

    def find_all(self, text: str) -> list[tuple[str, int, int]]:
        """Find all sensitive words in text.

        Returns:
            List of (word, start_index, end_index) tuples
        """
        results = []
        text_len = len(text)

        for i in range(text_len):
            node = self.root
            j = i
            matched_word = ""

            while j < text_len:
                char = text[j]
                if char not in node:
                    break

                matched_word += char
                node = node[char]
                j += 1

                if node.get("is_end"):
                    results.append((matched_word, i, j))

        return results

    def contains_sensitive(self, text: str) -> bool:
        """Check if text contains any sensitive words."""
        return len(self.find_all(text)) > 0

    def replace(self, text: str, replacement: str = "*") -> str:
        """Replace sensitive words with replacement character."""
        matches = self.find_all(text)
        if not matches:
            return text

        result = list(text)
        for word, start, end in matches:
            for i in range(start, end):
                result[i] = replacement

        return "".join(result)
