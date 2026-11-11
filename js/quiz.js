const questoes = document.querySelectorAll(".questao");

const cabecalho = document.getElementById("cabecalho");
const caixaQuiz = document.getElementById("quiz");
const textoProgresso = document.getElementById("progresso");
const barraProgresso = document.getElementById("barra-progresso");
const caixaResultado = document.getElementById("resultado");
const textoPontuacao = document.getElementById("pontuacao");
const textoMensagemFinal = document.getElementById("mensagem-final");

const botaoProxima = document.getElementById("botao-proxima");
const botaoRefazer = document.getElementById("botao-refazer");

let questaoAtual = 0;
let acertos = 0;


function prepararAlternativas() {
  for (let i = 0; i < questoes.length; i++) {
    const alternativas = questoes[i].querySelectorAll("input");

    for (let j = 0; j < alternativas.length; j++) {
      const letra = String.fromCharCode(65 + j);

      const etiqueta = document.createElement("span");
      etiqueta.className = "letra";
      etiqueta.textContent = letra;

      alternativas[j].name = "questao" + (i + 1);
      alternativas[j].value = letra;
      alternativas[j].after(etiqueta);
    }
  }
}

function mostrarQuestao() {
  for (let i = 0; i < questoes.length; i++) {
    questoes[i].hidden = true;
  }
  questoes[questaoAtual].hidden = false;

  cabecalho.hidden = questaoAtual != 0;
  textoProgresso.textContent =
    "Questão " + (questaoAtual + 1) + " de " + questoes.length;
  barraProgresso.max = questoes.length;
  barraProgresso.value = questaoAtual + 1;

  botaoProxima.hidden = true;
}

function travarAlternativas(questao) {
  const alternativas = questao.querySelectorAll("input");

  for (let i = 0; i < alternativas.length; i++) {
    alternativas[i].disabled = true;
  }
}

function pintarAlternativas(questao, marcada, letraCerta) {
  const alternativas = questao.querySelectorAll("input");

  for (let i = 0; i < alternativas.length; i++) {
    const rotulo = alternativas[i].closest("label");

    if (alternativas[i].value == letraCerta) {
      rotulo.classList.add("certa");
    } else if (alternativas[i] == marcada) {
      rotulo.classList.add("errada");
    }
  }
}

function mostrarJustificativa(questao, acertou, letraCerta) {
  const caixa = questao.querySelector(".justificativa");
  const status = questao.querySelector(".status");

  if (caixa == null) {
    return;
  }

  if (acertou) {
    status.textContent = "Parabéns, você acertou!";
    caixa.classList.add("acerto");
  } else {
    status.textContent = "Que pena, você errou. A resposta certa é a " + letraCerta + ".";
    caixa.classList.add("erro");
  }

  caixa.hidden = false;
  caixa.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function mostrarBotaoProxima() {
  botaoProxima.hidden = false;

  if (questaoAtual == questoes.length - 1) {
    botaoProxima.textContent = "Ver resultado";
  } else {
    botaoProxima.textContent = "Próxima";
  }
}

function escolherMensagemFinal() {
  if (acertos == questoes.length) {
    return "Perfeito! Você acertou todas as questões.";
  }
  if (acertos >= questoes.length / 2) {
    return "Muito bem! Você foi bem no quiz.";
  }
  return "Continue estudando, você chega lá!";
}

function limparTudo() {
  const alternativas = document.querySelectorAll("input");
  for (let i = 0; i < alternativas.length; i++) {
    alternativas[i].checked = false;
    alternativas[i].disabled = false;
    alternativas[i].closest("label").classList.remove("certa", "errada");
  }

  for (let i = 0; i < questoes.length; i++) {
    const caixa = questoes[i].querySelector(".justificativa");

    questoes[i].classList.remove("respondida");

    if (caixa != null) {
      caixa.hidden = true;
      caixa.classList.remove("acerto", "erro");
    }
  }
}


function responderQuestao(evento) {
  const marcada = evento.target;
  const questao = questoes[questaoAtual];
  const letraCerta = (questao.dataset.correta || "").toUpperCase();
  const acertou = marcada.value == letraCerta;

  if (acertou) {
    acertos++;
  }

  questao.classList.add("respondida");
  travarAlternativas(questao);
  pintarAlternativas(questao, marcada, letraCerta);
  mostrarJustificativa(questao, acertou, letraCerta);
  mostrarBotaoProxima();
}

function irParaProxima() {
  questaoAtual++;

  if (questaoAtual < questoes.length) {
    mostrarQuestao();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  caixaQuiz.hidden = true;
  caixaResultado.hidden = false;
  textoPontuacao.textContent =
    "Você acertou " + acertos + " de " + questoes.length + " questões.";
  textoMensagemFinal.textContent = escolherMensagemFinal();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function refazerQuiz() {
  questaoAtual = 0;
  acertos = 0;

  limparTudo();

  caixaResultado.hidden = true;
  caixaQuiz.hidden = false;
  mostrarQuestao();
}


function iniciar() {
  if (questoes.length == 0) {
    textoProgresso.textContent = "Nenhuma questão encontrada.";
    return;
  }

  caixaQuiz.addEventListener("change", responderQuestao);
  botaoProxima.addEventListener("click", irParaProxima);
  botaoRefazer.addEventListener("click", refazerQuiz);

  prepararAlternativas();
  mostrarQuestao();
}


iniciar();
