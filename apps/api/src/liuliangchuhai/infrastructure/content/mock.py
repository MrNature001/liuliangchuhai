"""Rich offline demo content for the content-plan workbench.

The mock never calls a provider. It weaves the canonical product record, the
target market, the analysis hypotheses and the requested language into a full
launch package, so a live walkthrough is complete, fast and deterministic.
"""

from liuliangchuhai.application.ports.content_planner import ContentPlannerPort
from liuliangchuhai.domain.content_plan import ContentContext, ContentGenerationPlan
from liuliangchuhai.domain.market_analysis import MarketContext, ProductMarketAnalysis
from liuliangchuhai.domain.product import Product

_LANGUAGE_ALIASES = {
    "en": "en",
    "eng": "en",
    "english": "en",
    "英语": "en",
    "英文": "en",
    "zh": "zh",
    "cn": "zh",
    "chinese": "zh",
    "中文": "zh",
    "汉语": "zh",
    "简体中文": "zh",
    "vi": "vi",
    "vietnamese": "vi",
    "tiếng việt": "vi",
    "tieng viet": "vi",
    "越南语": "vi",
    "th": "th",
    "thai": "th",
    "ไทย": "th",
    "泰语": "th",
    "ms": "ms",
    "malay": "ms",
    "bahasa melayu": "ms",
    "马来语": "ms",
    "id": "id",
    "indonesian": "id",
    "bahasa indonesia": "id",
    "印尼语": "id",
}

