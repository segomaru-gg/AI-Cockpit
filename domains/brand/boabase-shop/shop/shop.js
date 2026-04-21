/* shop.js — boabase EC shop
   ページロード・スクロールアニメーション */

document.addEventListener('DOMContentLoaded', () => {
  // フェードイン
  const root = document.querySelector('.shop-root');
  if (root) {
    requestAnimationFrame(() => root.classList.add('loaded'));
  }

  // スクロールリビール
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.shop-reveal').forEach(el => revealObserver.observe(el));

  // NO IMAGE — 画像読み込み失敗時に親コンテナへクラス付与
  document.querySelectorAll('.shop-card__image img, .shop-detail__image img').forEach(img => {
    const markNoImage = () => img.closest('.shop-card__image, .shop-detail__image')?.classList.add('no-image');
    img.addEventListener('error', markNoImage);
    if (img.complete && !img.naturalWidth) markNoImage();
  });

  // ---------- カテゴリフィルタ ----------
  const catBtns = document.querySelectorAll('.shop-cat-btn[data-cat]');
  const rows    = document.querySelectorAll('.shop-row[data-cat]');
  const list    = document.querySelector('.shop-list');

  if (!catBtns.length) return;

  function filterByCategory(cat) {
    let visible = 0;
    rows.forEach(row => {
      const match = cat === 'all' || row.dataset.cat === cat;
      row.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    // 空ステート
    let empty = list.querySelector('.shop-empty');
    if (visible === 0) {
      if (!empty) {
        empty = document.createElement('div');
        empty.className = 'shop-empty';
        empty.innerHTML = '<p class="shop-empty__text">No items in this category yet.</p>';
        list.appendChild(empty);
      }
    } else {
      empty?.remove();
    }
  }

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterByCategory(btn.dataset.cat);
    });
  });

  // 初期表示
  const initial = document.querySelector('.shop-cat-btn.active');
  if (initial) filterByCategory(initial.dataset.cat);
});

