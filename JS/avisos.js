const perguntas = document.querySelectorAll(".aviso-pergunta");

perguntas.forEach((pergunta) => {
    pergunta.addEventListener("click", () => {
        const item = pergunta.closest(".aviso-item");
        const respostaId = pergunta.getAttribute("aria-controls");
        const resposta = document.getElementById(respostaId);
        const estaAberto = pergunta.getAttribute("aria-expanded")
            === "true";

        // Fecha todas as perguntas abertas
        perguntas.forEach((outraPergunta) => {
            const outroId = outraPergunta.getAttribute("aria-controls");
            const outraResposta = document.getElementById(outroId);

            outraPergunta.setAttribute("aria-expanded", "false");
            outraResposta.hidden = true;
            outraPergunta.closest(".aviso-item")
                .classList.remove("ativo");
        });

        // Abre a pergunta clicada, se estava fechada
        if (!estaAberto) {
            pergunta.setAttribute("aria-expanded", "true");
            resposta.hidden = false;
            item.classList.add("ativo");
        }
    });
});