# Localized product name and one-line descriptor, keyed by canonical product id.
_PRODUCT_COPY: dict[str, dict[str, tuple[str, str]]] = {
    "liuzhou-luosifen": {
        "en": (
            "Liuzhou Luosifen (River Snail Rice Noodles)",
            "a slow-simmered river-snail broth poured over springy rice noodles, "
            "pickled bamboo shoots and crunchy peanuts",
        ),
        "vi": (
            "Bún ốc Liễu Châu",
            "nước dùng ốc hầm chậm chan lên bún dai, măng chua giòn và đậu phộng bùi",
        ),
        "th": (
            "เส้นหมี่หอยขมหลิ่วโจว",
            "น้ำซุปหอยขมเคี่ยวนานราดเส้นหมี่เหนียวนุ่ม พร้อมหน่อไม้ดองและถั่วลิสงกรอบ",
        ),
        "ms": (
            "Luosifen Liuzhou (Mi Beras Siput Sungai)",
            "sup siput sungai direneh lama dituang atas mi beras kenyal, "
            "rebung masam dan kacang tanah rangup",
        ),
        "id": (
            "Luosifen Liuzhou (Mi Beras Siput)",
            "kuah siput sungai yang dimasak lama disiram mi beras kenyal, "
            "rebung asam, dan kacang tanah renyah",
        ),
    },
    "wuzhou-liubao-tea": {
        "en": (
            "Wuzhou Liubao Tea",
            "a dark post-fermented tea aged into earthy depth with a smooth, lingering finish",
        ),
        "vi": (
            "Trà Lục Bảo Ngô Châu",
            "trà đen hậu lên men, ủ chín cho vị đất ấm và hậu vị êm kéo dài",
        ),
        "th": (
            "ชาหลิวเป่าอู๋โจว",
            "ชาดำหมักบ่ม ให้รสกลมกล่อมลึกและรสค้างยาวนุ่มนวล",
        ),
        "ms": (
            "Teh Liubao Wuzhou",
            "teh hitam pasca-fermentasi yang diperam, berperisa bumi lembut "
            "dengan kesudahan yang panjang",
        ),
        "id": (
            "Teh Liubao Wuzhou",
            "teh hitam pasca-fermentasi yang diperam, bercita rasa earthy lembut "
            "dengan aftertaste panjang",
        ),
    },
    "guilin-luohanguo": {
        "en": (
            "Guilin Monk Fruit",
            "a naturally sweet dried fruit that turns a simple infusion into a "
            "gentle, caffeine-free ritual",
        ),
        "vi": (
            "La hán quả Quế Lâm",
            "quả khô ngọt tự nhiên, biến một ấm trà đơn giản thành nghi thức "
            "dịu nhẹ không caffeine",
        ),
        "th": (
            "หล่อฮั่งก้วยกุ้ยหลิน",
            "ผลไม้แห้งรสหวานธรรมชาติ ชงเป็นเครื่องดื่มหอมละมุนไร้คาเฟอีน",
        ),
        "ms": (
            "Buah Monk Guilin",
            "buah kering semula jadi manis, menjadikan air rendaman mudah "
            "sebagai ritual lembut tanpa kafein",
        ),
        "id": (
            "Buah Monk Guilin",
            "buah kering manis alami, menjadikan seduhan sederhana sebagai "
            "ritual lembut tanpa kafein",
        ),
    },
    "baise-mango": {
        "en": (
            "Baise Mango",
            "sun-ripened tropical mango with honeyed flesh, ready for fresh "
            "eating, drinks and desserts",
        ),
        "vi": (
            "Xoài Bách Sắc",
            "xoài nhiệt đới chín nắng với thịt quả ngọt mật, dùng ăn tươi, "
            "làm đồ uống và món tráng miệng",
        ),
        "th": (
            "มะม่วงไป่เซ่อ",
            "มะม่วงเมืองร้อนสุกแดด เนื้อหวานน้ำผึ้ง กินสด ทำเครื่องดื่มและของหวาน",
        ),
        "ms": (
            "Mangga Baise",
            "mangga tropika masak matahari dengan isi manis madu, sesuai untuk "
            "makan segar, minuman dan pencuci mulut",
        ),
        "id": (
            "Mangga Baise",
            "mangga tropis matang sinar matahari dengan daging manis madu, "
            "cocok untuk disantap segar, minuman, dan hidangan penutup",
        ),
    },
    "hengzhou-jasmine-tea": {
        "en": (
            "Hengzhou Jasmine Tea",
            "green tea layered with fresh jasmine blossom until the scent settles into every leaf",
        ),
        "vi": (
            "Trà hoa nhài Hoành Châu",
            "trà xanh ướp cùng hoa nhài tươi đến khi hương thấm vào từng lá trà",
        ),
        "th": (
            "ชามะลิเหิงโจว",
            "ชาเขียวอบดอกมะลิสด จนกลิ่นหอมติดอยู่ในทุกใบชา",
        ),
        "ms": (
            "Teh Melur Hengzhou",
            "teh hijau dilapisi bunga melur segar sehingga wanginya meresap ke setiap daun",
        ),
        "id": (
            "Teh Melati Hengzhou",
            "teh hijau dilapisi bunga melati segar hingga aromanya meresap ke setiap daun",
        ),
    },
    "beihai-salted-duck-egg": {
        "en": (
            "Beihai Salted Sea-Duck Egg",
            "coastal duck eggs cured in salt until the yolk turns rich, oily and deeply savoury",
        ),
        "vi": (
            "Trứng vịt biển muối Bắc Hải",
            "trứng vịt ven biển muối chín, lòng đỏ béo mịn và đậm vị",
        ),
        "th": (
            "ไข่เป็ดทะเลเค็มเป่ยไห่",
            "ไข่เป็ดชายฝั่งดองเกลือจนไข่แดงมันเข้มและเค็มกลมกล่อม",
        ),
        "ms": (
            "Telur Itik Laut Masin Beihai",
            "telur itik pesisir diperap garam sehingga kuningnya kaya, berminyak dan amat sedap",
        ),
        "id": (
            "Telur Bebek Laut Asin Beihai",
            "telur bebek pesisir yang diasinkan hingga kuningnya kaya, berminyak, dan gurih",
        ),
    },
    "qinzhou-nixing-pottery": {
        "en": (
            "Qinzhou Nixing Pottery",
            "hand-thrown clay fired into a warm, kiln-varied glaze, at once "
            "a tea vessel and a keepsake",
        ),
        "vi": (
            "Gốm Nê Hưng Khâm Châu",
            "đất nặn tay nung thành lớp men biến sắc ấm áp, vừa là dụng cụ trà vừa là vật kỷ niệm",
        ),
        "th": (
            "เครื่องปั้นดินเผาหนิซิ่งชินโจว",
            "ดินปั้นมือเผาจนเคลือบเปลี่ยนสีในเตา ทั้งภาชนะชาและของที่ระลึก",
        ),
        "ms": (
            "Tembikar Nixing Qinzhou",
            "tanah liat bentuk tangan dibakar menjadi glazer hangat berubah warna, "
            "sekali gus bekas teh dan cenderamata",
        ),
        "id": (
            "Tembikar Nixing Qinzhou",
            "tanah liat bentuk tangan dibakar jadi glasir hangat berubah warna, "
            "sekaligus wadah teh dan kenang-kenangan",
        ),
    },
}

