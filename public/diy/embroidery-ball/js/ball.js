/* 绣球DIY - 绣球Canvas渲染引擎 */
/* 负责：十二瓣拼球、纯色/渐变配色、纹样绘制、流苏/吊坠/挂绳、旋转预览、海报复用 */
(function () {
  'use strict';

  var GOLD = '#C9A227';
  var DARK = '#33383D';
  var CREAM = '#F5EFE2';
  var RED = '#8C2F39';

  function hex2rgb(hex) {
    var h = hex.replace('#', '');
    return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
  }
  function lum(hex) {
    var c = hex2rgb(hex);
    return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
  }
  function shade(hex, amt) {
    var c = hex2rgb(hex);
    var f = function (v) {
      v = Math.min(255, Math.max(0, Math.round(v + amt)));
      return ('0' + v.toString(16)).slice(-2);
    };
    return '#' + f(c[0]) + f(c[1]) + f(c[2]);
  }
  function inkFor(hex) {
    return lum(hex) > 0.6 ? RED : CREAM;
  }

  /* ---------- 纹样绘制：统一在 [-1,1] 正方形内作画 ---------- */
  var PatternDraw = {
    lotus: function (ctx, ink) {
      ctx.strokeStyle = ink; ctx.fillStyle = ink;
      ctx.lineWidth = 0.09; ctx.lineCap = 'round';
      // 中瓣
      ctx.beginPath();
      ctx.moveTo(0, 0.55);
      ctx.quadraticCurveTo(-0.28, 0.05, 0, -0.72);
      ctx.quadraticCurveTo(0.28, 0.05, 0, 0.55);
      ctx.closePath(); ctx.stroke();
      // 左右瓣
      [-1, 1].forEach(function (s) {
        ctx.beginPath();
        ctx.moveTo(0, 0.55);
        ctx.quadraticCurveTo(0.52 * s, 0.18, 0.62 * s, -0.42);
        ctx.quadraticCurveTo(0.34 * s, -0.1, 0, 0.55);
        ctx.closePath(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0.55);
        ctx.quadraticCurveTo(0.55 * s, 0.42, 0.82 * s, 0.02);
        ctx.quadraticCurveTo(0.52 * s, 0.42, 0, 0.55);
        ctx.closePath(); ctx.stroke();
      });
      // 花茎与波
      ctx.beginPath(); ctx.moveTo(0, 0.55); ctx.lineTo(0, 0.88); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.85, 0.9);
      ctx.quadraticCurveTo(-0.4, 0.76, 0, 0.9);
      ctx.quadraticCurveTo(0.4, 1.04, 0.85, 0.9);
      ctx.stroke();
    },
    pome: function (ctx, ink) {
      ctx.strokeStyle = ink; ctx.fillStyle = ink;
      ctx.lineWidth = 0.09; ctx.lineCap = 'round';
      // 果身
      ctx.beginPath(); ctx.arc(0, 0.18, 0.55, 0, Math.PI * 2); ctx.stroke();
      // 冠萼
      ctx.beginPath();
      ctx.moveTo(-0.22, -0.3);
      ctx.lineTo(-0.28, -0.72); ctx.lineTo(-0.08, -0.5);
      ctx.lineTo(0.06, -0.74); ctx.lineTo(0.18, -0.5);
      ctx.lineTo(0.3, -0.68); ctx.lineTo(0.24, -0.3);
      ctx.stroke();
      // 籽粒
      [[-0.2, 0.05], [0.12, 0.0], [-0.05, 0.3], [0.24, 0.32], [-0.26, 0.38]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p[0], p[1], 0.075, 0, Math.PI * 2); ctx.fill();
      });
      // 露籽裂口
      ctx.beginPath();
      ctx.moveTo(-0.3, 0.62); ctx.quadraticCurveTo(0, 0.82, 0.3, 0.62);
      ctx.stroke();
    },
    fish: function (ctx, ink) {
      ctx.strokeStyle = ink; ctx.fillStyle = ink;
      ctx.lineWidth = 0.09; ctx.lineCap = 'round';
      // 身
      ctx.beginPath();
      ctx.moveTo(-0.78, 0);
      ctx.quadraticCurveTo(-0.25, -0.62, 0.55, -0.12);
      ctx.quadraticCurveTo(0.35, 0.3, -0.25, 0.42);
      ctx.quadraticCurveTo(-0.55, 0.3, -0.78, 0);
      ctx.stroke();
      // 尾
      ctx.beginPath();
      ctx.moveTo(0.45, -0.05);
      ctx.quadraticCurveTo(0.75, -0.42, 0.88, -0.5);
      ctx.quadraticCurveTo(0.8, -0.05, 0.9, 0.4);
      ctx.quadraticCurveTo(0.68, 0.28, 0.42, 0.05);
      ctx.stroke();
      // 眼圈
      ctx.beginPath(); ctx.arc(-0.45, -0.12, 0.09, 0, Math.PI * 2); ctx.fill();
      // 鳞
      [[-0.15, -0.18], [0.08, -0.12], [-0.1, 0.08], [0.15, 0.12], [-0.0, -0.02]].forEach(function (p) {
        ctx.beginPath(); ctx.arc(p[0], p[1], 0.14, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
      });
      // 水波
      ctx.beginPath();
      ctx.moveTo(-0.85, 0.72);
      ctx.quadraticCurveTo(-0.5, 0.58, -0.15, 0.72);
      ctx.quadraticCurveTo(0.2, 0.86, 0.55, 0.72);
      ctx.stroke();
    },
    crane: function (ctx, ink) {
      ctx.strokeStyle = ink; ctx.fillStyle = ink;
      ctx.lineWidth = 0.1; ctx.lineCap = 'round';
      // 身体
      ctx.beginPath();
      ctx.moveTo(-0.55, 0.32);
      ctx.quadraticCurveTo(-0.1, -0.05, 0.28, 0.18);
      ctx.quadraticCurveTo(0.1, 0.48, -0.3, 0.5);
      ctx.quadraticCurveTo(-0.5, 0.45, -0.55, 0.32);
      ctx.stroke();
      // S 颈 + 头
      ctx.beginPath();
      ctx.moveTo(0.2, 0.12);
      ctx.quadraticCurveTo(0.55, -0.15, 0.35, -0.5);
      ctx.quadraticCurveTo(0.28, -0.68, 0.48, -0.72);
      ctx.stroke();
      // 喙
      ctx.beginPath(); ctx.moveTo(0.48, -0.72); ctx.lineTo(0.82, -0.62); ctx.stroke();
      // 冠羽
      ctx.beginPath();
      ctx.moveTo(0.44, -0.76); ctx.quadraticCurveTo(0.32, -0.9, 0.18, -0.88); ctx.stroke();
      // 尾羽
      ctx.beginPath();
      ctx.moveTo(-0.4, 0.42); ctx.quadraticCurveTo(-0.85, 0.3, -0.92, -0.02);
      ctx.moveTo(-0.32, 0.48); ctx.quadraticCurveTo(-0.72, 0.55, -0.9, 0.4);
      ctx.stroke();
      // 单足
      ctx.beginPath(); ctx.moveTo(0.02, 0.48); ctx.lineTo(0.06, 0.86); ctx.stroke();
    },
    zhuangjin: function (ctx, ink) {
      ctx.strokeStyle = ink; ctx.fillStyle = ink;
      ctx.lineWidth = 0.08; ctx.lineJoin = 'round';
      function diamond(r) {
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0);
        ctx.closePath(); ctx.stroke();
      }
      diamond(0.85); diamond(0.55); diamond(0.25);
      // 四角回纹
      [[0, -0.7], [0.7, 0], [0, 0.7], [-0.7, 0]].forEach(function (p, i) {
        var dx = p[0], dy = p[1];
        ctx.beginPath();
        ctx.moveTo(dx * 0.6, dy * 0.6);
        ctx.lineTo(dx * 0.6 + (dy === 0 ? 0 : 0.14), dy * 0.6 + (dx === 0 ? 0 : 0.14));
        ctx.lineTo(dx * 0.88, dy * 0.88);
        ctx.stroke();
      });
      // 中心点
      ctx.beginPath(); ctx.arc(0, 0, 0.08, 0, Math.PI * 2); ctx.fill();
      // 折线纹
      ctx.beginPath();
      ctx.moveTo(-0.85, 0.85);  // 连接线角
      ctx.stroke();
    }
  };

  function drawPattern(ctx, id, x, y, size, angle, ink) {
    var fn = PatternDraw[id];
    if (!fn) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.scale(size, size);
    fn(ctx, ink);
    ctx.restore();
  }

  /* ---------- 瓣形路径：宽基纺锤形，相邻瓣彼此咬合无露底 ---------- */
  function petalPath(ctx, cx, cy, R, angle, widen) {
    var dx = Math.cos(angle), dy = Math.sin(angle);
    var tipX = cx + dx * R, tipY = cy + dy * R;
    var px = -dy, py = dx;
    var bx = cx + dx * R * 0.12, by = cy + dy * R * 0.12;
    var bw = R * 0.2 * widen;           // 瓣根半宽
    var w = R * 0.44 * widen;           // 瓣中控制偏移
    var m1x = bx + dx * R * 0.42 + px * w, m1y = by + dy * R * 0.42 + py * w;
    var m2x = bx + dx * R * 0.42 - px * w, m2y = by + dy * R * 0.42 - py * w;
    ctx.beginPath();
    ctx.moveTo(bx + px * bw, by + py * bw);
    ctx.quadraticCurveTo(m1x, m1y, tipX, tipY);
    ctx.quadraticCurveTo(m2x, m2y, bx - px * bw, by - py * bw);
    ctx.quadraticCurveTo(cx + dx * R * 0.02, cy + dy * R * 0.02, bx + px * bw, by + py * bw);
    ctx.closePath();
  }

  /* 花瓣主色平均值（用于球体底盘） */
  function avgColor(petals) {
    var r = 0, g = 0, b = 0;
    petals.forEach(function (p) {
      var c = hex2rgb(p.c1);
      r += c[0]; g += c[1]; b += c[2];
    });
    var n = petals.length || 1;
    return 'rgb(' + Math.round(r / n) + ',' + Math.round(g / n) + ',' + Math.round(b / n) + ')';
  }

  /* ---------- 单个瓣 ---------- */
  function drawPetal(ctx, cx, cy, R, angle, cfg, mode) {
    var widen = 0.9 + 0.1 * Math.abs(Math.sin(angle)); // 边缘瓣微收窄，制造球体感
    petalPath(ctx, cx, cy, R, angle, widen);
    var tipX = cx + Math.cos(angle) * R;
    var tipY = cy + Math.sin(angle) * R;
    if (mode === 'gradient') {
      var g = ctx.createLinearGradient(cx, cy, tipX, tipY);
      g.addColorStop(0, cfg.c2);
      g.addColorStop(1, cfg.c1);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = cfg.c1;
    }
    ctx.fill();
    // 缝线：金色虚线镶边
    ctx.save();
    petalPath(ctx, cx, cy, R, angle, widen * 0.9);
    ctx.strokeStyle = GOLD;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = Math.max(1, R * 0.008);
    ctx.setLineDash([R * 0.03, R * 0.022]);
    ctx.stroke();
    ctx.restore();
    // 纹样
    if (cfg.pattern) {
      var dist = R * 0.62;
      var px2 = cx + Math.cos(angle) * dist;
      var py2 = cy + Math.sin(angle) * dist;
      var size = R * 0.16 * widen;
      var ink = inkFor(cfg.c1);
      ctx.save();
      petalPath(ctx, cx, cy, R, angle, widen * 0.95);
      ctx.clip();
      drawPattern(ctx, cfg.pattern, px2, py2, size, angle, ink);
      ctx.restore();
    }
  }

  /* ---------- 挂绳 ---------- */
  function drawCord(ctx, x, topY, ballTopY, style, R) {
    ctx.strokeStyle = shade(DARK, 0);
    ctx.strokeStyle = '#6E4B26';
    ctx.lineWidth = Math.max(1.5, R * 0.02);
    ctx.lineCap = 'round';
    if (style === 'single') {
      ctx.beginPath();
      ctx.moveTo(x, ballTopY);
      ctx.lineTo(x, topY + R * 0.1);
      ctx.quadraticCurveTo(x - R * 0.25, topY - R * 0.02, x - R * 0.05, topY - R * 0.16);
      ctx.quadraticCurveTo(x, topY - R * 0.2, x, topY - R * 0.1);
      ctx.stroke();
    } else if (style === 'double') {
      [-1, 1].forEach(function (s) {
        ctx.beginPath();
        ctx.moveTo(x + s * R * 0.04, ballTopY);
        ctx.quadraticCurveTo(x + s * R * 0.16, (ballTopY + topY) / 2, x + s * R * 0.02, topY);
        ctx.stroke();
      });
      ctx.beginPath();
      ctx.arc(x, topY - R * 0.08, R * 0.07, Math.PI * 0.1, Math.PI * 0.9, true);
      ctx.stroke();
    } else {
      // 中国结挂绳
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.quadraticCurveTo(x - R * 0.15, topY - R * 0.12, x, topY - R * 0.22);
      ctx.quadraticCurveTo(x + R * 0.15, topY - R * 0.12, x, topY);
      ctx.stroke();
      var ky = topY + (ballTopY - topY) * 0.45;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = Math.max(1.6, R * 0.022);
      ctx.beginPath();
      ctx.moveTo(x, ky - R * 0.12);
      ctx.lineTo(x + R * 0.09, ky);
      ctx.lineTo(x, ky + R * 0.12);
      ctx.lineTo(x - R * 0.09, ky);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, ky + R * 0.12); ctx.lineTo(x, ballTopY);
      ctx.stroke();
    }
  }

  /* ---------- 吊坠 ---------- */
  function drawPendant(ctx, x, y, type, R, tasselColor) {
    var r = R * 0.09;
    if (type === 'ring') {
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = Math.max(1.5, R * 0.02);
      ctx.beginPath(); ctx.arc(x, y + r, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = Math.max(1, R * 0.012);
      ctx.beginPath(); ctx.arc(x, y + r, r * 0.45, 0, Math.PI * 2); ctx.stroke();
      return y + r * 2;
    }
    if (type === 'bead') {
      var g = ctx.createRadialGradient(x - r * 0.3, y + r * 0.6, r * 0.1, x, y + r, r);
      g.addColorStop(0, '#fff7e0');
      g.addColorStop(1, shade(tasselColor, -30));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y + r, r, 0, Math.PI * 2); ctx.fill();
      return y + r * 2;
    }
    if (type === 'drop') {
      ctx.fillStyle = shade(tasselColor, 10);
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = Math.max(1, R * 0.012);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + r * 1.1, y + r * 1.4, x, y + r * 2.4);
      ctx.quadraticCurveTo(x - r * 1.1, y + r * 1.4, x, y);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      return y + r * 2.4;
    }
    return y;
  }

  /* ---------- 流苏 ---------- */
  function drawTassel(ctx, x, y, cfg, R) {
    var lenMap = { short: 0.6, mid: 0.95, long: 1.35 };
    var len = R * lenMap[cfg.length || 'mid'];
    var color = cfg.color || '#C2432B';
    var style = cfg.style || 'straight';
    // 捆扎帽
    ctx.fillStyle = shade(color, -25);
    ctx.beginPath();
    ctx.moveTo(x - R * 0.07, y);
    ctx.lineTo(x + R * 0.07, y);
    ctx.lineTo(x + R * 0.045, y + R * 0.1);
    ctx.lineTo(x - R * 0.045, y + R * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(1, R * 0.01);
    ctx.stroke();
    var sy = y + R * 0.1;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    if (style === 'straight') {
      var n = 9;
      for (var i = 0; i < n; i++) {
        var t = i / (n - 1) - 0.5;
        ctx.lineWidth = Math.max(1, R * 0.014);
        ctx.beginPath();
        ctx.moveTo(x + t * R * 0.06, sy);
        ctx.quadraticCurveTo(x + t * R * 0.12, sy + len * 0.5, x + t * R * 0.2, sy + len);
        ctx.stroke();
      }
    } else if (style === 'multi') {
      [-1, 0, 1].forEach(function (s) {
        var bx = x + s * R * 0.1;
        // 束珠
        ctx.fillStyle = GOLD;
        ctx.beginPath(); ctx.arc(bx, sy + R * 0.04, R * 0.035, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color;
        for (var i = -1; i <= 1; i++) {
          ctx.lineWidth = Math.max(1, R * 0.013);
          ctx.beginPath();
          ctx.moveTo(bx, sy + R * 0.07);
          ctx.quadraticCurveTo(bx + i * R * 0.03, sy + len * 0.6, bx + i * R * 0.05, sy + len);
          ctx.stroke();
        }
      });
    } else {
      // 编结穗：双辫纽结 + 尾穗
      ctx.lineWidth = Math.max(1.4, R * 0.016);
      var seg = 5;
      var bh = len * 0.5 / seg;
      for (var s2 = 0; s2 < seg; s2++) {
        ctx.beginPath();
        ctx.moveTo(x - R * 0.035, sy + s2 * bh);
        ctx.quadraticCurveTo(x, sy + (s2 + 0.5) * bh, x + R * 0.035, sy + (s2 + 1) * bh);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + R * 0.035, sy + s2 * bh);
        ctx.quadraticCurveTo(x, sy + (s2 + 0.5) * bh, x - R * 0.035, sy + (s2 + 1) * bh);
        ctx.stroke();
      }
      var ty = sy + len * 0.5;
      for (var k = -2; k <= 2; k++) {
        ctx.lineWidth = Math.max(1, R * 0.012);
        ctx.beginPath();
        ctx.moveTo(x, ty);
        ctx.quadraticCurveTo(x + k * R * 0.03, ty + len * 0.25, x + k * R * 0.05, ty + len * 0.5);
        ctx.stroke();
      }
    }
    return sy + (style === 'braided' ? len : len);
  }

  /* ---------- 主渲染：在任意 canvas 上画完整绣球场景 ---------- */
  /* ctx: 目标 2d 上下文；W,H: 画布尺寸；cfg: 作品配置；opts:{rotation, bg:'transparent'|color} */
  function renderBall(ctx, W, H, cfg, opts) {
    opts = opts || {};
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    if (opts.bg) {
      ctx.fillStyle = opts.bg;
      ctx.fillRect(0, 0, W, H);
    }
    var R = Math.min(W, H) * 0.30;
    var cx = W / 2;
    var cy = H * 0.42;
    var rotation = opts.rotation || 0;

    // 上方挂绳
    drawCord(ctx, cx, cy - R * 1.45, cy - R, cfg.cord || 'single', R);

    // 底部阴影
    ctx.fillStyle = 'rgba(60,40,20,0.10)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + R * 1.0, R * 0.62, R * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // 球体底盘：保证轮廓是圆、缝隙不露底色
    ctx.fillStyle = avgColor(cfg.petals);
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.97, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(30,20,10,0.35)';
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.97, 0, Math.PI * 2); ctx.fill();

    // 十二瓣：先画"背面"（上下方向视觉上），按 sin 排序保证层次
    var order = [];
    for (var i = 0; i < 12; i++) {
      var a = rotation + (i * Math.PI) / 6;
      order.push({ a: a, i: i, key: Math.sin(a) });
    }
    order.sort(function (p, q) { return p.key - q.key; });
    order.forEach(function (o) {
      drawPetal(ctx, cx, cy, R, o.a, cfg.petals[o.i], cfg.mode || 'solid');
    });
    // 金色包边：将十二瓣收口为整圆
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = Math.max(1.5, R * 0.016);
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.985, 0, Math.PI * 2); ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.setLineDash([R * 0.025, R * 0.02]);
    ctx.lineWidth = Math.max(1, R * 0.009);
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.955, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // 球心绑结
    ctx.fillStyle = GOLD;
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = shade(GOLD, -40);
    ctx.lineWidth = Math.max(1, R * 0.008);
    ctx.beginPath(); ctx.arc(cx, cy, R * 0.08, 0, Math.PI * 2); ctx.stroke();

    // 吊坠 + 流苏
    var py = cy + R * 1.02;
    var endY = drawPendant(ctx, cx, py, cfg.pendant || 'ring', R, cfg.tassel.color);
    drawTassel(ctx, cx, endY + R * 0.02, cfg.tassel, R);
    ctx.restore();
  }

  /* ---------- 便捷：生成作品缩略图 dataURL ---------- */
  function thumb(cfg, size) {
    var c = document.createElement('canvas');
    c.width = size; c.height = size * 1.25;
    renderBall(c.getContext('2d'), c.width, c.height, cfg, { rotation: -Math.PI / 2 + Math.PI / 6 });
    return c.toDataURL('image/png');
  }

  /* ---------- 默认作品配置 ---------- */
  function defaultConfig() {
    var P = window.XQ_DATA.palette;
    function pick(i) { return P[i % P.length].hex; }
    var petals = [];
    var defaults = [0, 6, 12, 8, 0, 6, 12, 8, 0, 6, 12, 8]; // 传统配色：朱红/青绿/米白/靛青交替
    for (var i = 0; i < 12; i++) {
      petals.push({ c1: pick(defaults[i]), c2: pick((defaults[i] + 4) % P.length), pattern: null });
    }
    return {
      name: '我的绣球',
      mode: 'solid',
      petals: petals,
      tassel: { color: '#C2432B', length: 'mid', style: 'straight' },
      pendant: 'ring',
      cord: 'knot',
      createdAt: Date.now()
    };
  }

  window.XQ_RENDER = {
    renderBall: renderBall,
    thumb: thumb,
    defaultConfig: defaultConfig,
    drawPattern: drawPattern,
    lum: lum
  };
})();
