(() => {
  const storageKey = '11g-site-data-v1';
  const defaults = {
    site: {
      heroSubtitle: 'Maktab hayotining eng yaxshi yillari shu yerda qoldi.',
      footerText: '11-G sinf bitiruvchilari',
      instagramUrl: 'https://www.instagram.com/11g_class_15_',
      heroImage: ''
    },
    quotes: [
      { text: 'Bu sinf menga faqat bilim emas, haqiqiy do‘stlar ham berdi.', author: 'Ismingiz' },
      { text: 'Darslar tugaydi, xotiralar qoladi. Rahmat, 11-G!', author: 'Ismingiz' },
      { text: 'Ustozlarimizga va bir-birimizga minnatdormiz.', author: 'Ismingiz' }
    ],
    photos: []
  };

  const published = window.publishedSiteData;
  if (published && typeof published === 'object' && !Array.isArray(published)) {
    defaults.site = { ...defaults.site, ...(published.site || {}) };
    if (Array.isArray(published.quotes)) defaults.quotes = published.quotes;
    if (Array.isArray(published.photos)) defaults.photos = published.photos;
  }

  function copyDefaults() {
    return JSON.parse(JSON.stringify(defaults));
  }

  function load() {
    const saved = localStorage.getItem(storageKey);
    if (saved === null) return copyDefaults();

    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Sayt ma’lumotlari noto‘g‘ri formatda saqlangan.');
    }

    return {
      site: { ...defaults.site, ...(parsed.site || {}) },
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes : copyDefaults().quotes,
      photos: Array.isArray(parsed.photos) ? parsed.photos : []
    };
  }

  function save(data) {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function prepareImage(file) {
    if (!file.type.startsWith('image/')) {
      return Promise.reject(new Error('Faqat rasm faylini tanlang.'));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('Rasmni o‘qib bo‘lmadi.'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('Tanlangan rasmni ochib bo‘lmadi.'));
        image.onload = () => {
          const maxSide = 1400;
          const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.naturalWidth * scale);
          canvas.height = Math.round(image.naturalHeight * scale);
          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('Rasmni tayyorlash uchun canvas ochilmadi.'));
            return;
          }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const webp = canvas.toDataURL('image/webp', 0.82);
          resolve(webp.startsWith('data:image/webp')
            ? webp
            : canvas.toDataURL('image/jpeg', 0.82));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  window.siteData = { load, save, prepareImage, copyDefaults };
})();