_ORIGIN_COPY = {
    "广西柳州": {
        "en": "Liuzhou, Guangxi",
        "vi": "Liễu Châu, Quảng Tây",
        "th": "หลิ่วโจว กว่างซี",
        "ms": "Liuzhou, Guangxi",
        "id": "Liuzhou, Guangxi",
    },
    "广西梧州": {
        "en": "Wuzhou, Guangxi",
        "vi": "Ngô Châu, Quảng Tây",
        "th": "อู๋โจว กว่างซี",
        "ms": "Wuzhou, Guangxi",
        "id": "Wuzhou, Guangxi",
    },
    "广西桂林": {
        "en": "Guilin, Guangxi",
        "vi": "Quế Lâm, Quảng Tây",
        "th": "กุ้ยหลิน กว่างซี",
        "ms": "Guilin, Guangxi",
        "id": "Guilin, Guangxi",
    },
    "广西百色": {
        "en": "Baise, Guangxi",
        "vi": "Bách Sắc, Quảng Tây",
        "th": "ไป่เซ่อ กว่างซี",
        "ms": "Baise, Guangxi",
        "id": "Baise, Guangxi",
    },
    "广西横州": {
        "en": "Hengzhou, Guangxi",
        "vi": "Hoành Châu, Quảng Tây",
        "th": "เหิงโจว กว่างซี",
        "ms": "Hengzhou, Guangxi",
        "id": "Hengzhou, Guangxi",
    },
    "广西北海": {
        "en": "Beihai, Guangxi",
        "vi": "Bắc Hải, Quảng Tây",
        "th": "เป่ยไห่ กว่างซี",
        "ms": "Beihai, Guangxi",
        "id": "Beihai, Guangxi",
    },
    "广西钦州": {
        "en": "Qinzhou, Guangxi",
        "vi": "Khâm Châu, Quảng Tây",
        "th": "ชินโจว กว่างซี",
        "ms": "Qinzhou, Guangxi",
        "id": "Qinzhou, Guangxi",
    },
}

_MARKET_COPY = {
    "Vietnam": {
        "en": "Vietnam",
        "vi": "Việt Nam",
        "th": "เวียดนาม",
        "ms": "Vietnam",
        "id": "Vietnam",
    },
    "Thailand": {
        "en": "Thailand",
        "vi": "Thái Lan",
        "th": "ไทย",
        "ms": "Thailand",
        "id": "Thailand",
    },
    "Malaysia": {
        "en": "Malaysia",
        "vi": "Malaysia",
        "th": "มาเลเซีย",
        "ms": "Malaysia",
        "id": "Malaysia",
    },
    "Indonesia": {
        "en": "Indonesia",
        "vi": "Indonesia",
        "th": "อินโดนีเซีย",
        "ms": "Indonesia",
        "id": "Indonesia",
    },
}

_FALLBACK_COPY = {
    "en": ("a Guangxi specialty", "a distinctive regional product with a story worth telling"),
    "vi": ("một đặc sản Quảng Tây", "sản phẩm địa phương đặc sắc với câu chuyện đáng kể"),
    "th": ("ของดีกว่างซี", "สินค้าท้องถิ่นที่มีเรื่องราวน่าสนใจ"),
    "ms": ("produk istimewa Guangxi", "produk serantau yang tersendiri dengan ceritanya"),
    "id": ("produk khas Guangxi", "produk daerah khas dengan ceritanya tersendiri"),
}

_DEMO_NOTE = {
    "en": (
        "Demo note: the scenes, timings and copy above are illustrative samples — "
        "adjust them to the real product and market before publishing."
    ),
    "zh": "演示说明：以上场景、时长与文案均为示意样例，发布前请结合真实产品与市场情况调整。",
    "vi": (
        "Ghi chú bản demo: bối cảnh, thời lượng và nội dung trên chỉ là mẫu minh hoạ — "
        "hãy điều chỉnh theo sản phẩm và thị trường thực tế trước khi đăng."
    ),
    "th": (
        "หมายเหตุชุด demo: ฉาก ระยะเวลา และข้อความข้างต้นเป็นเพียงตัวอย่างประกอบ — "
        "ควรปรับให้เข้ากับสินค้าและตลาดจริงก่อนเผยแพร่"
    ),
    "ms": (
        "Nota demo: babak, tempoh dan teks di atas hanyalah contoh ilustrasi — "
        "suaikan dengan produk dan pasaran sebenar sebelum diterbitkan."
    ),
    "id": (
        "Catatan demo: adegan, durasi, dan teks di atas hanyalah contoh ilustrasi — "
        "sesuaikan dengan produk dan pasar sebenarnya sebelum dipublikasikan."
    ),
}


