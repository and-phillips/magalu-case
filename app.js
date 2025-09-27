// Dados da aplicação baseados no JSON fornecido
const appData = {
    criterios: [
        { nome: "custo", label: "Custo de Implantação", peso: 0.20, salvador: 85, recife: 70 },
        { nome: "acessibilidade", label: "Acessibilidade Logística", peso: 0.20, salvador: 78, recife: 72 },
        { nome: "mercado-local", label: "Potencial de Mercado Local", peso: 0.15, salvador: 95, recife: 88 },
        { nome: "crescimento", label: "Crescimento Futuro", peso: 0.10, salvador: 82, recife: 78 },
        { nome: "incentivos", label: "Incentivos Fiscais", peso: 0.10, salvador: 90, recife: 65 },
        { nome: "infraestrutura", label: "Infraestrutura Disponível", peso: 0.10, salvador: 75, recife: 80 },
        { nome: "populacao", label: "População Atendida 24h", peso: 0.10, salvador: 85, recife: 75 },
        { nome: "pib-estados", label: "PIB dos Estados Próximos", peso: 0.05, salvador: 88, recife: 82 }
    ],
    financeiro: {
        salvador: {
            investimento: 46,
            roi: 91.3,
            payback: 1.1,
            vpl: 42
        },
        recife: {
            investimento: 54,
            roi: 62.2,
            payback: 1.6,
            vpl: 34
        }
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initTabNavigation();
    initMatrizDecisao();
    initFinancialChart();
    updateMainKPIs();
});

// Sistema de navegação por abas
function initTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class de todos os botões e conteúdos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Adiciona active class ao botão clicado e conteúdo correspondente
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Matriz de decisão interativa
function initMatrizDecisao() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
        // Configura valores iniciais
        const criterio = appData.criterios.find(c => c.nome === slider.id);
        if (criterio) {
            slider.value = criterio.peso * 100;
            updateWeightDisplay(slider);
        }
        
        // Adiciona event listener para mudanças
        slider.addEventListener('input', function() {
            updateWeightDisplay(this);
            updateScores();
            updateTotalWeight();
            updateMainKPIs(); // Atualiza também os KPIs principais
        });
    });
    
    // Calcula scores iniciais
    updateScores();
    updateTotalWeight();
}

function updateWeightDisplay(slider) {
    const weightDisplay = slider.parentElement.querySelector('.weight-display');
    weightDisplay.textContent = slider.value + '%';
}

function calculateCurrentScores() {
    let salvadorScore = 0;
    let recifeScore = 0;
    let totalWeight = 0;
    
    appData.criterios.forEach(criterio => {
        const slider = document.getElementById(criterio.nome);
        if (slider) {
            const peso = parseFloat(slider.value) / 100;
            totalWeight += peso;
            salvadorScore += criterio.salvador * peso;
            recifeScore += criterio.recife * peso;
        }
    });
    
    // Normaliza os scores se o peso total for diferente de 1
    if (totalWeight > 0) {
        salvadorScore = salvadorScore / totalWeight;
        recifeScore = recifeScore / totalWeight;
    }
    
    return {
        salvador: salvadorScore,
        recife: recifeScore,
        totalWeight: totalWeight
    };
}

function updateScores() {
    const scores = calculateCurrentScores();
    
    // Atualiza a exibição dos scores na matriz
    const salvadorScoreElement = document.getElementById('salvador-score');
    const recifeScoreElement = document.getElementById('recife-score');
    
    if (salvadorScoreElement && recifeScoreElement) {
        salvadorScoreElement.textContent = scores.salvador.toFixed(2);
        recifeScoreElement.textContent = scores.recife.toFixed(2);
        
        // Atualiza as bordas dos cards baseado no vencedor
        const salvadorCard = salvadorScoreElement.closest('.result-card');
        const recifeCard = recifeScoreElement.closest('.result-card');
        
        if (scores.salvador > scores.recife) {
            salvadorCard.style.borderColor = 'var(--magalu-blue)';
            salvadorCard.style.borderWidth = '3px';
            recifeCard.style.borderColor = 'var(--color-border)';
            recifeCard.style.borderWidth = '2px';
        } else {
            recifeCard.style.borderColor = 'var(--magalu-orange)';
            recifeCard.style.borderWidth = '3px';
            salvadorCard.style.borderColor = 'var(--color-border)';
            salvadorCard.style.borderWidth = '2px';
        }
    }
}

