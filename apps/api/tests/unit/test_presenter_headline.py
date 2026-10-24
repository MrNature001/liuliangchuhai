from liuliangchuhai.infrastructure.digital_human.speech import headline


def test_headline_keeps_a_short_first_sentence_whole() -> None:
    assert headline("六堡茶来自梧州。它适合冲泡！") == "六堡茶来自梧州"


def test_headline_drops_the_trailing_english_full_stop() -> None:
    assert headline("Liubao tea comes from Wuzhou. It brews well.") == (
        "Liubao tea comes from Wuzhou"
    )


def test_headline_never_truncates() -> None:
    script = (
        "Here is a tea from Wuzhou, in Guangxi—Liubao tea, a leaf that has been "
        "pressed and aged in baskets for generations. It brews dark and smooth."
    )

    title = headline(script)

    # The frame decides whether it fits; the headline is never a half sentence.
    assert title == script.split(".")[0]
    assert "…" not in title


def test_headline_falls_back_when_the_first_sentence_is_only_punctuation() -> None:
    assert headline("。 Liubao is a dark tea") == "Liubao is a dark tea"