def _resolve_language(value: str) -> str:
    key = value.strip().lower().replace("_", "-")
    resolved = _LANGUAGE_ALIASES.get(key)
    if resolved is None:
        resolved = _LANGUAGE_ALIASES.get(key.split("-")[0], "en")
    return resolved


def _fact(product: Product, language: str) -> tuple[str, str]:
    entry = _PRODUCT_COPY.get(product.id, {})
    if language in entry:
        return entry[language]
    _, fallback_descriptor = _FALLBACK_COPY[language]
    return product.name, f"{product.name}, {fallback_descriptor}"


def _origin(product: Product, language: str) -> str:
    return _ORIGIN_COPY.get(product.origin, {}).get(language, "Guangxi, China")


def _market_name(country: str, language: str) -> str:
    return _MARKET_COPY.get(country, {}).get(language, country)


def _first(items: tuple[str, ...], fallback: str) -> str:
    return items[0] if items else fallback


def _build_en(product: Product, market: MarketContext, analysis: ProductMarketAnalysis) -> dict:
    name, descriptor = _fact(product, "en")
    origin = _origin(product, "en")
    country = _market_name(market.country, "en")
    audience = _first(analysis.target_audiences, "curious home cooks and gift shoppers")
    strength = _first(analysis.strengths, "a clear regional story")
    hook = strength[0].lower() + strength[1:] if strength else "a clear regional story"
    return {
        "key_selling_points": (
            f"A story you can taste — {name} carries {origin} into {country}: {descriptor}.",
            f"Made for {audience}, with {hook} as the hook that makes the product feel "
            "personal rather than mass-produced.",
            "One coherent kit — the hero still, the 25-second vertical video and the live "
            "script all argue the same positioning, so a small team can launch in a week.",
            _DEMO_NOTE["en"],
        ),
        "image_prompt": (
            f"Hero product shot of {name} styled on a warm linen surface in a bright "
            f"{country} home. {descriptor}. Soft morning window light from the left, shallow "
            "depth of field, one ceramic cup and a small dish as props, muted natural palette "
            "with a single warm accent. 4:5 vertical crop, clear space at the top for a headline."
        ),
        "short_video_idea": (
            f"A 25-second vertical clip for TikTok and Instagram Reels. Open on an everyday "
            f"{country} kitchen moment, reveal {name}, then follow the very first pour or the "
            "first bite. Close on the product itself and one quiet line about where it comes from."
        ),
        "short_video_prompt": (
            f"Shot 1 (0-3s): slow handheld push-in on {name} against linen, natural light, no "
            "music. Shot 2 (3-10s): macro on texture and steam or glaze as it is prepared. "
            "Shot 3 (10-18s): hands lift the product beside a plain ceramic cup. "
            f"Shot 4 (18-26s): wide on the table with the caption 'From {origin} to your table.' "
            "End card with the product name. 9:16 vertical, ambient sound, calm pacing."
        ),
        "live_script": (
            f"Open with the product in hand: 'This is {name}, and it comes from {origin}.' Pause, "
            f"then give one concrete image — {descriptor}. 'In {country} we would serve it like "
            "this,' and demonstrate the simplest preparation in three movements. Finish with an "
            "invitation rather than a pitch: 'If you would like to know how it is made, ask me "
            "and I will walk you through it.' Warm, unhurried, no pressure to buy."
        ),
        "social_caption": (
            f"Some flavours travel beautifully. 🌏 {name}, straight from {origin} — {descriptor}. "
            f"We are bringing it to {country} for the first time. Would you start with a warm cup "
            "or a fresh bite? Tell us below. #GuangxiFlavours #ASEANFood #TasteOfChina"
        ),
    }