function updateMainKPIs() {
    const scores = calculateCurrentScores();
    const vantagem = ((scores.salvador - scores.recife) / scores.recife * 100);
    
    // Atualiza o score principal no KPI
    const mainScoreElements = document.querySelectorAll('.kpi-card');
    if (mainScoreElements.length >= 4) {
        const scoreKPI = mainScoreElements[3]; // Quarto KPI é o score
        const scoreValue = scoreKPI.querySelector('.kpi-value');
        const scoreComparison = scoreKPI.querySelector('.kpi-comparison');
        
        if (scoreValue && scoreComparison) {
            scoreValue.textContent = scores.salvador.toFixed(2);
            scoreComparison.textContent = `${vantagem.toFixed(1)}% superior`;
        }
    }
    
    // Atualiza a vantagem percentual no resumo executivo
    const advantageElement = document.querySelector('.advantage');
    if (advantageElement) {
        advantageElement.textContent = `${vantagem.toFixed(1)}% de vantagem`;
    }
    
    // Atualiza recomendação se necessário
    const cityNameElement = document.querySelector('.city-name');
    if (cityNameElement) {
        if (scores.salvador > scores.recife) {
            cityNameElement.textContent = 'Salvador';
            cityNameElement.style.background = 'var(--magalu-light-blue)';
            cityNameElement.style.color = 'var(--magalu-blue)';
        } else {
            cityNameElement.textContent = 'Recife';
            cityNameElement.style.background = 'var(--magalu-light-orange)';
            cityNameElement.style.color = 'var(--magalu-orange)';
        }
    }
}

function updateTotalWeight() {
    let totalWeight = 0;
    
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        totalWeight += parseFloat(slider.value);
    });
    
    const totalWeightDisplay = document.getElementById('total-weight');
    if (totalWeightDisplay) {
        totalWeightDisplay.textContent = totalWeight.toFixed(0) + '%';
        
        // Muda a cor se não for 100%
        const parentElement = totalWeightDisplay.parentElement;
        if (Math.abs(totalWeight - 100) > 0.1) { // Tolerância para arredondamento
            totalWeightDisplay.style.color = 'var(--color-warning)';
            parentElement.style.background = 'var(--color-bg-4)';
        } else {
            totalWeightDisplay.style.color = 'var(--color-success)';
            parentElement.style.background = 'var(--color-bg-3)';
        }
    }
}

// Gráfico financeiro usando Chart.js
function initFinancialChart() {
    const ctx = document.getElementById('roiChart');
    if (!ctx) return;
    
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Investimento Inicial (R$ M)', 'ROI 5 anos (%)', 'Payback (anos)', 'VPL (R$ M)'],
            datasets: [{
                label: 'Salvador',
                data: [
                    appData.financeiro.salvador.investimento,
                    appData.financeiro.salvador.roi,
                    appData.financeiro.salvador.payback,
                    appData.financeiro.salvador.vpl
                ],
                backgroundColor: '#1FB8CD',
                borderColor: '#1FB8CD',
                borderWidth: 1
            }, {
                label: 'Recife',
                data: [
                    appData.financeiro.recife.investimento,
                    appData.financeiro.recife.roi,
                    appData.financeiro.recife.payback,
                    appData.financeiro.recife.vpl
                ],
                backgroundColor: '#FFC185',
                borderColor: '#FFC185',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Comparação Financeira: Salvador vs Recife',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Valores'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Métricas Financeiras'
                    }
                }
            },
            elements: {
                bar: {
                    borderRadius: 4
                }
            }
        }
    });
}

// Função para resetar a matriz de decisão para valores padrão
function resetMatriz() {
    appData.criterios.forEach(criterio => {
        const slider = document.getElementById(criterio.nome);
        if (slider) {
            slider.value = criterio.peso * 100;
            updateWeightDisplay(slider);
        }
    });
    updateScores();
    updateTotalWeight();
    updateMainKPIs();
}

