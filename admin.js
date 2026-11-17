const data = siteData.load();
const status = document.getElementById('admin-status');
const quoteList = document.getElementById('admin-quotes');
const photoList = document.getElementById('admin-photos');
const heroImageInput = document.getElementById('hero-image-file');
const heroImageActionText = document.getElementById('hero-image-action-text');
const heroImagePreview = document.getElementById('hero-image-preview');
const removeHeroImageButton = document.getElementById('remove-hero-image');

document.getElementById('hero-subtitle').value = data.site.heroSubtitle;
document.getElementById('footer-text').value = data.site.footerText;
document.getElementById('instagram-url').value = data.site.instagramUrl;
document.getElementById('site-url').value = new URL('./index.html', window.location.href).href;

function showStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function collectFields() {
  data.site = {
    heroSubtitle: document.getElementById('hero-subtitle').value.trim(),
    footerText: document.getElementById('footer-text').value.trim(),
    instagramUrl: document.getElementById('instagram-url').value.trim(),
    heroImage: data.site.heroImage
  };
  data.quotes = [...quoteList.querySelectorAll('.quote-editor')].map(editor => ({
    text: editor.querySelector('textarea').value.trim(),
    author: editor.querySelector('input').value.trim()
  })).filter(quote => quote.text);
}

function renderQuotes() {
  quoteList.replaceChildren();
  data.quotes.forEach((quote, index) => {
    const editor = document.createElement('div');
    editor.className = 'quote-editor';
    const text = document.createElement('textarea');
    text.rows = 2;
    text.maxLength = 500;
    text.value = quote.text;
    text.setAttribute('aria-label', 'Iqtibos matni');
    const author = document.createElement('input');
    author.type = 'text';
    author.maxLength = 80;
    author.value = quote.author;
    author.placeholder = 'Ismi';
    author.setAttribute('aria-label', 'Iqtibos muallifi');
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'admin-button admin-button-remove';
    remove.textContent = 'O‘chirish';
    remove.addEventListener('click', () => {
      collectFields();
      data.quotes.splice(index, 1);
      renderQuotes();
    });
    editor.append(text, author, remove);
    quoteList.appendChild(editor);
  });
}

function renderPhotos() {
  photoList.replaceChildren();
  if (!data.photos.length) {
    const empty = document.createElement('p');
    empty.className = 'admin-empty';
    empty.textContent = 'Hozircha rasm qo‘shilmagan.';
    photoList.appendChild(empty);
    return;
  }

  data.photos.forEach(photo => {
    const item = document.createElement('div');
    item.className = 'admin-photo';
    const image = document.createElement('img');
    image.src = photo.src;
    image.alt = 'Galereyadagi rasm';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'admin-button admin-button-remove';
    remove.textContent = 'O‘chirish';
    remove.addEventListener('click', () => {
      collectFields();
      const previous = data.photos;
      data.photos = data.photos.filter(itemPhoto => itemPhoto.id !== photo.id);
      try {
        siteData.save(data);
        renderPhotos();
        showStatus('Rasm o‘chirildi.');
      } catch (error) {
        data.photos = previous;
        showStatus(`Rasmni o‘chirib bo‘lmadi: ${error.message}`, true);
      }
    });
    item.append(image, remove);
    photoList.appendChild(item);
  });
}

document.getElementById('add-quote').addEventListener('click', () => {
  collectFields();
  data.quotes.push({ text: '', author: '' });
  renderQuotes();
  quoteList.lastElementChild?.querySelector('textarea').focus();
});

document.getElementById('save-settings').addEventListener('click', () => {
  collectFields();
  try {
    siteData.save(data);
    showStatus('O‘zgarishlar saqlandi.');
  } catch (error) {
    showStatus(`Saqlab bo‘lmadi: ${error.message}`, true);
  }
});

document.getElementById('photo-files').addEventListener('change', async event => {
  const files = [...event.target.files];
  if (!files.length) return;
  collectFields();
  const previous = [...data.photos];
  try {
    for (const file of files) {
      data.photos.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        src: await siteData.prepareImage(file)
      });
    }
    siteData.save(data);
    renderPhotos();
    showStatus(`${files.length} ta rasm saqlandi.`);
  } catch (error) {
    data.photos = previous;
    showStatus(`Rasmni saqlab bo‘lmadi: ${error.message}`, true);
  } finally {
    event.target.value = '';
  }
});

function renderHeroImage() {
  const hasImage = Boolean(data.site.heroImage);
  heroImageActionText.textContent = hasImage ? 'Rasmni almashtirish' : 'Rasm tanlash';
  heroImagePreview.hidden = !hasImage;
  removeHeroImageButton.hidden = !hasImage;
  if (hasImage) heroImagePreview.src = data.site.heroImage;
  else heroImagePreview.removeAttribute('src');
}

heroImageInput.addEventListener('change', async () => {
  const file = heroImageInput.files?.[0];
  if (!file) return;

  const previous = data.site.heroImage;
  try {
    collectFields();
    data.site.heroImage = await siteData.prepareImage(file);
    siteData.save(data);
    renderHeroImage();
    showStatus('Bosh sahifa rasmi saqlandi.');
  } catch (error) {
    data.site.heroImage = previous;
    showStatus(`Rasmni saqlab bo‘lmadi: ${error.message}`, true);
  } finally {
    heroImageInput.value = '';
  }
});

removeHeroImageButton.addEventListener('click', () => {
  collectFields();
  const previous = data.site.heroImage;
  data.site.heroImage = '';
  try {
    siteData.save(data);
    renderHeroImage();
    showStatus('Bosh sahifa rasmi o‘chirildi.');
  } catch (error) {
    data.site.heroImage = previous;
    renderHeroImage();
    showStatus(`Rasmni o‘chirib bo‘lmadi: ${error.message}`, true);
  }
});

document.getElementById('share-site').addEventListener('click', async () => {
  const url = document.getElementById('site-url').value;
  try {
    if (navigator.share) {
      await navigator.share({ title: '11-G sinf • Bitiruv', url });
      showStatus('Ulashish oynasi ochildi.');
      return;
    }
    if (!navigator.clipboard?.writeText) throw new Error('Bu brauzer havolani avtomatik nusxalay olmaydi.');
    await navigator.clipboard.writeText(url);
    showStatus('Sayt havolasi nusxalandi.');
  } catch (error) {
    if (error.name === 'AbortError') return;
    showStatus(`${error.message} Havolani yuqoridagi maydondan qo‘lda nusxalang.`, true);
  }
});

document.getElementById('export-site-data').addEventListener('click', () => {
  collectFields();
  const publishedData = {
    site: { ...data.site },
    quotes: data.quotes.map(quote => ({ ...quote })),
    photos: data.photos.map(photo => ({ ...photo }))
  };
  const source = `window.publishedSiteData = JSON.parse(${JSON.stringify(JSON.stringify(publishedData))});\n`;
  const file = new Blob([source], { type: 'text/javascript;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'published-data.js';
  link.click();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  const photoCount = publishedData.photos.length;
  const photoMessage = photoCount === 0
    ? ' Eksportda rasm yo‘q — bu admin panel ochilgan brauzerda saqlangan galereya rasmlari topilmadi.'
    : ` Eksportga ${photoCount} ta rasm qo‘shildi.`;
  showStatus(`published-data.js yuklandi.${photoMessage} Loyiha ichidagi shu nomli faylni almashtirib, GitHub’ga yuboring.`, photoCount === 0);
});

renderQuotes();
renderPhotos();
renderHeroImage();