def _build_zh(product: Product, market: MarketContext, analysis: ProductMarketAnalysis) -> dict:
    country = _market_name(market.country, "en")
    audience = _first(analysis.target_audiences, "注重生活品质的家庭消费者")
    return {
        "key_selling_points": (
            f"文化可感——{product.name}把{product.origin}的地方故事带进{country}：{product.description}",
            f"人群清晰——面向{audience}，以{product.cultural_background}作为情感切入点，"
            "让产品显得有来历，而非流水线商品。",
            "素材齐备——主图、25 秒短视频与直播话术共用同一套定位，小团队也能在一周内完成上新。",
            _DEMO_NOTE["zh"],
        ),
        "image_prompt": (
            f"以{product.name}为主角的产品主图：置于{country}家庭清晨的暖色亚麻桌面上。"
            f"{product.description} 左侧自然窗光，浅景深，搭配一只素陶杯与一只小碟作道具，"
            "整体低饱和自然色调，仅留一处暖色点缀。4:5 竖版构图，顶部预留标题空间。"
        ),
        "short_video_idea": (
            f"25 秒竖版短视频，适配抖音与小红书。开场是{country}一个日常的清晨厨房场景，"
            f"镜头转到{product.name}，随后跟随第一次冲泡或第一口的动作。"
            "结尾定格在产品本身，配一句关于产地的轻声旁白。"
        ),
        "short_video_prompt": (
            f"镜头一（0–3 秒）：手持缓推，{product.name}置于亚麻布上，自然光，无配乐。"
            "镜头二（3–10 秒）：微距呈现质地与热气或釉色。镜头三（10–18 秒）：双手将产品移入画面，"
            f"旁置一只素陶杯。镜头四（18–26 秒）：桌面全景，字幕「从{product.origin}到你的餐桌」。"
            "结尾字卡展示产品名。9:16 竖版，保留环境音，节奏舒缓，不做快切。"
        ),
        "live_script": (
            f"手持产品开场：「这是{product.name}，来自{product.origin}。」停顿一下，"
            f"给出一个具体画面——{product.usage}「在{country}，我们会这样用它」，"
            "并用三个动作演示最简单的用法。结尾用邀请而非推销收束："
            "「想了解它是怎么做出来的，可以问我，我带你一步步看。」语速放缓，不催单。"
        ),
        "social_caption": (
            f"有些味道，值得跨越山海。{product.name}，来自{product.origin}——{product.description} "
            f"这是我们第一次把它带到{country}。你会先从一杯热的开始，还是先尝一口新鲜的？"
            "评论区告诉我。 #广西好物 #国货出海 #东盟市场"
        ),
    }


def _build_vi(product: Product, market: MarketContext, analysis: ProductMarketAnalysis) -> dict:
    name, descriptor = _fact(product, "vi")
    origin = _origin(product, "vi")
    country = _market_name(market.country, "vi")
    audience = _first(analysis.target_audiences, "những người nội trợ tò mò và người mua quà")
    return {
        "key_selling_points": (
            f"Câu chuyện nếm được — {name} mang {origin} đến {country}: {descriptor}.",
            f"Dành cho {audience}, với điểm nhấn khiến sản phẩm trở nên gần gũi thay vì đại trà.",
            "Trọn bộ chất liệu — ảnh chủ đạo, video 25 giây và kịch bản livestream cùng một "
            "định vị, đội nhỏ cũng ra mắt trong một tuần.",
            _DEMO_NOTE["vi"],
        ),
        "image_prompt": (
            f"Ảnh chủ đạo của {name} trên mặt bàn vải lanh ấm trong một căn bếp {country} "
            f"ngập sáng. {descriptor}. Ánh sáng cửa sổ buổi sáng từ bên trái, độ sâu trường "
            "ảnh nông, một tách gốm và một đĩa nhỏ làm đạo cụ, tông màu tự nhiên dịu với một "
            "điểm nhấn ấm. Khung dọc 4:5, chừa khoảng trống phía trên cho tiêu đề."
        ),
        "short_video_idea": (
            f"Video dọc 25 giây cho TikTok và Instagram Reels. Mở đầu bằng một khoảnh khắc bếp "
            f"núc thường ngày ở {country}, hé lộ {name}, rồi theo chân động tác rót hoặc miếng "
            "đầu tiên. Kết thúc ở chính sản phẩm cùng một câu nhẹ nhàng về nguồn gốc."
        ),
        "short_video_prompt": (
            f"Cảnh 1 (0-3s): máy cầm tay đẩy chậm vào {name} trên nền vải lanh, ánh sáng tự "
            "nhiên, không nhạc. Cảnh 2 (3-10s): cận cảnh chất liệu cùng hơi nước hoặc lớp men "
            "khi pha chế. Cảnh 3 (10-18s): đôi tay nâng sản phẩm bên một tách gốm mộc. "
            f"Cảnh 4 (18-26s): toàn cảnh mặt bàn, phụ đề 'Từ {origin} đến bàn ăn của bạn.' "
            "Thẻ kết với tên sản phẩm. Khung dọc 9:16, giữ âm thanh môi trường, nhịp chậm."
        ),
        "live_script": (
            f"Mở đầu với sản phẩm trên tay: 'Đây là {name}, đến từ {origin}.' Dừng một nhịp, "
            f"rồi đưa ra một hình ảnh cụ thể — {descriptor}. 'Ở {country}, chúng tôi dùng nó "
            "như thế này,' và trình diễn cách pha chế đơn giản nhất trong ba động tác. Kết bằng "
            "lời mời thay vì lời chào hàng: 'Nếu bạn muốn biết nó được làm ra sao, cứ hỏi tôi, "
            "tôi sẽ chỉ từng bước.' Ấm áp, không thúc ép."
        ),
        "social_caption": (
            f"Có những hương vị đi xa rất đẹp. {name}, thẳng từ {origin} — {descriptor}. "
            f"Lần đầu chúng tôi mang nó đến {country}. Bạn sẽ bắt đầu bằng một tách ấm hay một "
            "miếng tươi? Cho chúng tôi biết ở dưới nhé. #HuongViGuangxi #ASEANFood"
        ),
    }


