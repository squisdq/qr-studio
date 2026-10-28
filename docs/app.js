(() => {
  const $ = (id) => document.getElementById(id);
  const content = $('qr-content');
  const qrHost = $('qrcode');
  const placeholder = $('qr-placeholder');
  let logoData = undefined;
  let logoFileName = '';
  let dotStyle = 'rounded';
  let qr;
  let updateTimer;

  const options = () => ({
    width: 280,
    height: 280,
    type: 'canvas',
    data: content.value.trim() || ' ',
    image: logoData,
    margin: 8,
    qrOptions: { errorCorrectionLevel: $('error-level').value },
    imageOptions: { hideBackgroundDots: true, imageSize: Number($('logo-size').value) / 100, margin: 5, crossOrigin: 'anonymous' },
    dotsOptions: { color: $('qr-color').value, type: dotStyle },
    cornersSquareOptions: { color: $('qr-color').value, type: 'extra-rounded' },
    cornersDotOptions: { color: $('qr-color').value, type: 'dot' },
    backgroundOptions: { color: $('bg-color').value }
  });

  function render() {
    const value = content.value.trim();
    placeholder.hidden = Boolean(value);
    qrHost.style.opacity = value ? '1' : '.12';
    if (!value) {
      qrHost.innerHTML = '';
      return;
    }
    try {
      if (!qr) {
        qr = new QRCodeStyling(options());
        qr.append(qrHost);
      } else {
        qr.update(options());
      }
      $('download-note').textContent = 'Бесплатно · Без водяных знаков';
    } catch (error) {
      $('download-note').textContent = 'Не удалось создать код. Проверь введённый текст.';
      console.error(error);
    }
  }
  function scheduleRender() {
    clearTimeout(updateTimer);
    updateTimer = setTimeout(render, 120);
  }
  function updateColorLabel(input, label) { $(label).textContent = input.value.toUpperCase(); }

  content.addEventListener('input', () => {
    document.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('active', chip.dataset.value === content.value));
    scheduleRender();
  });
  $('clear-content').addEventListener('click', () => { content.value = ''; content.focus(); render(); });
  document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
    content.value = chip.dataset.value;
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
    render();
  }));
  document.querySelectorAll('.style-option').forEach(button => button.addEventListener('click', () => {
    dotStyle = button.dataset.style;
    document.querySelectorAll('.style-option').forEach(b => b.classList.toggle('selected', b === button));
    render();
  }));
  $('qr-color').addEventListener('input', () => { updateColorLabel($('qr-color'), 'qr-color-value'); render(); });
  $('bg-color').addEventListener('input', () => { updateColorLabel($('bg-color'), 'bg-color-value'); render(); });
  document.querySelectorAll('.swatch').forEach(button => button.addEventListener('click', () => {
    $('qr-color').value = button.dataset.fg;
    $('bg-color').value = button.dataset.bg;
    updateColorLabel($('qr-color'), 'qr-color-value');
    updateColorLabel($('bg-color'), 'bg-color-value');
    render();
  }));
  $('logo-upload').addEventListener('change', event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер — 5 МБ.');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      logoData = reader.result;
      logoFileName = file.name;
      $('logo-name').textContent = logoFileName;
      $('logo-options').hidden = false;
      $('upload-zone').classList.add('has-logo');
      render();
    };
    reader.readAsDataURL(file);
  });
  $('remove-logo').addEventListener('click', () => {
    logoData = undefined;
    logoFileName = '';
    $('logo-upload').value = '';
    $('logo-options').hidden = true;
    $('upload-zone').classList.remove('has-logo');
    render();
  });
  $('logo-size').addEventListener('input', () => {
    $('logo-size-value').textContent = `${$('logo-size').value}%`;
    render();
  });
  $('error-level').addEventListener('change', render);
  $('download-png').addEventListener('click', () => {
    if (!content.value.trim() || !qr) return;
    qr.download({ name: 'my-qr-code', extension: 'png' });
  });
  $('download-svg').addEventListener('click', () => {
    if (!content.value.trim() || !qr) return;
    qr.download({ name: 'my-qr-code', extension: 'svg' });
  });

  render();
})();
