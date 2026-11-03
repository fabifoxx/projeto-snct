const questoes = document.querySelectorAll(".questao");

const tituloPagina = document.getElementById("titulo");
const caixaQuiz = document.getElementById("quiz");
const textoProgresso = document.getElementById("progresso");
const textoFeedback = document.getElementById("feedback");
const caixaResultado = document.getElementById("resultado");
const textoPontuacao = document.getElementById("pontuacao");

const botaoConfirmar = document.getElementById("botao-confirmar");
const botaoProxima = document.getElementById("botao-proxima");
const botaoRefazer = document.getElementById("botao-refazer");

let questaoAtual = 0;
let acertos = 0;


function prepararAlternativas() {
  for (let i = 0; i < questoes.length; i++) {
    const alternativas = questoes[i].querySelectorAll("input");

    for (let j = 0; j < alternativas.length; j++) {
      const letra = String.fromCharCode(65 + j);

      alternativas[j].name = "questao" + (i + 1);
      alternativas[j].value = letra;
      alternativas[j].after(" " + letra + ") ");
    }
  }
}

function mostrarQuestao() {
  for (let i = 0; i < questoes.length; i++) {
    questoes[i].hidden = true;
  }
  questoes[questaoAtual].hidden = false;

  tituloPagina.hidden = questaoAtual != 0;
  textoProgresso.textContent =
    "Questão " + (questaoAtual + 1) + " de " + questoes.length;
  textoFeedback.textContent = "";
  textoFeedback.className = "";

  botaoConfirmar.hidden = false;
  botaoProxima.hidden = true;
}

function travarAlternativas(questao) {
  const alternativas = questao.querySelectorAll("input");

  for (let i = 0; i < alternativas.length; i++) {
    alternativas[i].disabled = true;
  }
}

function limparTudo() {
  const alternativas = document.querySelectorAll("input");
  for (let i = 0; i < alternativas.length; i++) {
    alternativas[i].checked = false;
    alternativas[i].disabled = false;
  }

  const justificativas = document.querySelectorAll(".justificativa");
  for (let i = 0; i < justificativas.length; i++) {
    justificativas[i].hidden = true;
  }
}


function confirmarResposta() {
  const questao = questoes[questaoAtual];
  const marcada = questao.querySelector("input:checked");

  if (marcada == null) {
    textoFeedback.textContent = "Escolha uma alternativa antes de confirmar.";
    return;
  }

  const letraCerta = (questao.dataset.correta || "").toUpperCase();

  if (marcada.value == letraCerta) {
    acertos++;
    textoFeedback.textContent = "Correto!";
    textoFeedback.className = "certo";
  } else {
    textoFeedback.textContent =
      "Errado. A resposta certa é a " + letraCerta + ".";
    textoFeedback.className = "errado";
  }

  const justificativa = questao.querySelector(".justificativa");
  if (justificativa != null) {
    justificativa.hidden = false;
  }

  travarAlternativas(questao);

  botaoConfirmar.hidden = true;
  botaoProxima.hidden = false;

  if (questaoAtual == questoes.length - 1) {
    botaoProxima.textContent = "Ver resultado";
  } else {
    botaoProxima.textContent = "Próxima";
  }
}

function irParaProxima() {
  questaoAtual++;

  if (questaoAtual < questoes.length) {
    mostrarQuestao();
    return;
  }

  caixaQuiz.hidden = true;
  caixaResultado.hidden = false;
  textoPontuacao.textContent =
    "Você acertou " + acertos + " de " + questoes.length + " questões.";
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
    botaoConfirmar.hidden = true;
    return;
  }

  botaoConfirmar.addEventListener("click", confirmarResposta);
  botaoProxima.addEventListener("click", irParaProxima);
  botaoRefazer.addEventListener("click", refazerQuiz);

  prepararAlternativas();
  mostrarQuestao();
}


iniciar();