def _build_th(product: Product, market: MarketContext, analysis: ProductMarketAnalysis) -> dict:
    name, descriptor = _fact(product, "th")
    origin = _origin(product, "th")
    country = _market_name(market.country, "th")
    audience = _first(analysis.target_audiences, "คนรักการทำอาหารและนักช้อปของฝาก")
    return {
        "key_selling_points": (
            f"เรื่องราวที่ลิ้มได้ — {name} พา {origin} มาสู่ {country}: {descriptor}",
            f"ออกแบบเพื่อ {audience} ด้วยจุดขายที่ทำให้สินค้าดูใส่ใจ ไม่ใช่ของผลิตจำนวนมาก",
            "ชุดสื่อครบชุด — ภาพหลัก วิดีโอ 25 วินาที และสคริปต์ไลฟ์ ใช้จุดยืนเดียวกัน ทีมเล็กก็เปิดตัวได้ในหนึ่งสัปดาห์",
            _DEMO_NOTE["th"],
        ),
        "image_prompt": (
            f"ภาพหลักของ {name} บนโต๊ะผ้าลินินโทนอบอุ่นในห้องครัวของ {country} ที่มีแสงธรรมชาติ "
            f"{descriptor} แสงจากหน้าต่างยามเช้าทางซ้าย ระยะชัดตื้น มีถ้วยเซรามิกหนึ่งใบและจานเล็ก "
            "เป็นพร็อพ โทนสีธรรมชาติหม่นพร้อมจุดเน้นอบอุ่นหนึ่งจุด ครอปแนวตั้ง 4:5 "
            "เว้นที่ด้านบนสำหรับพาดหัว"
        ),
        "short_video_idea": (
            f"คลิปแนวตั้ง 25 วินาทีสำหรับ TikTok และ Instagram Reels เปิดด้วยบรรยากาศครัวยามเช้า "
            f"ของ {country} แล้วเผย {name} จากนั้นตามด้วยการรินครั้งแรกหรือคำแรก "
            "ปิดท้ายที่ตัวสินค้าพร้อมประโยคเบา ๆ เกี่ยวกับแหล่งกำเนิด"
        ),
        "short_video_prompt": (
            f"ช็อต 1 (0-3 วิ): มือถือดันเข้าช้า ๆ ที่ {name} บนผ้าลินิน แสงธรรมชาติ ไม่มีเพลง "
            "ช็อต 2 (3-10 วิ): มาโครที่เนื้อสัมผัสและไอน้ำหรือเคลือบขณะเตรียม "
            "ช็อต 3 (10-18 วิ): มือยกสินค้าขึ้นข้างถ้วยเซรามิกเรียบ ๆ "
            f"ช็อต 4 (18-26 วิ): ภาพกว้างบนโต๊ะ พร้อมคำบรรยาย 'จาก {origin} สู่โต๊ะของคุณ' "
            "การ์ดปิดท้ายพร้อมชื่อสินค้า แนวตั้ง 9:16 คงเสียงบรรยากาศ จังหวะผ่อน ไม่ตัดเร็ว"
        ),
        "live_script": (
            f"เปิดด้วยสินค้าในมือ: 'นี่คือ {name} มาจาก {origin}' เว้นจังหวะหนึ่งครั้ง "
            f"แล้วให้ภาพที่ชัดเจนหนึ่งภาพ — {descriptor} 'ที่ {country} เราจะใช้แบบนี้' "
            "แล้วสาธิตวิธีเตรียมที่ง่ายที่สุดในสามท่า ปิดท้ายด้วยคำเชิญมากกว่าการขาย: "
            "'ถ้าอยากรู้ว่าทำอย่างไร ทักมาถามได้เลย เดี๋ยวพาดูทีละขั้น' น้ำเสียงอบอุ่น ไม่เร่งรัด"
        ),
        "social_caption": (
            f"บางรสชาติเดินทางได้สวยงาม {name} ตรงจาก {origin} — {descriptor} "
            f"เรานำมาให้ {country} เป็นครั้งแรก คุณจะเริ่มจากถ้วยอุ่น ๆ หรือคำแรกสด ๆ ดี? "
            "บอกเราด้านล่างได้เลย #กว่างซี #ASEANFood #TasteOfChina"
        ),
    }


