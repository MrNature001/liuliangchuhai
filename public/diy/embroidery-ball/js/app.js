/* 绣球DIY - 主交互逻辑 */
/* 页面路由 / DIY编辑状态 / 作品库(localStorage) / 海报生成 / 弹层 */
(function () {
  'use strict';

  var D = window.XQ_DATA;
  var R = window.XQ_RENDER;
  var LS_KEY = 'xiuqiu_works_v1';

  /* ---------- 工具 ---------- */
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  /* ---------- 弹层 ---------- */
  var mask = $('#modalMask'), modalBox = $('#modalBox');
  function openModal(html, centerMode) {
    modalBox.innerHTML = html;
    modalBox.className = centerMode ? 'modal center' : 'modal';
    mask.classList.toggle('center-mode', !!centerMode);
    mask.classList.add('show');
  }
  function closeModal() { mask.classList.remove('show'); }
  mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(); });

  /* ---------- 页面路由 ---------- */
  var pages = { home: 'page-home', diy: 'page-diy', culture: 'page-culture', tutorial: 'page-tutorial', works: 'page-works', profile: 'page-profile' };
  var tabPages = ['home', 'culture', 'tutorial', 'profile'];
  function nav(name) {
    Object.keys(pages).forEach(function (k) {
      document.getElementById(pages[k]).classList.toggle('active', k === name);
    });
    $$('.tabbar .tab').forEach(function (t) {
      t.classList.toggle('on', t.dataset.nav === (name === 'works' ? 'profile' : name));
    });
    if (name === 'diy') { requestAnimationFrame(renderDiy); }
    if (name === 'works') { renderWorksPage(); }
    if (name === 'profile') { updateStats(); }
  }
  document.addEventListener('click', function (e) {
    var n = e.target.closest('[data-nav]');
    if (n) nav(n.dataset.nav);
  });

  /* ================= 启动页 ================= */
  (function splash() {
    var c = $('#splashCanvas');
    R.renderBall(c.getContext('2d'), c.width, c.height, R.defaultConfig(), { rotation: 0.2 });
    setTimeout(function () { $('#splash').classList.add('hide'); }, 2100);
  })();

  /* ================= 首页 ================= */
  (function buildHome() {
    // Banner
    var list = $('#bannerList');
    var bgs = [
      'linear-gradient(135deg,#C2432B,#8C2F39)',
      'linear-gradient(135deg,#2E6E5E,#1E4A3F)',
      'linear-gradient(135deg,#C9A227,#8a6d14)'
    ];
    list.innerHTML = D.banners.map(function (b, i) {
      return '<div class="banner-item" style="background:' + bgs[i % 3] + '">' +
        '<span class="tag">' + b.tag + '</span><h3>' + b.title + '</h3><p>' + b.desc + '</p></div>';
    }).join('');
    // Banner 自动轮播
    var bi = 0;
    setInterval(function () {
      if (!document.getElementById('page-home').classList.contains('active')) return;
      bi = (bi + 1) % D.banners.length;
      var w = list.children[0].offsetWidth + 12;
      list.scrollTo({ left: bi * w, behavior: 'smooth' });
    }, 3200);
    renderHomeStrip();
  })();

  /* ---------- 作品库 ---------- */
  function loadWorks() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch (e) { return []; }
  }
  function saveWorks(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }

  function renderHomeStrip() {
    var strip = $('#homeWorksStrip');
    var works = loadWorks();
    if (!works.length) {
      // 预置示例
      var demo = [
        { name: '壮族三月三', cfg: sampleConfig(0) },
        { name: '莲年有余', cfg: sampleConfig(1) },
        { name: '鹤寿安康', cfg: sampleConfig(2) }
      ];
      strip.innerHTML = demo.map(function (d, i) {
        return '<div class="ws-item" data-idx="' + i + '" data-demo="1"><img src="' + R.thumb(d.cfg, 200) + '" alt="' + d.name + '"><span>' + d.name + '</span></div>';
      }).join('');
      $$('.ws-item', strip).forEach(function (el) {
        el.addEventListener('click', function () {
          editingConfig = clone(demo[+el.dataset.idx].cfg);
          nav('diy');
          toast('已载入示例作品，继续创作吧');
        });
      });
      return;
    }
    strip.innerHTML = works.map(function (w) {
      return '<div class="ws-item" data-id="' + w.id + '"><img src="' + w.thumb + '" alt=""><span>' + escHtml(w.name) + '</span></div>';
    }).join('');
    $$('.ws-item', strip).forEach(function (el) {
      el.addEventListener('click', function () { openWorkDetail(el.dataset.id); });
    });
  }
  function sampleConfig(i) {
    var c = R.defaultConfig();
    var sets = [
      { pattern: 'zhuangjin', scheme: ['#C2432B', '#C9A227'] },
      { pattern: 'lotus', scheme: ['#C29BB0', '#F5EFE2'] },
      { pattern: 'crane', scheme: ['#3D5A80', '#DCE4E4'] }
    ];
    var s = sets[i % 3];
    c.mode = 'gradient';
    c.petals.forEach(function (p, j) {
      p.c1 = s.scheme[j % 2];
      p.c2 = s.scheme[(j + 1) % 2];
      p.pattern = j % 2 === 0 ? s.pattern : null;
    });
    c.name = ['壮族三月三', '莲年有余', '鹤寿安康'][i % 3];
    return c;
  }
  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  /* ================= DIY 工作台 ================= */
  var editingConfig = R.defaultConfig();
  var editingWorkId = null;
  var selectedPetal = 0;
  var rotation = 0.25;

  var diyCanvas = $('#diyCanvas');
  function renderDiy() {
    R.renderBall(diyCanvas.getContext('2d'), diyCanvas.width, diyCanvas.height, editingConfig, { rotation: rotation });
  }

  // 拖动旋转
  (function drag() {
    var wrap = $('#diyCanvasWrap');
    var dragging = false, lastX = 0;
    function start(x) { dragging = true; lastX = x; }
    function move(x) {
      if (!dragging) return;
      rotation += (x - lastX) * 0.012;
      lastX = x;
      renderDiy();
    }
    function end() { dragging = false; }
    wrap.addEventListener('pointerdown', function (e) { start(e.clientX); wrap.setPointerCapture(e.pointerId); });
    wrap.addEventListener('pointermove', function (e) { move(e.clientX); });
    wrap.addEventListener('pointerup', end);
    wrap.addEventListener('pointercancel', end);
  })();

  // DIY 面板切换
  $$('.diy-tabs .dt').forEach(function (t) {
    t.addEventListener('click', function () {
      $$('.diy-tabs .dt').forEach(function (x) { x.classList.remove('on'); });
      t.classList.add('on');
      ['color', 'pattern', 'decor'].forEach(function (k) {
        document.getElementById('panel-' + k).style.display = t.dataset.diytab === k ? 'block' : 'none';
      });
    });
  });

  // 配色模式
  $$('#panel-color [data-mode]').forEach(function (c) {
    c.addEventListener('click', function () {
      $$('#panel-color [data-mode]').forEach(function (x) { x.classList.remove('on'); });
      c.classList.add('on');
      editingConfig.mode = c.dataset.mode;
      renderDiy();
    });
  });

  // 瓣面选择
  (function petalSelect() {
    var sel = $('#petalSelect');
    var opts = ['<option value="all">全部十二瓣</option>'];
    for (var i = 0; i < 12; i++) opts.push('<option value="' + i + '">第 ' + (i + 1) + ' 瓣</option>');
    sel.innerHTML = opts.join('');
    sel.value = '0';
    sel.addEventListener('change', function () {
      selectedPetal = sel.value === 'all' ? 'all' : +sel.value;
      syncSwatchState();
    });
  })();

  function eachTargetPetal(fn) {
    if (selectedPetal === 'all') {
      editingConfig.petals.forEach(function (p, i) { fn(p, i); });
    } else {
      fn(editingConfig.petals[selectedPetal], selectedPetal);
    }
  }

  // 色板
  function buildSwatches(container, get, set) {
    container.innerHTML = '';
    D.palette.forEach(function (p) {
      var s = document.createElement('div');
      s.className = 'swatch';
      s.style.background = p.hex;
      s.title = p.name;
      s.addEventListener('click', function () { set(p.hex); renderDiy(); syncSwatchState(); });
      container.appendChild(s);
    });
    // 自定义取色
    var custom = document.createElement('div');
    custom.className = 'swatch custom-input';
    var inp = document.createElement('input');
    inp.type = 'color';
    inp.addEventListener('input', function () { set(inp.value); renderDiy(); });
    custom.appendChild(inp);
    container.appendChild(custom);
  }

  function currentPetal() {
    return editingConfig.petals[selectedPetal === 'all' ? 0 : selectedPetal];
  }
  function syncSwatchState() {
    var c1 = currentPetal().c1, c2 = currentPetal().c2;
    $$('#swatchC1 .swatch').forEach(function (s, i) {
      s.classList.toggle('on', i < D.palette.length && D.palette[i].hex === c1);
    });
    $$('#swatchC2 .swatch').forEach(function (s, i) {
      s.classList.toggle('on', i < D.palette.length && D.palette[i].hex === c2);
    });
  }

  buildSwatches($('#swatchC1'), function () { return currentPetal().c1; }, function (hex) { eachTargetPetal(function (p) { p.c1 = hex; }); });
  buildSwatches($('#swatchC2'), function () { return currentPetal().c2; }, function (hex) { eachTargetPetal(function (p) { p.c2 = hex; }); });

  $('#btnApplyAllColor').addEventListener('click', function () {
    var src = currentPetal();
    editingConfig.petals.forEach(function (p) { p.c1 = src.c1; p.c2 = src.c2; });
    renderDiy();
    toast('配色已应用到全部十二瓣');
  });

  /* ---------- 纹样面板 ---------- */
  (function buildPatterns() {
    var grid = $('#patternGrid');
    var sel = $('#patternTarget');
    var opts = ['<option value="all">全局一键贴纹</option>'];
    for (var i = 0; i < 12; i++) opts.push('<option value="' + i + '">仅第 ' + (i + 1) + ' 瓣</option>');
    sel.innerHTML = opts.join('');

    D.patterns.forEach(function (p) {
      var cell = document.createElement('div');
      cell.className = 'pattern-cell';
      cell.innerHTML = '<div class="info-dot" title="查看释义">i</div><canvas width="96" height="96"></canvas><span>' + p.name + '</span>';
      var cv = cell.querySelector('canvas');
      var ctx = cv.getContext('2d');
      ctx.translate(48, 46);
      R.drawPattern(ctx, p.id, 0, 0, 32, -Math.PI / 2, '#8C2F39');
      // 点 i 看释义
      cell.querySelector('.info-dot').addEventListener('click', function (e) {
        e.stopPropagation();
        openModal(
          '<h3>' + p.name + '</h3>' +
          '<div class="pattern-meaning">' + p.meaning + '</div>' +
          '<div class="pattern-scenes">常见应用场景：' + p.scenes + '</div>' +
          '<div class="modal-actions"><button class="btn btn-primary" id="miOk">知道了</button></div>', true);
        $('#miOk').addEventListener('click', closeModal);
      });
      // 贴纹
      cell.addEventListener('click', function () {
        var target = sel.value;
        if (target === 'all') {
          editingConfig.petals.forEach(function (pt) { pt.pattern = p.id; });
          toast('已为全部十二瓣贴上 ' + p.name);
        } else {
          editingConfig.petals[+target].pattern = p.id;
          toast('第 ' + (+target + 1) + ' 瓣已贴上 ' + p.name);
        }
        $$('.pattern-cell').forEach(function (x) { x.classList.remove('on'); });
        cell.classList.add('on');
        renderDiy();
      });
      grid.appendChild(cell);
    });

    $('#btnClearPattern').addEventListener('click', function () {
      var target = $('#patternTarget').value;
      if (target === 'all') { editingConfig.petals.forEach(function (pt) { pt.pattern = null; }); }
      else { editingConfig.petals[+target].pattern = null; }
      $$('.pattern-cell').forEach(function (x) { x.classList.remove('on'); });
      renderDiy();
      toast('纹样已清除');
    });
  })();

  /* ---------- 配饰面板 ---------- */
  function buildOptRow(container, items, cur, onPick, isSwatch) {
    container.innerHTML = '';
    items.forEach(function (it) {
      var el;
      if (isSwatch) {
        el = document.createElement('div');
        el.className = 'swatch' + (cur() === it.hex ? ' on' : '');
        el.style.background = it.hex;
        el.title = it.name;
      } else {
        el = document.createElement('div');
        el.className = 'chip' + (cur() === it.id ? ' on' : '');
        el.textContent = it.name;
      }
      el.addEventListener('click', function () { onPick(it); renderDiy(); });
      container.appendChild(el);
    });
  }
  function refreshDecor() {
    buildOptRow($('#tasselColors'), D.tassel.colors, function () { return editingConfig.tassel.color; }, function (it) { editingConfig.tassel.color = it.hex; refreshDecor(); }, true);
    buildOptRow($('#tasselLengths'), D.tassel.lengths, function () { return editingConfig.tassel.length; }, function (it) { editingConfig.tassel.length = it.id; refreshDecor(); });
    buildOptRow($('#tasselStyles'), D.tassel.styles, function () { return editingConfig.tassel.style; }, function (it) { editingConfig.tassel.style = it.id; refreshDecor(); });
    buildOptRow($('#pendantOpts'), D.pendants, function () { return editingConfig.pendant; }, function (it) { editingConfig.pendant = it.id; refreshDecor(); });
    buildOptRow($('#cordOpts'), D.cords, function () { return editingConfig.cord; }, function (it) { editingConfig.cord = it.id; refreshDecor(); });
  }
  refreshDecor();

  /* ---------- 保存 / 海报 / 重置 ---------- */
  $('#btnResetWork').addEventListener('click', function () {
    openModal(
      '<h3>重新创作</h3>' +
      '<div class="pattern-meaning">将清空当前配色、纹样与配饰设置，恢复默认十二瓣样式。确定重新开始吗？</div>' +
      '<div class="modal-actions"><button class="btn btn-ghost" id="mrCancel">再想想</button><button class="btn btn-primary" id="mrOk">重新创作</button></div>', true);
    $('#mrCancel').addEventListener('click', closeModal);
    $('#mrOk').addEventListener('click', function () {
      editingConfig = R.defaultConfig();
      editingWorkId = null;
      rotation = 0.25;
      syncSwatchState(); refreshDecor(); renderDiy();
      closeModal();
      toast('已恢复默认样式，尽情创作吧');
    });
  });

  $('#btnSaveWork').addEventListener('click', function () {
    openModal(
      '<h3>保存作品</h3>' +
      '<div style="margin-top:12px"><input id="workNameInput" value="' + escHtml(editingConfig.name) + '" maxlength="12" ' +
      'style="width:100%;padding:12px 14px;font-size:15px;border-radius:12px;border:1px solid rgba(110,75,38,0.3);background:#FFFDF7;color:#333;outline:none;" placeholder="给绣球起个名字"></div>' +
      '<div class="modal-actions"><button class="btn btn-ghost" id="msCancel">取消</button><button class="btn btn-primary" id="msOk">保存到作品库</button></div>', true);
    var input = $('#workNameInput');
    input.focus(); input.select();
    $('#msCancel').addEventListener('click', closeModal);
    $('#msOk').addEventListener('click', function () {
      var name = input.value.trim() || '我的绣球';
      editingConfig.name = name;
      editingConfig.createdAt = Date.now();
      var works = loadWorks();
      var item = { id: editingWorkId || ('w' + Date.now()), name: name, config: clone(editingConfig), thumb: R.thumb(editingConfig, 300), createdAt: editingConfig.createdAt };
      var idx = works.findIndex(function (w) { return w.id === item.id; });
      if (idx >= 0) works[idx] = item; else works.unshift(item);
      saveWorks(works);
      editingWorkId = item.id;
      closeModal();
      renderHomeStrip();
      updateStats();
      toast('作品「' + name + '」已保存');
    });
  });

  /* ---------- 海报生成 ---------- */
  function generatePoster(cfg, cb) {
    var W = 750, H = 1120;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    // 纸底
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#F5EFE2');
    bg.addColorStop(1, '#EDE3CD');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    // 顶部饰带
    ctx.fillStyle = '#1E4A3F';
    ctx.fillRect(0, 0, W, 118);
    ctx.fillStyle = '#C9A227';
    ctx.fillRect(0, 118, W, 4);
    ctx.fillStyle = '#F5EFE2';
    ctx.font = '44px KaiTi, STKaiti, SimSun, serif';
    ctx.textAlign = 'center';
    ctx.fillText('绣球DIY · 云上非遗创作', W / 2, 76);
    // 球体
    R.renderBall(ctx, W, 640, cfg, { rotation: 0.35 });
    // 作品名
    ctx.fillStyle = '#8C2F39';
    ctx.font = '52px KaiTi, STKaiti, SimSun, serif';
    ctx.fillText('「' + (cfg.name || '我的绣球') + '」', W / 2, 820);
    // 纹样释义
    var used = [];
    cfg.petals.forEach(function (p) {
      if (p.pattern && used.indexOf(p.pattern) < 0) used.push(p.pattern);
    });
    ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#33383D';
    var ay = 875;
    used.forEach(function (pid) {
      var p = D.patterns.find(function (x) { return x.id === pid; });
      if (!p) return;
      ctx.fillStyle = '#C2432B';
      ctx.fillText('【' + p.name + '】', W / 2, ay);
      ctx.fillStyle = '#33383D';
      ctx.font = '20px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText(p.meaning.split('。')[0] + '。', W / 2, ay + 32);
      ay += 72;
      ctx.font = '24px "PingFang SC", "Microsoft YaHei", sans-serif';
    });
    if (!used.length) {
      ctx.fillStyle = '#6B6F66';
      ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif';
      ctx.fillText('素面绣球 · 大巧若拙', W / 2, ay);
    }
    // 底部
    ctx.fillStyle = '#8C2F39';
    ctx.fillRect(0, H - 92, W, 92);
    ctx.fillStyle = '#F5EFE2';
    ctx.font = '26px KaiTi, STKaiti, SimSun, serif';
    ctx.fillText('指尖做绣球 · 云上传壮韵', W / 2, H - 48);
    ctx.font = '16px "PingFang SC", sans-serif';
    ctx.fillText('广西绣球 · 国家级非物质文化遗产 · ' + new Date().toLocaleDateString('zh-CN'), W / 2, H - 20);
    cb(c.toDataURL('image/png'));
  }

  $('#btnPoster').addEventListener('click', function () {
    toast('正在生成海报...');
    setTimeout(function () {
      generatePoster(editingConfig, function (url) {
        openModal(
          '<h3>非遗海报已生成</h3>' +
          '<img class="poster-img" src="' + url + '" alt="poster">' +
          '<div class="modal-actions">' +
          '<a class="btn btn-gold" download="' + escHtml(editingConfig.name) + '-绣球海报.png" href="' + url + '" style="text-decoration:none">保存图片</a>' +
          '<button class="btn btn-ghost" id="mpClose">关闭</button></div>');
        $('#mpClose').addEventListener('click', closeModal);
      });
    }, 80);
  });

  /* ================= 我的作品页 ================= */
  function renderWorksPage() {
    var works = loadWorks();
    $('#worksEmpty').style.display = works.length ? 'none' : 'block';
    var grid = $('#worksGrid');
    grid.innerHTML = works.map(function (w) {
      return '<div class="work-item card" data-id="' + w.id + '"><img src="' + w.thumb + '">' +
        '<div class="wi-meta"><h4>' + escHtml(w.name) + '</h4><p>' + new Date(w.createdAt).toLocaleDateString('zh-CN') + '</p></div></div>';
    }).join('');
    $$('.work-item', grid).forEach(function (el) {
      el.addEventListener('click', function () { openWorkDetail(el.dataset.id); });
    });
  }

  function openWorkDetail(id) {
    var works = loadWorks();
    var w = works.find(function (x) { return x.id === id; });
    if (!w) return;
    openModal(
      '<h3>' + escHtml(w.name) + '</h3>' +
      '<img class="poster-img" src="' + w.thumb + '">' +
      '<div class="modal-actions" style="flex-wrap:wrap">' +
      '<button class="btn btn-primary" id="wdEdit">再次编辑</button>' +
      '<button class="btn btn-gold" id="wdPoster">生成海报</button>' +
      '<button class="btn btn-ghost" id="wdShare">分享</button>' +
      '<button class="btn btn-ghost" id="wdRename">重命名</button>' +
      '<button class="btn btn-ghost" id="wdDel" style="color:#C2432B;border-color:rgba(194,67,43,0.4)">删除</button>' +
      '</div>');
    $('#wdEdit').addEventListener('click', function () {
      editingConfig = clone(w.config);
      editingWorkId = w.id;
      closeModal();
      syncSwatchState(); refreshDecor();
      nav('diy');
      toast('已载入「' + w.name + '」，继续创作');
    });
    $('#wdPoster').addEventListener('click', function () {
      closeModal();
      setTimeout(function () {
        generatePoster(w.config, function (url) {
          openModal(
            '<h3>非遗海报</h3><img class="poster-img" src="' + url + '">' +
            '<div class="modal-actions"><a class="btn btn-gold" download="' + escHtml(w.name) + '-绣球海报.png" href="' + url + '" style="text-decoration:none">保存图片</a>' +
            '<button class="btn btn-ghost" id="mpClose2">关闭</button></div>');
          $('#mpClose2').addEventListener('click', closeModal);
        });
      }, 80);
    });
    $('#wdShare').addEventListener('click', function () {
      var text = '我用「绣球DIY」设计了一颗非遗绣球《' + w.name + '》，指尖做绣球，云上传壮韵！';
      if (navigator.share) {
        navigator.share({ title: '绣球DIY', text: text }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () { toast('分享文案已复制，快去粘贴给好友吧'); });
      } else {
        toast('请截屏分享给好友');
      }
    });
    $('#wdRename').addEventListener('click', function () {
      openModal(
        '<h3>重命名作品</h3>' +
        '<div style="margin-top:12px"><input id="rnInput" value="' + escHtml(w.name) + '" maxlength="12" ' +
        'style="width:100%;padding:12px 14px;font-size:15px;border-radius:12px;border:1px solid rgba(110,75,38,0.3);background:#FFFDF7;color:#333;outline:none;"></div>' +
        '<div class="modal-actions"><button class="btn btn-ghost" id="rnCancel">取消</button><button class="btn btn-primary" id="rnOk">确定</button></div>', true);
      $('#rnCancel').addEventListener('click', closeModal);
      $('#rnOk').addEventListener('click', function () {
        var name = $('#rnInput').value.trim() || w.name;
        w.name = name; w.config.name = name;
        saveWorks(works);
        closeModal(); renderWorksPage(); renderHomeStrip();
        toast('已重命名为「' + name + '」');
      });
    });
    $('#wdDel').addEventListener('click', function () {
      openModal(
        '<h3>删除作品</h3>' +
        '<div class="pattern-meaning">确定要删除「' + escHtml(w.name) + '」吗？删除后无法恢复。</div>' +
        '<div class="modal-actions"><button class="btn btn-ghost" id="ddCancel">取消</button><button class="btn btn-primary" id="ddOk" style="background:linear-gradient(135deg,#C2432B,#8C2F39)">确认删除</button></div>', true);
      $('#ddCancel').addEventListener('click', closeModal);
      $('#ddOk').addEventListener('click', function () {
        saveWorks(loadWorks().filter(function (x) { return x.id !== id; }));
        closeModal(); renderWorksPage(); renderHomeStrip(); updateStats();
        toast('作品已删除');
      });
    });
  }

  /* ================= 文化科普页 ================= */
  (function buildCulture() {
    var tabs = $('#cultureTabs');
    var list = $('#cultureList');
    var seals = ['源', '俗', '纹', '承'];
    var sealBgs = ['#C2432B', '#2E6E5E', '#C9A227', '#6B4E8C'];

    tabs.innerHTML = D.culture.tabs.map(function (t, i) {
      return '<div class="chip' + (i === 0 ? ' on' : '') + '" data-ctab="' + t.id + '">' + t.name + '</div>';
    }).join('');

    function show(tabId) {
      var ti = D.culture.tabs.findIndex(function (t) { return t.id === tabId; });
      list.innerHTML = D.culture.articles[tabId].map(function (a, i) {
        return '<div class="article-card card" data-body="' + i + '">' +
          '<div class="ac-head"><div class="seal" style="background:' + sealBgs[ti] + '">' + seals[ti] + '</div>' +
          '<div><h4>' + a.title + '</h4><p>' + a.summary + '</p></div></div>' +
          '<div class="article-body" style="display:none">' + a.body +
          (tabId === 'pattern'
            ? '<div class="meaning-box">去 DIY 工作台，把这款纹样贴到你的绣球上吧<button class="btn btn-gold" data-nav="diy" style="margin-top:8px;padding:8px 16px;font-size:12px;width:100%">去创作</button></div>'
            : '') +
          '</div></div>';
      }).join('');
      $$('.article-card', list).forEach(function (card) {
        card.querySelector('.ac-head').addEventListener('click', function () {
          var body = card.querySelector('.article-body');
          var show2 = body.style.display === 'none';
          $$('.article-body', list).forEach(function (b) { b.style.display = 'none'; });
          body.style.display = show2 ? 'block' : 'none';
        });
      });
      var first = list.querySelector('.article-body');
      if (first) first.style.display = 'block';
    }
    $$('.chip', tabs).forEach(function (c) {
      c.addEventListener('click', function () {
        $$('.chip', tabs).forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        show(c.dataset.ctab);
      });
    });
    show('history');
  })();

  /* ================= 手工教程页 ================= */
  (function buildTutorial() {
    $('#materialList').innerHTML = D.tutorial.materials.map(function (m) {
      return '<div class="chip">' + m + '</div>';
    }).join('');
    var steps = $('#stepList');
    steps.innerHTML = D.tutorial.steps.map(function (s, i) {
      return '<div class="step-card card' + (i === 0 ? ' open' : '') + '">' +
        '<div class="step-head"><div class="step-no">' + '一二三四五六'[i] + '</div>' +
        '<div><h4>' + s.no + '. ' + s.name + ' — ' + s.brief + '</h4><div class="diff">难度 ' + s.difficulty + '</div></div>' +
        '<span class="arrow">&#8250;</span></div>' +
        '<div class="step-detail">' + s.detail + '<div class="tip">' + s.tips + '</div></div>' +
        '</div>';
    }).join('');
    $$('.step-head', steps).forEach(function (h) {
      h.addEventListener('click', function () { h.parentElement.classList.toggle('open'); });
    });
  })();

  /* ================= 个人中心 ================= */
  function updateStats() { $('#statWorks').textContent = loadWorks().length; }
  $('#menuAbout').addEventListener('click', function () {
    openModal(
      '<h3>关于我们</h3>' +
      '<div class="pattern-meaning">「绣球DIY」是一款非遗文化交互体验小程序（公益文创 · 学生创新项目）。我们以广西绣球这项国家级非遗为对象，把高门槛的传统手工转化为零门槛的数字创作：配色、贴纹、配饰三步，人人可做一颗完整精美的绣球。</div>' +
      '<div class="pattern-scenes">核心价值：降低非遗体验门槛 · 活化壮族绣球文化 · 让作品可保存、可分享、可反哺线下手工。</div>' +
      '<div class="modal-actions"><button class="btn btn-primary" id="maOk">知道了</button></div>', true);
    $('#maOk').addEventListener('click', closeModal);
  });
  $('#menuNotice').addEventListener('click', function () {
    openModal(
      '<h3>使用须知</h3>' +
      '<div class="pattern-meaning">1. 本程序所有文化内容贴合广西绣球非遗官方释义，无杜撰。<br>2. 作品数据保存在本机浏览器中，清理缓存会导致作品丢失。<br>3. 生成的海报仅供个人学习、分享与公益传播使用。<br>4. 如需实体制作，请参考「手工教程」页并注意针线安全。</div>' +
      '<div class="modal-actions"><button class="btn btn-primary" id="mnOk">我已知晓</button></div>', true);
    $('#mnOk').addEventListener('click', closeModal);
  });
  $('#menuProject').addEventListener('click', function () {
    openModal(
      '<h3>非遗项目说明</h3>' +
      '<div class="pattern-meaning">广西绣球（旧州绣球）是壮族代表性民俗文创，广泛应用于三月三节庆、婚嫁祈福与文旅展演。传统制作含剪裁、拼瓣、刺绣、穿珠、流苏编织等工序，技艺随壮族织锦技艺进入国家级非物质文化遗产保护体系。本项目通过数字创作 + 文化科普 + 作品留存 + 社交传播 + 线下手工引导，探索非遗活化的年轻化路径。</div>' +
      '<div class="modal-actions"><button class="btn btn-primary" id="mpjOk">了解了</button></div>', true);
    $('#mpjOk').addEventListener('click', closeModal);
  });

  /* ---------- 初始化 ---------- */
  updateStats();
  renderDiy();
})();
