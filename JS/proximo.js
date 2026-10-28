(function () {
    const datasEspeciais = [
        "01-01",
        "21-04",
        "01-05",
        "31-05",
        "13-06",
        "07-09",
        "12-10",
        "02-11",
        "15-11",
        "20-11",
        "25-12"
    ];

    const dayGroupOrder = [
        { title: 'DIAS ÚTEIS', days: [1, 2, 3, 4, 5] },
        { title: 'SÁBADOS', days: [6] },
        { title: 'DOMINGOS E FERIADOS', days: [0] }
    ];

    function isDataEspecial(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${day}-${month}`;
        return datasEspeciais.includes(dateString);
    }

    function getGroupTitleForDate(date) {
        if (isDataEspecial(date)) {
            return 'DOMINGOS E FERIADOS';
        }
        const day = date.getDay();
        const match = dayGroupOrder.find((group) => group.days.includes(day));
        return match ? match.title : 'DIAS ÚTEIS';
    }

    function getSchedulesForDirection(groupTitle, directionLabel) {
        const headings = Array.from(document.querySelectorAll('.lista-horarios > h3'));
        const heading = headings.find((element) => {
            const title = element.textContent.trim().toLowerCase();
            const normalizedGroup = groupTitle.toLowerCase();
            const normalizedDirection = directionLabel.toLowerCase().replace('saída', 'saídas');
            return title.includes(normalizedGroup) && title.includes(normalizedDirection);
        });

        if (!heading) {
            return [];
        }

        const grade = heading.nextElementSibling;
        if (!grade || !grade.classList.contains('grade-horarios')) {
            return [];
        }

        return Array.from(grade.querySelectorAll('div'))
            .map((item) => item.textContent.trim())
            .filter((value) => /^\d{2}:\d{2}$/.test(value));
    }

    function getNextDeparture(directionLabel, now) {
        const is607Page = document.title === '607';
        const groupTitle = getGroupTitleForDate(now);

        if (is607Page && groupTitle === 'DOMINGOS E FERIADOS') {
            const hasSchedule = getSchedulesForDirection(groupTitle, directionLabel).length > 0;
            return hasSchedule ? '00:00' : '-- : --';
        }

        let bestCandidate = '-- : --';
        let bestDate = null;

        for (let offset = 0; offset < 8; offset += 1) {
            const candidateDate = new Date(now);
            candidateDate.setDate(now.getDate() + offset);
            candidateDate.setHours(0, 0, 0, 0);

            const currentGroupTitle = getGroupTitleForDate(candidateDate);
            const schedules = getSchedulesForDirection(currentGroupTitle, directionLabel);

            schedules.forEach((timeValue) => {
                const [hours, minutes] = timeValue.split(':').map(Number);
                const departureDate = new Date(candidateDate);
                departureDate.setHours(hours, minutes, 0, 0);

                const isToday = offset === 0;
                if (isToday) {
                    const departureTimeInMinutes = Math.floor(departureDate.getTime() / 60000);
                    const nowTimeInMinutes = Math.floor(now.getTime() / 60000);
                    if (departureTimeInMinutes < nowTimeInMinutes) {
                        return;
                    }
                }

                if (bestDate === null || departureDate.getTime() < bestDate) {
                    bestDate = departureDate.getTime();
                    bestCandidate = timeValue;
                }
            });

            if (bestDate !== null) {
                break;
            }
        }

        return bestCandidate;
    }

    function atualizarProximosHorarios() {
        const cards = Array.from(document.querySelectorAll('.proximo .card p'));
        const now = new Date();

        if (cards.length >= 2) {
            cards[0].textContent = getNextDeparture('Saída do Bairro', now);
            cards[1].textContent = getNextDeparture('Saída do Centro', now);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', atualizarProximosHorarios);
    } else {
        atualizarProximosHorarios();
    }

    setInterval(atualizarProximosHorarios, 30000);
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swPath = window.location.pathname.includes("/HTML/") ? "../sw.js" : "./sw.js";

    navigator.serviceWorker
      .register(swPath)
      .catch((erro) => {
        console.error("Erro ao registrar o service worker:", erro);
      });
  });
}