def _build_ms(product: Product, market: MarketContext, analysis: ProductMarketAnalysis) -> dict:
    name, descriptor = _fact(product, "ms")
    origin = _origin(product, "ms")
    country = _market_name(market.country, "ms")
    audience = _first(analysis.target_audiences, "peminat masakan rumah dan pembeli hadiah")
    return {
        "key_selling_points": (
            f"Kisah yang boleh dirasa — {name} membawa {origin} ke {country}: {descriptor}.",
            f"Dibina untuk {audience}, dengan daya tarikan yang membuatkan produk terasa "
            "peribadi, bukan buatan pukal.",
            "Satu set lengkap — gambar utama, video 25 saat dan skrip siaran langsung berkongsi "
            "satu kedudukan, pasukan kecil pun boleh melancarkan dalam seminggu.",
            _DEMO_NOTE["ms"],
        ),
        "image_prompt": (
            f"Gambar utama {name} di atas meja linen hangat dalam dapur {country} yang terang. "
            f"{descriptor}. Cahaya tingkap pagi dari kiri, kedalaman medan cetek, satu cawan "
            "seramik dan sebuah pinggan kecil sebagai prop, palet semula jadi lembut dengan "
            "satu aksen hangat. Potongan menegak 4:5, ruang di atas untuk tajuk."
        ),
        "short_video_idea": (
            f"Klip menegak 25 saat untuk TikTok dan Instagram Reels. Buka dengan suasana dapur "
            f"biasa di {country}, tunjukkan {name}, kemudian ikut tuangan pertama atau suapan "
            "pertama. Tutup pada produk itu sendiri dengan satu ayat tenang tentang asalnya."
        ),
        "short_video_prompt": (
            f"Syot 1 (0-3s): kamera tangan menolak perlahan ke arah {name} atas linen, cahaya "
            "semula jadi, tanpa muzik. Syot 2 (3-10s): makro pada tekstur dan wap atau glazer "
            "semasa disediakan. Syot 3 (10-18s): tangan mengangkat produk di sisi cawan seramik "
            f"kosong. Syot 4 (18-26s): lebar di atas meja dengan kapsyen 'Dari {origin} ke meja "
            "anda.' Kad akhir dengan nama produk. Menegak 9:16, bunyi sekitar, rentak tenang."
        ),
        "live_script": (
            f"Buka dengan produk di tangan: 'Ini {name}, dan ia datang dari {origin}.' Berhenti "
            f"seketika, kemudian beri satu gambaran konkrit — {descriptor}. 'Di {country} kami "
            "menghidangkannya begini,' dan tunjukkan penyediaan paling mudah dalam tiga langkah. "
            "Tutup dengan jemputan, bukan jualan: 'Kalau nak tahu bagaimana ia dibuat, tanya "
            "saya, saya akan tunjukkan satu per satu.' Mesra, tenang, tiada desakan."
        ),
        "social_caption": (
            f"Ada rasa yang mengembara dengan indah. {name}, terus dari {origin} — {descriptor}. "
            f"Kami membawanya ke {country} buat kali pertama. Anda mahu mulakan dengan cawan "
            "hangat atau suapan segar? Beritahu kami di bawah. #RasaGuangxi #ASEANFood"
        ),
    }


