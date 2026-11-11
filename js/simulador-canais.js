// Simulador de canais: compara frequência fixa x salto entre 4 canais.
function simular() {
    const interferido = Number(
        document.getElementById("interferencia").value
    );

    const canais = [1, 2, 3, 4];
    const total = 20;

    let recebidasFixo = 0;
    let recebidasSalto = 0;

    const areaCanais = document.getElementById("canais");
    areaCanais.innerHTML = "";

    canais.forEach(canal => {
        const elemento = document.createElement("span");

        elemento.className = "canal";
        elemento.textContent = "Canal " + canal;

        if (canal === interferido) {
            elemento.classList.add("ativo");
        }

        areaCanais.appendChild(elemento);
    });

    // Sistema A: todas as mensagens usam o canal 1.
    for (let i = 0; i < total; i++) {
        if (1 !== interferido) {
            recebidasFixo++;
        }
    }

    // Sistema B: alterna entre os quatro canais.
    for (let i = 0; i < total; i++) {
        const canalAtual = canais[i % canais.length];

        if (canalAtual !== interferido) {
            recebidasSalto++;
        }
    }

    const taxaFixa = recebidasFixo / total * 100;
    const taxaSalto = recebidasSalto / total * 100;

    document.getElementById("fixo").textContent =
        taxaFixa + "% (" + recebidasFixo + "/" + total + ")";

    document.getElementById("salto").textContent =
        taxaSalto + "% (" + recebidasSalto + "/" + total + ")";

    document.getElementById("barraFixa").style.width =
        taxaFixa + "%";

    document.getElementById("barraSalto").style.width =
        taxaSalto + "%";

    document.getElementById("mensagem").textContent =
        "O canal " + interferido + " está com interferência.";

    document.getElementById("detalhes").innerHTML =
        "Mensagens perdidas na frequência fixa: " +
        (total - recebidasFixo) +
        "<br>Mensagens perdidas no salto de frequência: " +
        (total - recebidasSalto);
}

document.getElementById("botao-simular").addEventListener("click", simular);
