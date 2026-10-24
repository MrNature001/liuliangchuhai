from liuliangchuhai.infrastructure.digital_human.speech import headline


def test_headline_keeps_a_short_first_sentence_whole() -> None:
    assert headline("六堡茶来自梧州。它适合冲泡！") == "六堡茶来自梧州"


def test_headline_drops_the_trailing_english_full_stop() -> None:
    assert headline("Liubao tea comes from Wuzhou. It brews well.") == (
        "Liubao tea comes from Wuzhou"
    )


def test_headline_cuts_long_copy_on_a_word_boundary() -> None:
    script = "If you are putting together a gift for a family member, Liubao tea is a safe choice."

    title = headline(script)

    assert title.endswith("…")
    # The cut may not slice a word: every word in the title is a whole word.
    words = script.replace(",", " ").split()
    assert all(word in words for word in title.removesuffix("…").split())


def test_headline_marks_long_unspaced_copy() -> None:
    script = (
        "梧州六堡茶产自广西梧州，茶汤红浓明亮，滋味醇厚回甘，适合作为日常饮品，"
        "也适合作为礼物送给亲友，是广西最具代表性的黑茶之一。"
    )

    title = headline(script)

    assert title.endswith("…")
    assert len(title) <= 59


def test_headline_falls_back_when_the_first_sentence_is_only_punctuation() -> None:
    assert headline("。 Liubao is a dark tea") == "Liubao is a dark tea"