// Função para aplicar preset de cenários
function applyScenario(scenarioName) {
    let weights = {};
    
    switch(scenarioName) {
        case 'custo-foco':
            weights = {
                'custo': 40,
                'acessibilidade': 15,
                'mercado-local': 10,
                'crescimento': 5,
                'incentivos': 15,
                'infraestrutura': 10,
                'populacao': 3,
                'pib-estados': 2
            };
            break;
        case 'logistica-foco':
            weights = {
                'custo': 15,
                'acessibilidade': 35,
                'mercado-local': 10,
                'crescimento': 5,
                'incentivos': 5,
                'infraestrutura': 15,
                'populacao': 10,
                'pib-estados': 5
            };
            break;
        case 'mercado-foco':
            weights = {
                'custo': 10,
                'acessibilidade': 15,
                'mercado-local': 30,
                'crescimento': 20,
                'incentivos': 5,
                'infraestrutura': 5,
                'populacao': 10,
                'pib-estados': 5
            };
            break;
        default:
            // Valores padrão
            appData.criterios.forEach(criterio => {
                weights[criterio.nome] = criterio.peso * 100;
            });
    }
    
    // Aplica os pesos
    Object.keys(weights).forEach(key => {
        const slider = document.getElementById(key);
        if (slider) {
            slider.value = weights[key];
            updateWeightDisplay(slider);
        }
    });
    
    updateScores();
    updateTotalWeight();
    updateMainKPIs();
}

// Adiciona botões para cenários pré-definidos
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se estamos na aba da matriz de decisão
    const matrizTab = document.getElementById('matriz');
    if (matrizTab) {
        // Cria container para botões de cenário
        const scenarioContainer = document.createElement('div');
        scenarioContainer.className = 'scenario-buttons';
        scenarioContainer.innerHTML = `
            <div style="text-align: center; margin: 24px 0;">
                <h4 style="margin-bottom: 16px; color: var(--color-text);">Cenários Pré-definidos:</h4>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn--secondary btn--sm" onclick="resetMatriz()">Padrão</button>
                    <button class="btn btn--secondary btn--sm" onclick="applyScenario('custo-foco')">Foco em Custo</button>
                    <button class="btn btn--secondary btn--sm" onclick="applyScenario('logistica-foco')">Foco em Logística</button>
                    <button class="btn btn--secondary btn--sm" onclick="applyScenario('mercado-foco')">Foco em Mercado</button>
                </div>
            </div>
        `;
        
        // Insere os botões após a descrição
        const description = matrizTab.querySelector('.description');
        if (description) {
            description.parentNode.insertBefore(scenarioContainer, description.nextSibling);
        }
    }
});

// Função de utilidade para formatar números
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value * 1000000);
}

function formatPercentage(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
}

// Adiciona tooltips informativos para melhorar a UX
function addTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            showTooltip(this, this.getAttribute('data-tooltip'));
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--color-charcoal-800);
        color: var(--color-white);
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        pointer-events: none;
        max-width: 200px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Animações suaves para transições de aba
function smoothTabTransition() {
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabContents.forEach(content => {
        content.style.transition = 'opacity 0.3s ease-in-out';
    });
}

// Função para exportar resultados (funcionalidade adicional)
function exportResults() {
    const results = {
        timestamp: new Date().toISOString(),
        recomendacao: document.querySelector('.city-name').textContent,
        scores: calculateCurrentScores(),
        pesos: {}
    };
    
    // Coleta pesos atuais
    appData.criterios.forEach(criterio => {
        const slider = document.getElementById(criterio.nome);
        if (slider) {
            results.pesos[criterio.label] = parseFloat(slider.value);
        }
    });
    
    // Cria download do JSON
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analise_cd_nordeste_magalu.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Inicialização de funcionalidades adicionais
document.addEventListener('DOMContentLoaded', function() {
    smoothTabTransition();
    addTooltips();
    
    // Adiciona botão de exportação se necessário
    const metodologiaTab = document.getElementById('metodologia');
    if (metodologiaTab) {
        const exportButton = document.createElement('div');
        exportButton.innerHTML = `
            <div style="text-align: center; margin-top: 24px;">
                <button class="btn btn--primary" onclick="exportResults()">
                    Exportar Resultados da Análise
                </button>
            </div>
        `;
        metodologiaTab.querySelector('.content-section').appendChild(exportButton);
    }
});