// Upload de arquivo - mostrar nomes
const inputArquivo = document.getElementById('meuArquivo');
const nomeArquivo = document.getElementById('file-name');

inputArquivo.addEventListener('change', function () {
  if (this.files.length > 0) {
    const nomes = Array.from(this.files).map(f => f.name).join(', ');
    nomeArquivo.textContent = nomes;
  } else {
    nomeArquivo.textContent = 'Nenhum arquivo escolhido';
  }
});

let step = 1;
const totalSteps = 8;
const dados = {};

const etapas = [
  {
    campo: 'email',
    tipo: 'input',
    required: true
  },
  {
    campo: 'topo',
    tipo: 'radio',
    comentario: 'comentario-topo'
  },
  {
    campo: 'banner',
    tipo: 'radio',
    comentario: 'comentario-banner'
  },
  {
    campo: 'cards',
    tipo: 'radio',
    comentario: 'comentario-cards'
  },
  {
    campo: 'lista',
    tipo: 'radio',
    comentario: 'comentario-lista'
  },
  {
    campo: 'destaque',
    tipo: 'radio',
    comentario: 'comentario-destaque'
  },
  {
    campo: 'rodape',
    tipo: 'radio',
    comentario: 'comentario-rodape'
  }
];

function nextStep() {

  const email = document.getElementById('email');

    if (!email.checkValidity()) {
      email.reportValidity(); // exibe erro nativo do navegador
      return false; // impede envio
    }

  if (step <= etapas.length) {
    const etapaAtual = etapas[step - 1];
    
    if (etapaAtual.tipo === 'input') {
      const valor = document.getElementById(etapaAtual.campo).value;
      if (etapaAtual.required && !valor) {
        alert(`Por favor, preencha o campo ${etapaAtual.campo}.`);
        return;
      }
      dados[etapaAtual.campo] = valor;
    }

    if (etapaAtual.tipo === 'radio') {
      const selecionado = document.querySelector(`input[name="${etapaAtual.campo}"]:checked`);
      if (!selecionado) {
        alert(`Escolha um modelo de ${etapaAtual.campo}.`);
        return;
      }
      dados[etapaAtual.campo] = selecionado.value;

      const comentarioEl = document.getElementById(etapaAtual.comentario);
      dados[`comentario${capitalize(etapaAtual.campo)}`] = comentarioEl ? comentarioEl.value : '';
    }
  }

  document.getElementById(`step-${step}`).classList.remove('active');
  step++;
  if (step <= totalSteps) {
    document.getElementById(`step-${step}`).classList.add('active');
    if (step === totalSteps) montarResumo();
  }
}

function prevStep() {
  if (step > 1) {
    document.getElementById(`step-${step}`).classList.remove('active');
    step--;
    document.getElementById(`step-${step}`).classList.add('active');
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function montarResumo() {
  const resumo = document.getElementById('resumo');
  resumo.innerHTML = `<p><strong>Email:</strong> ${dados.email}</p>`;

  ['topo', 'banner', 'cards', 'lista', 'destaque', 'rodape'].forEach(campo => {
    const selecionado = document.querySelector(`input[name="${campo}"]:checked`);
    if (selecionado) {
      const label = selecionado.closest('label');
      const img = label.querySelector('img');
      const span = label.querySelector('span');

      const srcImagem = img ? img.src : '';
      const textoOpcao = span ? span.textContent : '';

      resumo.innerHTML += `
        <p><strong>${capitalize(campo)}:</strong> ${textoOpcao}</p>
        <img src="${srcImagem}" width="200">
        <p><strong>Comentário:</strong> ${dados[`comentario${capitalize(campo)}`] || ''}</p>
      `;
    }
  });
}

async function gerarPDF() {
  const { jsPDF } = window.jspdf;
  const resumo = document.getElementById('resumo');

  const canvas = await html2canvas(resumo, {
    useCORS: true, // precisa para imagens externas com CORS liberado
    scale: 2
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = {
    width: canvas.width,
    height: canvas.height
  };

  const imgWidth = pageWidth - 20;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  const totalPDFPages = Math.ceil(imgHeight / pageHeight);
  let position = 0;

  for (let i = 0; i < totalPDFPages; i++) {
    const srcY = (canvas.height / totalPDFPages) * i;
    const canvasPage = document.createElement('canvas');
    canvasPage.width = canvas.width;
    canvasPage.height = canvas.height / totalPDFPages;

    const ctx = canvasPage.getContext('2d');
    ctx.drawImage(
      canvas,
      0, srcY,
      canvas.width, canvasPage.height,
      0, 0,
      canvas.width, canvasPage.height
    );

    const pageData = canvasPage.toDataURL('image/png');
    if (i > 0) pdf.addPage();
    pdf.addImage(pageData, 'PNG', 10, 10, imgWidth, (canvasPage.height * imgWidth) / canvas.width);
  }

  pdf.save("briefing.pdf");
}

const btn = document.getElementById('dark-mode-toggle');
const icon = btn.querySelector('i');

btn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  btn.classList.toggle('light');

  if (btn.classList.contains('light')) {
    icon.className = 'far fa-sun';
  } else {
    icon.className = 'far fa-moon';
  }
});