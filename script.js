// Configuração fixa do aluno
const CONFIG_ALUNO = {
  turma: "9B",
  numeroChamada: 44,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Variável para armazenar o PIN em memória durante a sessão
let pinSessao = "";

// Dados fictícios/locais padronizados do 9º Ano
let dadosBoletim = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// Função obrigatória para padronizar e validar notas na escala de 0 a 10 (para dados antigos)
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  let num = Number(valor);

  if (isNaN(num)) return null;

  if (num > 10 && num <= 100) {
    num = num / 10;
  }

  if (num < 0 || num > 10) {
    return null;
  }

  return num;
}

// Formata o número para exibir na tabela com 1 casa decimal
function formatarExibicao(nota) {
  if (nota === null || nota === undefined) return "—";
  return nota.toFixed(1).replace(".", ",");
}

// Converte item retornado pela API para o formato local
function converterItemApi(item) {
  return {
    disciplina: item.disciplina,
    tri1: normalizarNota(item.tri1),
    tri2: normalizarNota(item.tri2),
    tri3: normalizarNota(item.tri3),
    faltas: Array.isArray(item.faltas) ? item.faltas : [0, 0, 0]
  };
}

// Função para construir o boletim e calcular resumos
function renderizarBoletim() {
  const tabelaCorpo = document.getElementById("tabela-boletim");
  tabelaCorpo.innerHTML = "";

  let somaMediasGerais = 0;
  let quantDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let contBomDesempenho = 0;
  let contAtencao = 0;

  dadosBoletim.forEach(item => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const faltasArray = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const faltasTotal = faltasArray.reduce((acc, f) => acc + (Number(f) || 0), 0);
    totalFaltasGeral += faltasTotal;

    let somaNotas = 0;
    let notasValidas = 0;

    [n1, n2, n3].forEach(n => {
      if (n !== null) {
        somaNotas += n;
        notasValidas++;
      }
    });

    let media = null;
    let situacao = "Nota ainda não disponível";
    let classeSituacao = "situacao-indisponivel";

    if (notasValidas > 0) {
      media = somaNotas / notasValidas;
      somaMediasGerais += media;
      quantDisciplinasComMedia++;

      if (media >= 6.0) {
        situacao = "Bom desempenho";
        classeSituacao = "situacao-bom";
        contBomDesempenho++;
      } else {
        situacao = "Atenção";
        classeSituacao = "situacao-atencao";
        contAtencao++;
      }
    }

    const tr = document.createElement("tr");

    const tdDisc = document.createElement("td");
    tdDisc.textContent = item.disciplina;
    tr.appendChild(tdDisc);

    const td1 = document.createElement("td");
    td1.textContent = formatarExibicao(n1);
    tr.appendChild(td1);

    const td2 = document.createElement("td");
    td2.textContent = formatarExibicao(n2);
    tr.appendChild(td2);

    const td3 = document.createElement("td");
    td3.textContent = formatarExibicao(n3);
    tr.appendChild(td3);

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = formatarExibicao(media);
    tdMedia.appendChild(strongMedia);
    tr.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = faltasTotal;
    tr.appendChild(tdFaltas);

    const tdSituacao = document.createElement("td");
    tdSituacao.className = classeSituacao;
    tdSituacao.textContent = situacao;
    tr.appendChild(tdSituacao);

    tabelaCorpo.appendChild(tr);
  });

  const mediaGeralFinal = quantDisciplinasComMedia > 0 
    ? (somaMediasGerais / quantDisciplinasComMedia).toFixed(1).replace(".", ",")
    : "--";

  document.getElementById("media-geral").textContent = mediaGeralFinal;
  document.getElementById("total-faltas").textContent = totalFaltasGeral;
  document.getElementById("bom-desempenho").textContent = contBomDesempenho;
  document.getElementById("precisa-atencao").textContent = contAtencao;
}