def _build_id(product: Product, market: MarketContext, analysis: ProductMarketAnalysis) -> dict:
    name, descriptor = _fact(product, "id")
    origin = _origin(product, "id")
    country = _market_name(market.country, "id")
    audience = _first(analysis.target_audiences, "pecinta masakan rumahan dan pembeli suvenir")
    return {
        "key_selling_points": (
            f"Kisah yang bisa dirasa — {name} membawa {origin} ke {country}: {descriptor}.",
            f"Dibuat untuk {audience}, dengan daya tarik yang membuat produk terasa personal, "
            "bukan produksi massal.",
            "Satu paket utuh — foto utama, video 25 detik, dan skrip live memakai satu "
            "positioning, tim kecil pun bisa meluncurkan dalam sepekan.",
            _DEMO_NOTE["id"],
        ),
        "image_prompt": (
            f"Foto utama {name} di atas meja linen hangat di dapur {country} yang terang. "
            f"{descriptor}. Cahaya jendela pagi dari kiri, depth of field dangkal, satu cangkir "
            "keramik dan sebuah piring kecil sebagai properti, palet alami lembut dengan satu "
            "aksen hangat. Potongan vertikal 4:5, sisakan ruang di atas untuk judul."
        ),
        "short_video_idea": (
            f"Klip vertikal 25 detik untuk TikTok dan Instagram Reels. Buka dengan momen dapur "
            f"sehari-hari di {country}, tampilkan {name}, lalu ikuti tuangan pertama atau suapan "
            "pertama. Tutup pada produknya dengan satu kalimat tenang tentang asalnya."
        ),
        "short_video_prompt": (
            f"Shot 1 (0-3 dtk): kamera tangan mendorong perlahan ke {name} di atas linen, "
            "cahaya alami, tanpa musik. Shot 2 (3-10 dtk): makro pada tekstur dan uap atau "
            "glasir saat disiapkan. Shot 3 (10-18 dtk): tangan mengangkat produk di samping "
            f"cangkir keramik polos. Shot 4 (18-26 dtk): lebar di atas meja dengan takarir 'Dari "
            f"{origin} ke meja Anda.' Kartu penutup dengan nama produk. Vertikal 9:16, suara "
            "sekitar, tempo tenang."
        ),
        "live_script": (
            f"Buka dengan produk di tangan: 'Ini {name}, dan berasal dari {origin}.' Berhenti "
            f"sejenak, lalu beri satu gambaran konkret — {descriptor}. 'Di {country} kami "
            "menyajikannya seperti ini,' dan peragakan cara penyajian paling sederhana dalam "
            "tiga langkah. Tutup dengan ajakan, bukan jualan: 'Kalau ingin tahu cara membuatnya, "
            "tanya saya, akan saya pandu langkah demi langkah.' Hangat, tenang, tanpa desakan."
        ),
        "social_caption": (
            f"Ada rasa yang layak menempuh jauh. {name}, langsung dari {origin} — {descriptor}. "
            f"Kami membawanya ke {country} untuk pertama kali. Anda mau mulai dengan cangkir "
            "hangat atau suapan segar? Beri tahu kami di bawah. #RasaGuangxi #ASEANFood"
        ),
    }


_BUILDERS = {
    "en": _build_en,
    "zh": _build_zh,
    "vi": _build_vi,
    "th": _build_th,
    "ms": _build_ms,
    "id": _build_id,
}


class MockContentPlannerAdapter(ContentPlannerPort):
    """Deterministic, key-free launch assets built from the canonical product record."""

    async def create_content_plan(
        self,
        product: Product,
        market: MarketContext,
        analysis: ProductMarketAnalysis,
        context: ContentContext,
    ) -> ContentGenerationPlan:
        language = _resolve_language(context.target_language)
        assets = _BUILDERS[language](product, market, analysis)
        return ContentGenerationPlan(
            key_selling_points=tuple(assets["key_selling_points"]),
            image_prompt=assets["image_prompt"],
            short_video_idea=assets["short_video_idea"],
            short_video_prompt=assets["short_video_prompt"],
            live_script=assets["live_script"],
            social_caption=assets["social_caption"],
        )