// Função de Login
async function fazerLogin() {
  const pinInput = document.getElementById("pin-input");
  const mensagem = document.getElementById("mensagem-login");
  const pinDigitado = pinInput.value.trim();

  if (!pinDigitado) {
    mensagem.className = "mensagem-status mensagem-erro";
    mensagem.textContent = "Por favor, digite o PIN.";
    return;
  }

  mensagem.className = "mensagem-status mensagem-info";
  mensagem.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      mensagem.className = "mensagem-status mensagem-erro";
      mensagem.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (resposta.status === 429) {
      mensagem.className = "mensagem-status mensagem-erro";
      mensagem.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!resposta.ok) {
      mensagem.className = "mensagem-status mensagem-erro";
      mensagem.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const resultado = await resposta.json();
    pinSessao = pinDigitado;
    pinInput.value = "";

    if (resultado.dados && Array.isArray(resultado.dados.disciplinas) && resultado.dados.disciplinas.length > 0) {
      dadosBoletim = resultado.dados.disciplinas.map(converterItemApi);
    }

    document.getElementById("area-login").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";
    renderizarBoletim();
  } catch (erro) {
    mensagem.className = "mensagem-status mensagem-erro";
    mensagem.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

// Validação de notas editadas pelo usuário
function validarNotaDigitada(str) {
  if (str === null || str === undefined) return { valida: true, valor: null };
  const s = String(str).trim();
  if (s === "") return { valida: true, valor: null };

  const sNorm = s.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(sNorm)) {
    return { valida: false, valor: null };
  }

  const num = Number(sNorm);
  if (isNaN(num) || num < 0 || num > 10) {
    return { valida: false, valor: null };
  }

  return { valida: true, valor: num };
}

// Validação de faltas editadas pelo usuário
function validarFaltaDigitada(str) {
  if (str === null || str === undefined) return { valida: false, valor: null };
  const s = String(str).trim();
  if (s === "") return { valida: false, valor: null };

  if (!/^\d+$/.test(s)) {
    return { valida: false, valor: null };
  }

  const num = Number(s);
  if (isNaN(num) || num < 0) {
    return { valida: false, valor: null };
  }

  return { valida: true, valor: num };
}

// Abrir painel de edição
function abrirEdicao() {
  const container = document.getElementById("formulario-edicao");
  container.innerHTML = "";
  document.getElementById("mensagem-edicao").textContent = "";

  dadosBoletim.forEach((item, index) => {
    const divItem = document.createElement("div");
    divItem.className = "edicao-linha-item";

    const titulo = document.createElement("div");
    titulo.className = "edicao-titulo-disc";
    titulo.textContent = item.disciplina;
    divItem.appendChild(titulo);

    const grid = document.createElement("div");
    grid.className = "edicao-campos-grid";

    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);
    const faltasArray = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];

    const campos = [
      { id: `edit-n1-${index}`, label: "Nota 1º Tri", val: n1 !== null ? String(n1).replace(".", ",") : "" },
      { id: `edit-n2-${index}`, label: "Nota 2º Tri", val: n2 !== null ? String(n2).replace(".", ",") : "" },
      { id: `edit-n3-${index}`, label: "Nota 3º Tri", val: n3 !== null ? String(n3).replace(".", ",") : "" },
      { id: `edit-f1-${index}`, label: "Faltas 1º Tri", val: String(faltasArray[0] ?? 0) },
      { id: `edit-f2-${index}`, label: "Faltas 2º Tri", val: String(faltasArray[1] ?? 0) },
      { id: `edit-f3-${index}`, label: "Faltas 3º Tri", val: String(faltasArray[2] ?? 0) }
    ];

    campos.forEach(c => {
      const g = document.createElement("div");
      g.className = "campo-grupo";

      const lbl = document.createElement("label");
      lbl.setAttribute("for", c.id);
      lbl.textContent = c.label;

      const inp = document.createElement("input");
      inp.type = "text";
      inp.id = c.id;
      inp.value = c.val;

      g.appendChild(lbl);
      g.appendChild(inp);
      grid.appendChild(g);
    });

    divItem.appendChild(grid);
    container.appendChild(divItem);
  });

  document.getElementById("area-edicao").style.display = "block";
}

// Fechar painel de edição
function fecharEdicao() {
  document.getElementById("area-edicao").style.display = "none";
  document.getElementById("mensagem-edicao").textContent = "";
}

// Salvar alterações via PUT na API
async function salvarAlteracoes() {
  const mensagem = document.getElementById("mensagem-edicao");
  mensagem.textContent = "";

  let comErro = false;
  const novasDisciplinas = [];

  dadosBoletim.forEach((item, index) => {
    const inpN1 = document.getElementById(`edit-n1-${index}`);
    const inpN2 = document.getElementById(`edit-n2-${index}`);
    const inpN3 = document.getElementById(`edit-n3-${index}`);
    const inpF1 = document.getElementById(`edit-f1-${index}`);
    const inpF2 = document.getElementById(`edit-f2-${index}`);
    const inpF3 = document.getElementById(`edit-f3-${index}`);

    [inpN1, inpN2, inpN3, inpF1, inpF2, inpF3].forEach(inp => inp.classList.remove("campo-invalido"));

    const vN1 = validarNotaDigitada(inpN1.value);
    if (!vN1.valida) { inpN1.classList.add("campo-invalido"); comErro = true; }

    const vN2 = validarNotaDigitada(inpN2.value);
    if (!vN2.valida) { inpN2.classList.add("campo-invalido"); comErro = true; }

    const vN3 = validarNotaDigitada(inpN3.value);
    if (!vN3.valida) { inpN3.classList.add("campo-invalido"); comErro = true; }

    const vF1 = validarFaltaDigitada(inpF1.value);
    if (!vF1.valida) { inpF1.classList.add("campo-invalido"); comErro = true; }

    const vF2 = validarFaltaDigitada(inpF2.value);
    if (!vF2.valida) { inpF2.classList.add("campo-invalido"); comErro = true; }

    const vF3 = validarFaltaDigitada(inpF3.value);
    if (!vF3.valida) { inpF3.classList.add("campo-invalido"); comErro = true; }

    if (!comErro) {
      novasDisciplinas.push({
        disciplina: item.disciplina,
        tri1: vN1.valor,
        tri2: vN2.valor,
        tri3: vN3.valor,
        faltas: [vF1.valor, vF2.valor, vF3.valor]
      });
    }
  });

  if (comErro) {
    mensagem.className = "mensagem-status mensagem-erro";
    mensagem.textContent = "Existem campos com valores inválidos. Verifique os destaques em vermelho.";
    return;
  }

  mensagem.className = "mensagem-status mensagem-info";
  mensagem.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      mensagem.className = "mensagem-status mensagem-erro";
      mensagem.textContent = "Falha ao salvar dados no servidor. Tente novamente.";
      return;
    }

    dadosBoletim = novasDisciplinas;
    renderizarBoletim();

    mensagem.className = "mensagem-status mensagem-sucesso";
    mensagem.textContent = "Dados salvos com sucesso.";

    setTimeout(() => {
      fecharEdicao();
    }, 1500);

  } catch (erro) {
    mensagem.className = "mensagem-status mensagem-erro";
    mensagem.textContent = "Falha ao salvar dados no servidor. Tente novamente.";
  }
}