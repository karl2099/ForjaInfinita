// Estado de navegação do tutorial
let etapaAtual = 0;
const totalEtapasCriacao = 9; // 0..9

// Flags de ciclo de vida
let modoCriacaoFinalizado = false;
let dinheiroCalculadoPelaUltimaVez = false;

/* ===== BRIDGE: database3dt.module.js → aliases da Rev30 ===== */
(function(){
  // banco vindo do <script type="module"> no index
  const db = (window.database3dt ?? {});

  // mapeia nomes esperados pelo seu criacao.js
  window.todasAsVantagens        = window.todasAsVantagens        || db.vantagens        || db.listaVantagens        || [];
  window.todasAsDesvantagens     = window.todasAsDesvantagens     || db.desvantagens     || db.listaDesvantagens     || [];
  window.todasAsPericias         = window.todasAsPericias         || db.pericias         || db.listaPericias         || [];
  window.todasAsMagias           = window.todasAsMagias           || db.magias           || db.listaMagias           || [];
  window.todasAsVantagensUnicas  = window.todasAsVantagensUnicas  || db.vantagensUnicas  || db.listaVantagensUnicas  || [];

  // Elementos/Escolas para "Elementalista"
  window.elementosMagiaElemental = window.elementosMagiaElemental 
    || db.elementosMagiaElemental 
    || db.elementos 
    || db.escolasElementais 
    || [
      // fallback seguro (caso o DB ainda não tenha): mantém a UI viva
      { id: "fogo",   nome: "Fogo"   },
      { id: "agua",   nome: "Água"   },
      { id: "terra",  nome: "Terra"  },
      { id: "ar",     nome: "Ar"     },
      { id: "luz",    nome: "Luz"    },
      { id: "trevas", nome: "Trevas" }
    ];

  // garante compat clássica (algumas funções usam "database3dt" direto)
  window.database3dt = db;
})();

// Objeto principal do personagem
console.log("⚙️ Iniciando criação do personagem...");
console.log("Técnicas de Ataque Especial criadas:", window.tecnicasAtaqueEspecialCriadas);
const personagem = {
    nome: "",
    pontuacaoInicial: 0,
    limiteDesvantagens: 0,
    pontosGastosCaracteristicas: 0,
    pontosGastosVantagensVUPericias: 0,
    pontosDesvantagensConcedidos: 0,
    conceito: "",
    caracteristicas: { F: 0, H: 0, R: 0, A: 0, PdF: 0 },
    caracteristicasBase: { F: 0, H: 0, R: 0, A: 0, PdF: 0 },
    pvs: 0,
	pvMax: 0,
    pms: 0,
	pmMax: 0,
	vantagensSelecionadas: [],
    desvantagensSelecionadas: [],
    vantagemUnicaSelecionada: null,
    custoVantagemUnica: 0,
    vantagemUnicaAnterior: null,
    magiasConhecidas: [],
    magiaGratisElfoNegro: null,
    elementalistaEscolhidos: [],
    ataqueEspecialConfig: { forca: null, pdf: null },
    periciasCompletas: [],
    especializacoesSelecionadas: [],
    dinheiroNumerico: 0,
    dinheiroTexto: "(Informe o resultado do dado e clique em calcular)",
    pertencesPessoais: "",
    pontosExperienciaAtuais: 0,
    pontosExperienciaTotalAdquiridos: 0,
    vantagensCompradasMultiplas: {},

    // CAMPOS ADICIONADOS PARA ITENS
    vantagensDeItens: {},
    desvantagensDeItens: {},
    periciasDeItens: {},
    magiasDeItens: {},
	ataqueEspecialDeItens: {}
};
// --- ELEMENTOS DO DOM (Cache) ---
const elNomePersonagem = document.getElementById('nomePersonagem');
const elPontuacaoInicial = document.getElementById('pontuacaoInicial');
const elConceitoPersonagem = document.getElementById('conceitoPersonagem');
const elSumarioPontuacaoInicial = document.getElementById('sumario-pontuacao-inicial');
const elSumarioPontosGastosCarac = document.getElementById('sumario-pontos-gastos-carac');
const elSumarioPontosGastosVant = document.getElementById('sumario-pontos-gastos-vant');
const elSumarioPontosDesvantagens = document.getElementById('sumario-pontos-desvantagens');
const elSumarioPontosRestantes = document.getElementById('sumario-pontos-restantes');
const btnAnterior = document.getElementById('btnAnterior');
const btnProximo = document.getElementById('btnProximo');
const selectsCaracteristicas = document.querySelectorAll('#etapa-3 .caracteristicas-grid select'); 
const displayPVs = document.getElementById('display-pvs');
const displayPMs = document.getElementById('display-pms');
const listaVantagensContainer = document.getElementById('lista-vantagens-container');
const listaDesvantagensContainer = document.getElementById('lista-desvantagens-container');
const avisoLimiteDesvantagens = document.getElementById('aviso-limite-desvantagens');
const globalTooltipContainer = document.getElementById('global-tooltip-container');
const listaVantagensUnicasContainer = document.getElementById('lista-vantagens-unicas-container');
const subEscolhaVUContainer = document.getElementById('sub-escolha-vu-container'); 
const subEscolhaVantagemContainer = document.getElementById('sub-escolha-vantagem-container'); 
const radioHumano = document.getElementById('vu-humano');
const listaPericiasContainer = document.getElementById('lista-pericias-container');
const contadorEspecAvulsas = document.getElementById('contador-espec-avulsas');
const custoEspecAvulsas = document.getElementById('custo-espec-avulsas');
const inputDadoDinheiro = document.getElementById('input-dado-dinheiro');
const moedasIniciaisDisplay = document.getElementById('moedas-iniciais-display');
const pertencesPessoaisTextarea = document.getElementById('pertences-pessoais');
const elDivSumarioPontos = document.querySelector('.sumario-pontos');

// --- FUNÇÕES DE LÓGICA DE CÁLCULO E ESTADO ---
function calcularCustoTotalAgregado() { return personagem.pontosGastosCaracteristicas + personagem.pontosGastosVantagensVUPericias; }
function aplicarVantagemUnica(vuId) {
    // ... (código completo da função como fornecido anteriormente) ...
    // Remover vantagens/desvantagens da VU anterior
    if (personagem.vantagemUnicaAnterior) {
        const vuObjAnterior = todasAsVantagensUnicas.find(vu => vu.id === personagem.vantagemUnicaAnterior.id);
        if (vuObjAnterior) {
            if (vuObjAnterior.vantagensEmbutidas) {
                vuObjAnterior.vantagensEmbutidas.forEach(idVant => {
                    if (!personagem.vantagensCompradasMultiplas[idVant] || personagem.vantagensCompradasMultiplas[idVant] === 0) {
                        const index = personagem.vantagensSelecionadas.indexOf(idVant);
                        if (index > -1) personagem.vantagensSelecionadas.splice(index, 1);
                    }
                });
            }
            if (vuObjAnterior.desvantagensEmbutidas) {
                vuObjAnterior.desvantagensEmbutidas.forEach(idDesvant => {
                    const index = personagem.desvantagensSelecionadas.indexOf(idDesvant);
                    if (index > -1) personagem.desvantagensSelecionadas.splice(index, 1);
                });
            }
        }
    }
    
    if (personagem.vantagemUnicaAnterior && personagem.vantagemUnicaAnterior.id === 'elfo_negro' && personagem.magiaGratisElfoNegro) {
        const index = personagem.vantagensSelecionadas.indexOf(personagem.magiaGratisElfoNegro);
        if (index > -1 && (!personagem.vantagensCompradasMultiplas[personagem.magiaGratisElfoNegro] || personagem.vantagensCompradasMultiplas[personagem.magiaGratisElfoNegro] === 0) ) {
             personagem.vantagensSelecionadas.splice(index, 1);
        }
        personagem.magiaGratisElfoNegro = null;
    }
    if (personagem.vantagemUnicaAnterior && personagem.vantagemUnicaAnterior.id === 'elfo') {
        // A lógica para remover 'elementalista' é complexa devido à aptidão,
        // vamos garantir que seja reavaliado e o custo ajustado em atualizarSumarioPontos
        personagem.elementalistaEscolhidos = []; 
    }

    personagem.vantagemUnicaSelecionada = todasAsVantagensUnicas.find(v => v.id === vuId) || null;
    if (personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.id === 'humano') {
        personagem.vantagemUnicaSelecionada = null; 
    }

    personagem.custoVantagemUnica = personagem.vantagemUnicaSelecionada ? (personagem.vantagemUnicaSelecionada.custo || 0) : 0;

    if (personagem.vantagemUnicaSelecionada) {
        const vuNova = personagem.vantagemUnicaSelecionada;
        if (vuNova.vantagensEmbutidas) {
            vuNova.vantagensEmbutidas.forEach(idVant => {
                if (!personagem.vantagensSelecionadas.includes(idVant)) {
                    personagem.vantagensSelecionadas.push(idVant);
                }
            });
        }
        if (vuNova.desvantagensEmbutidas) {
            vuNova.desvantagensEmbutidas.forEach(idDesvant => {
                if (!personagem.desvantagensSelecionadas.includes(idDesvant)) {
                    personagem.desvantagensSelecionadas.push(idDesvant);
                }
            });
        }
        if (vuNova.id === 'elfo' && personagem.vantagensSelecionadas.includes('elementalista')) {
             personagem.elementalistaEscolhidos = elementosMagiaElemental.map(e => e.id);
        }
    }
    
    personagem.vantagemUnicaAnterior = personagem.vantagemUnicaSelecionada; 
    _atualizarCaracteristicasEfetivasEDisplay(); // Deve estar definida antes
    renderizarSubEscolhasVU(); // Deve estar definida antes
    
    if (listaVantagensContainer) renderizarListaHabilidades(listaVantagensContainer, todasAsVantagens, 'vant', 'custo', personagem.vantagensSelecionadas); // renderizarListaHabilidades deve estar definida antes
    if (listaDesvantagensContainer) renderizarListaHabilidades(listaDesvantagensContainer, todasAsDesvantagens, 'desvant', 'pontosConcedidos', personagem.desvantagensSelecionadas);
    if (listaPericiasContainer) renderizarPericias(); // renderizarPericias deve estar definida antes

    atualizarSumarioPontos(); // Deve estar definida antes
}
function definirLimiteDesvantagens() { 
    switch(personagem.pontuacaoInicial){
        case 5: personagem.limiteDesvantagens = 3; break;
        case 7: personagem.limiteDesvantagens = 4; break;
        case 10: personagem.limiteDesvantagens = 5; break;
        case 12: personagem.limiteDesvantagens = 6; break;
        default: personagem.limiteDesvantagens = (personagem.pontuacaoInicial > 0) ? Math.floor(personagem.pontuacaoInicial / 2) : 0;
    }
}

function getEscolasMagiaDoPersonagem() {
    const escolas = new Set();
    if (personagem.vantagensSelecionadas.includes('magia_branca') || (personagem.magiaGratisElfoNegro === 'magia_branca')) escolas.add('branca');
    if (personagem.vantagensSelecionadas.includes('magia_negra') || (personagem.magiaGratisElfoNegro === 'magia_negra')) escolas.add('negra');
    
    const temElemental = personagem.vantagensSelecionadas.includes('magia_elemental');
    const temArcano = personagem.vantagensSelecionadas.includes('arcano');

    if (temArcano) { 
        elementosMagiaElemental.forEach(el => escolas.add(`elemental_${el.id}`));
        escolas.add('branca'); 
        escolas.add('negra');
    } else if (temElemental) {
        if (personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.id === 'elfo' && personagem.vantagensSelecionadas.includes('elementalista')) {
            elementosMagiaElemental.forEach(el => escolas.add(`elemental_${el.id}`));
        } else if (personagem.vantagensSelecionadas.includes('elementalista') && personagem.elementalistaEscolhidos.length > 0) {
            personagem.elementalistaEscolhidos.forEach(elId => escolas.add(`elemental_${elId}`));
        } else if (!personagem.vantagensSelecionadas.includes('elementalista')) { 
             elementosMagiaElemental.forEach(el => escolas.add(`elemental_${el.id}`));
        }
    }
    return Array.from(escolas);
}

function _atualizarCaracteristicasEfetivasEDisplay() {
    for (const caracNome in personagem.caracteristicasBase) {
        let valorBase = personagem.caracteristicasBase[caracNome];
        let bonusVU = 0;
        let nomeVU = "";
        if (personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.modificadoresCaracteristicas &&
            personagem.vantagemUnicaSelecionada.modificadoresCaracteristicas[caracNome] !== undefined) {
            bonusVU = personagem.vantagemUnicaSelecionada.modificadoresCaracteristicas[caracNome];
            nomeVU = personagem.vantagemUnicaSelecionada.nome;
        }
        let valorEfetivo = valorBase + bonusVU;
        if (valorEfetivo < 0) valorEfetivo = 0;

        personagem.caracteristicas[caracNome] = valorEfetivo;

        const selectEl = document.getElementById(`carac-${caracNome.toLowerCase()}`);
        if (selectEl && selectEl.value !== valorBase.toString()) { 
            selectEl.value = valorBase;
        }
        const displayEfetivoEl = document.getElementById(`display-efetivo-${caracNome.toLowerCase()}`);
        if (displayEfetivoEl) {
            if (bonusVU !== 0) {
                displayEfetivoEl.textContent = `(Efetivo: ${valorEfetivo} [Base: ${valorBase}${bonusVU > 0 ? '+' : ''}${bonusVU} ${nomeVU ? 'de ' + nomeVU : ''}])`;
            } else {
                displayEfetivoEl.textContent = `(Efetivo: ${valorEfetivo})`;
            }
        }
        const custoEl = document.getElementById(`custo-${caracNome.toLowerCase()}`);
        if (custoEl) custoEl.textContent = valorBase; 
    }
}

function atualizarContadorEspecAvulsas() {
    let count = 0;
    if(personagem.especializacoesSelecionadas){
        personagem.especializacoesSelecionadas.forEach(efId => { 
            const pPaiId = efId.split('_')[0]; 
            if (!personagem.periciasCompletas.includes(pPaiId)) count++; 
        });
    }
    if(contadorEspecAvulsas) contadorEspecAvulsas.textContent = count;
    const custo = Math.floor(count / 3);
    if(custoEspecAvulsas) custoEspecAvulsas.textContent = custo;
}

// --- FUNÇÕES DE RENDERIZAÇÃO DA UI ---

function handleSelecaoPericiaCompleta(checkbox, pericia) {
    const periciaId = pericia.id;
    const especializacoesDaPericiaIds = (pericia.especializacoes || []).map(e => `${periciaId}_${e.id}`);
    if(checkbox.checked){
        if(!personagem.periciasCompletas.includes(periciaId)) personagem.periciasCompletas.push(periciaId);
        personagem.especializacoesSelecionadas = personagem.especializacoesSelecionadas.filter( especId => !especId.startsWith(periciaId + "_"));
        especializacoesDaPericiaIds.forEach(especFullId => {const chk=document.getElementById(`espec-${especFullId}`); if (chk){chk.checked=true; chk.disabled=true;}});
    } else {
        personagem.periciasCompletas = personagem.periciasCompletas.filter(id => id !== periciaId);
        especializacoesDaPericiaIds.forEach(especFullId => {const chk=document.getElementById(`espec-${especFullId}`); if (chk){chk.disabled=false; chk.checked=false;}});
    }
    atualizarContadorEspecAvulsas();
    atualizarSumarioPontos();
}

function handleSelecaoEspecializacao(checkbox, especFullId) {
    if(checkbox.checked){ if(!personagem.especializacoesSelecionadas.includes(especFullId)) personagem.especializacoesSelecionadas.push(especFullId); }
    else{ personagem.especializacoesSelecionadas = personagem.especializacoesSelecionadas.filter(id => id !== especFullId); }
    atualizarContadorEspecAvulsas();
    atualizarSumarioPontos();
}

function renderizarPericias() {
    console.log("Renderizando perícias...");
    if (!listaPericiasContainer) {
        console.error("Container de perícias não encontrado!");
        return; 
    }
    listaPericiasContainer.innerHTML = '';
    todasAsPericias.forEach(pericia => {
        const blocoPericia = document.createElement('div'); blocoPericia.classList.add('pericia-bloco');
        const nomeDiv = document.createElement('div'); nomeDiv.classList.add('nome-pericia');
        const nomeSpan = document.createElement('span'); nomeSpan.classList.add('tooltip'); 
        nomeSpan.textContent = pericia.nome; nomeSpan.dataset.descricao = pericia.descricao;
        nomeDiv.appendChild(nomeSpan);
        blocoPericia.appendChild(nomeDiv);
        
        const opcoesDiv = document.createElement('div'); opcoesDiv.classList.add('opcoes-pericia');
        const itemCompleta = document.createElement('div'); itemCompleta.classList.add('item-habilidade'); 
        
        const checkCompleta = document.createElement('input'); checkCompleta.type = 'checkbox'; 
        checkCompleta.id = `pericia-completa-${pericia.id}`; 
        checkCompleta.dataset.periciaId = pericia.id; 
        checkCompleta.checked = personagem.periciasCompletas.includes(pericia.id); 
        checkCompleta.addEventListener('change', (event) => { handleSelecaoPericiaCompleta(event.target, pericia); }); 
        
        const labelCompleta = document.createElement('label'); labelCompleta.htmlFor = `pericia-completa-${pericia.id}`; 
        labelCompleta.textContent = ` Comprar ${pericia.nome} Completa`; 
        
        const custoCompleta = document.createElement('span'); custoCompleta.classList.add('custo');
        let custoPericiaAtual = 2; 
        if (personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.aptidoes && 
            personagem.vantagemUnicaSelecionada.aptidoes.pericias && 
            personagem.vantagemUnicaSelecionada.aptidoes.pericias[pericia.id] !== undefined) {
            custoPericiaAtual = personagem.vantagemUnicaSelecionada.aptidoes.pericias[pericia.id];
        }
        custoCompleta.textContent = `(${custoPericiaAtual} Pt${custoPericiaAtual !== 1 ? 's' : ''})`;

        itemCompleta.appendChild(checkCompleta); itemCompleta.appendChild(labelCompleta); itemCompleta.appendChild(custoCompleta); 
        opcoesDiv.appendChild(itemCompleta);
        
        const especListaDiv = document.createElement('div'); especListaDiv.classList.add('especializacoes-lista'); 
        especListaDiv.id = `espec-lista-${pericia.id}`;
        if (pericia.especializacoes) {
            pericia.especializacoes.forEach(espec => {
                const itemEspec = document.createElement('div'); itemEspec.classList.add('item-habilidade');
                const checkEspec = document.createElement('input'); checkEspec.type = 'checkbox'; 
                const especFullId = `${pericia.id}_${espec.id}`; 
                checkEspec.id = `espec-${especFullId}`; 
                checkEspec.dataset.especId = especFullId; 
                checkEspec.dataset.periciaPaiId = pericia.id;
                checkEspec.checked = personagem.especializacoesSelecionadas.includes(especFullId) || personagem.periciasCompletas.includes(pericia.id);
                checkEspec.disabled = personagem.periciasCompletas.includes(pericia.id);
                checkEspec.addEventListener('change', (event) => { handleSelecaoEspecializacao(event.target, especFullId); });
                
                const labelEspec = document.createElement('label'); labelEspec.htmlFor = `espec-${especFullId}`;
                const nomeEspecSpan = document.createElement('span'); nomeEspecSpan.classList.add('tooltip'); 
                nomeEspecSpan.textContent = espec.nome; 
                nomeEspecSpan.dataset.descricao = espec.descricao || pericia.descricao;
                labelEspec.appendChild(nomeEspecSpan);
                
                itemEspec.appendChild(checkEspec); itemEspec.appendChild(labelEspec); 
                especListaDiv.appendChild(itemEspec);
            });
        }
        opcoesDiv.appendChild(especListaDiv); 
        blocoPericia.appendChild(opcoesDiv); 
        listaPericiasContainer.appendChild(blocoPericia);
    });
    atualizarContadorEspecAvulsas();
    aplicarTooltipsGlobais(); 
}

function renderizarListaHabilidades(container, listaItens, tipo, propPontos, arraySelecionados) {
    if (!container) return;
    container.innerHTML = ''; 
    
    const tiposVariaveisMultiplos = ["multiploVariavel", "multiplo", "porMembro", "porAliadoNivel", "porTipo", "porForma", "porParceiro", "porProtegido", "porCodigo", "gradual"]; 

    listaItens.forEach(item => {
        const divItemPrincipal = document.createElement('div'); 
        divItemPrincipal.classList.add('item-habilidade-wrapper'); 

        const divItem = document.createElement('div'); 
        divItem.classList.add('item-habilidade');
        
        const inputEl = document.createElement('input');
        inputEl.type = (tipo === 'vu') ? 'radio' : 'checkbox';
        if(tipo === 'vu') inputEl.name = 'vantagem_unica_radio';
        inputEl.id = `${tipo}-${item.id}`; 
        inputEl.value = item.id;
        
        let estaSelecionado = false;
        if(tipo === 'vu') {
            estaSelecionado = (personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.id === item.id) || (item.id === 'humano' && !personagem.vantagemUnicaSelecionada);
        } else {
            estaSelecionado = arraySelecionados.includes(item.id);
        }
        inputEl.checked = estaSelecionado;
        
        let embutidaPorVU = false;
        let tagVU = "";
        if (personagem.vantagemUnicaSelecionada && tipo !== 'vu') {
            const vu = personagem.vantagemUnicaSelecionada;
			const nomeDaVU = vu.nome || "Vantagem Única";
            if (tipo === 'vant') {
                if ((vu.vantagensEmbutidas && vu.vantagensEmbutidas.includes(item.id)) || 
                    (vu.id === 'elfo_negro' && item.id === personagem.magiaGratisElfoNegro)) {
                    inputEl.checked = true; inputEl.disabled = true; embutidaPorVU = true; 
                    if(!arraySelecionados.includes(item.id)) arraySelecionados.push(item.id);
                    tagVU = `(de ${nomeDaVU})`;
                }
            } else if (tipo === 'desvant' && vu.desvantagensEmbutidas && vu.desvantagensEmbutidas.includes(item.id)) { 
                inputEl.checked = true; inputEl.disabled = true; embutidaPorVU = true; 
                if(!arraySelecionados.includes(item.id)) arraySelecionados.push(item.id);
                tagVU = `(de ${nomeDaVU})`;
            }
        }

        const isTipoVariavelMultiplo = (tipo === 'vant' || tipo === 'desvant') && tiposVariaveisMultiplos.includes(item.tipoCusto);
        const isAtaqueEspecial = item.id === 'ataque_especial';
        const isElementalista = item.id === 'elementalista';

        if (!embutidaPorVU) {
            inputEl.addEventListener('change', (event) => {
                const itemId = item.id;
                const isChecked = event.target.checked;
                if (tipo === 'vu') { 
                    if(isChecked) aplicarVantagemUnica(itemId); 
                } else {
                    if (isChecked) {
                        if (!arraySelecionados.includes(itemId)) {
                            if (tipo === 'desvant') {
                                let ptsDesvantAtuais = 0;
                                personagem.desvantagensSelecionadas.forEach(idExist => {
                                    if (idExist === itemId) return; 
                                    const d = todasAsDesvantagens.find(dx => dx.id === idExist);
                                    let ehEmbutidaPelaVUAtual = false;
                                    if(personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.desvantagensEmbutidas && personagem.vantagemUnicaSelecionada.desvantagensEmbutidas.includes(idExist)) ehEmbutidaPelaVUAtual = true;
                                    if (d && !ehEmbutidaPelaVUAtual && d.pontosConcedidos) {
                                        ptsDesvantAtuais += ((d.tipoCusto === "porCodigo" || d.tipoCusto === "porProtegido") && personagem.vantagensCompradasMultiplas[idExist] > 0) ? (d.pontosConcedidos * personagem.vantagensCompradasMultiplas[idExist]) : d.pontosConcedidos;
                                    }
                                });
                                const ptsEstaDesvant = item.pontosConcedidos * ( (item.tipoCusto === "porCodigo" || item.tipoCusto === "porProtegido") ? 1 : 1); 
                                if(personagem.limiteDesvantagens > 0 && (ptsDesvantAtuais + ptsEstaDesvant) > personagem.limiteDesvantagens) {
                                    alert(`Limite de desvantagens (${personagem.limiteDesvantagens}) excedido. Tentando adicionar ${ptsEstaDesvant} com ${ptsDesvantAtuais} já existentes.`);
                                    event.target.checked = false;
                                    return;
                                }
                            }
                            arraySelecionados.push(itemId);
                            if (isTipoVariavelMultiplo && (!personagem.vantagensCompradasMultiplas[itemId] || personagem.vantagensCompradasMultiplas[itemId] === 0)) {
                                personagem.vantagensCompradasMultiplas[itemId] = 1; 
                            }
                            if (itemId === 'ataque_especial') {
                                if (!personagem.ataqueEspecialConfig.forca) personagem.ataqueEspecialConfig.forca = { ativo: false, modificadoresSelecionados: [], custoModificadoresPts: 0, custoTotalPMsParaUsar: 1 };
                                if (!personagem.ataqueEspecialConfig.pdf) personagem.ataqueEspecialConfig.pdf = { ativo: false, modificadoresSelecionados: [], custoModificadoresPts: 0, custoTotalPMsParaUsar: 1 };
                            }
                        }
                    } else { 
                        const index = arraySelecionados.indexOf(itemId); 
                        if (index > -1) arraySelecionados.splice(index, 1);
                        if (isTipoVariavelMultiplo) personagem.vantagensCompradasMultiplas[itemId] = 0; 
                        if (itemId === 'elementalista') personagem.elementalistaEscolhidos = [];
                        if (itemId === 'ataque_especial') { 
                            personagem.ataqueEspecialConfig.forca = null;
                            personagem.ataqueEspecialConfig.pdf = null;
                        }
                    }
                    if (container === listaVantagensContainer) renderizarListaHabilidades(listaVantagensContainer, todasAsVantagens, 'vant', 'custo', personagem.vantagensSelecionadas);
                    else if (container === listaDesvantagensContainer) renderizarListaHabilidades(listaDesvantagensContainer, todasAsDesvantagens, 'desvant', 'pontosConcedidos', personagem.desvantagensSelecionadas);
                    else if (container === listaVantagensUnicasContainer) renderizarListaHabilidades(listaVantagensUnicasContainer, todasAsVantagensUnicas, 'vu', 'custo', personagem.vantagemUnicaSelecionada ? [personagem.vantagemUnicaSelecionada.id] : ['humano']);
                }
                atualizarSumarioPontos();
            });
        }
        const label = document.createElement('label'); label.htmlFor = `${tipo}-${item.id}`;
        const nomeSpan = document.createElement('span'); nomeSpan.classList.add('tooltip'); nomeSpan.textContent = item.nome;
        let descTooltip = item.descricao || "N/A"; 
        if (tipo === 'vu' && item.habilidadesEspeciaisText) descTooltip += `<br><br><strong>Resumo:</strong> ${item.habilidadesEspeciaisText}`;
        if (item.id === 'elementalista' && personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.id === 'elfo') {
            descTooltip += "<br><i>Como Elfo, esta vantagem custa 1 Ponto e concede acesso a todos os elementos.</i>";
        }
        nomeSpan.dataset.descricao = descTooltip; 
        label.appendChild(nomeSpan);
        
        divItem.appendChild(inputEl); divItem.appendChild(label);

        if (tagVU) {
            const tagVUSpan = document.createElement('span');
            tagVUSpan.classList.add('embutido-vu-tag');
            tagVUSpan.textContent = tagVU;
            divItem.appendChild(tagVUSpan);
        }

        if (isTipoVariavelMultiplo && estaSelecionado && (personagem.vantagensCompradasMultiplas[item.id] > 0 || ((item.tipoCusto === "porCodigo" || item.tipoCusto === "porProtegido") && personagem.vantagensCompradasMultiplas[item.id] !== undefined ))) { 
            const controlesDiv = document.createElement('div'); controlesDiv.classList.add('controles-vantagem-multipla');
            const custoUnitario = item.custoBase || item.custo || item.pontosConcedidos || 0;
            let comprasAtuais = personagem.vantagensCompradasMultiplas[item.id] || 0;
            if((item.tipoCusto === "porCodigo" || item.tipoCusto === "porProtegido") && comprasAtuais === 0 && estaSelecionado) comprasAtuais = 1;

            const btnMenos = document.createElement('button'); btnMenos.textContent = "-"; btnMenos.type = "button";
            btnMenos.onclick = (e) => { e.stopPropagation();
                if (personagem.vantagensCompradasMultiplas[item.id] > 1) {
                    personagem.vantagensCompradasMultiplas[item.id]--;
                } else { 
                    personagem.vantagensCompradasMultiplas[item.id] = 0;
                    const idx = arraySelecionados.indexOf(item.id); if(idx > -1) arraySelecionados.splice(idx, 1);
                }
                renderizarListaHabilidades(container, listaItens, tipo, propPontos, arraySelecionados); 
                atualizarSumarioPontos();
            };
            const comprasDisplay = document.createElement('span'); comprasDisplay.textContent = `${comprasAtuais}x`;
            const btnMais = document.createElement('button'); btnMais.textContent = "+"; btnMais.type = "button";
            let maxCompras = item.maxCompras || (
  (item.tipoCusto === "porCodigo" || item.tipoCusto === "porProtegido") ? 4 : 5
);

// Para custo "gradual": limite pelo maior valor declarado em opcoesCusto (ex.: 2 ou 3).
if (item.tipoCusto === "gradual" && Array.isArray(item.opcoesCusto) && item.opcoesCusto.length > 0) {
  maxCompras = Math.max.apply(null, item.opcoesCusto);
}; 
            btnMais.onclick = (e) => { e.stopPropagation();
                let proxCompra = (personagem.vantagensCompradasMultiplas[item.id] || 0) + 1;
                if (tipo === 'desvant' && (item.tipoCusto === "porCodigo" || item.tipoCusto === "porProtegido")) {
                    let ptsDesvantAtuais = 0;
                    personagem.desvantagensSelecionadas.forEach(idExist => {
                         if (idExist === item.id) return; 
                         const d = todasAsDesvantagens.find(dx => dx.id === idExist);
                         let ehEmbutidaPelaVUAtual = false;
                         if(personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.desvantagensEmbutidas && personagem.vantagemUnicaSelecionada.desvantagensEmbutidas.includes(idExist)) ehEmbutidaPelaVUAtual = true;
                         if (d && !ehEmbutidaPelaVUAtual && d.pontosConcedidos) {
                             ptsDesvantAtuais += ((d.tipoCusto === "porCodigo" || d.tipoCusto === "porProtegido") && personagem.vantagensCompradasMultiplas[idExist] > 0) ? (d.pontosConcedidos * personagem.vantagensCompradasMultiplas[idExist]) : d.pontosConcedidos;
                         }
                    });
                    const ptsPotenciaisComEsta = item.pontosConcedidos * proxCompra;
                    if(personagem.limiteDesvantagens > 0 && (ptsDesvantAtuais + ptsPotenciaisComEsta) > personagem.limiteDesvantagens) {
                        alert(`Limite de desvantagens (${personagem.limiteDesvantagens}) excedido. Tentando ir para ${ptsDesvantAtuais + ptsPotenciaisComEsta} pts.`);
                        return;
                    }
                }
                if (proxCompra <= maxCompras) {
                    personagem.vantagensCompradasMultiplas[item.id] = proxCompra;
                    renderizarListaHabilidades(container, listaItens, tipo, propPontos, arraySelecionados); 
                    atualizarSumarioPontos();
                } else { alert(`Você pode comprar "${item.nome}" no máximo ${maxCompras} vezes.`); }
            };

            if ( (tipo === 'desvant' && (item.tipoCusto === "porCodigo" || item.tipoCusto === "porProtegido")) || (tipo === 'vant' && isTipoVariavelMultiplo) ) { 
                controlesDiv.appendChild(btnMenos); 
                controlesDiv.appendChild(comprasDisplay); 
                controlesDiv.appendChild(btnMais);
            }
            
            const custoTotalSpan = document.createElement('span'); custoTotalSpan.classList.add('custo');
            const prefixo = tipo === 'desvant' ? '+' : '';
            custoTotalSpan.textContent = `(${prefixo}${(custoUnitario * comprasAtuais)} Pts)`;
            controlesDiv.appendChild(custoTotalSpan);
            divItem.appendChild(controlesDiv);

        } else if (!embutidaPorVU) { 
            const custoSpan = document.createElement('span'); custoSpan.classList.add('custo');
            let textoCusto = "";
            let custoRealItem = item.custoBase !== undefined ? item.custoBase : item.custo || 0; 
            if (tipo === 'desvant' && item.pontosConcedidos !== undefined) custoRealItem = item.pontosConcedidos;

            if (personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.aptidoes) {
                if (tipo === 'vant' && personagem.vantagemUnicaSelecionada.aptidoes.vantagens && personagem.vantagemUnicaSelecionada.aptidoes.vantagens[item.id] !== undefined) {
                    custoRealItem = personagem.vantagemUnicaSelecionada.aptidoes.vantagens[item.id];
                }
            }
            
            if (isAtaqueEspecial) {
                 let custoASEcalculado = 0;
                if (personagem.ataqueEspecialConfig.forca && personagem.ataqueEspecialConfig.forca.ativo) {
                    custoASEcalculado += Math.max(1, 1 + (personagem.ataqueEspecialConfig.forca.custoModificadoresPts || 0));
                }
                if (personagem.ataqueEspecialConfig.pdf && personagem.ataqueEspecialConfig.pdf.ativo) {
                    custoASEcalculado += Math.max(1, 1 + (personagem.ataqueEspecialConfig.pdf.custoModificadoresPts || 0));
                }
                textoCusto = `(${custoASEcalculado} Pts)`;
                if (custoASEcalculado === 0 && estaSelecionado) { 
                    textoCusto = "(Configure abaixo)";
                } else if (!estaSelecionado) {
                    textoCusto = "(Clique para configurar)";
                }
            } else if (item.id === 'elementalista' && personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.id === 'elfo') {
                textoCusto = `(1 Pt - Todos El.)`; 
            } else if (item.tipoCusto === "porElemento") { 
                textoCusto = `(1 Pt/elemento)`; 
            } else if (isTipoVariavelMultiplo) {
                const plural = custoRealItem !== 1 ? 's' : '';
                textoCusto = `(${custoRealItem} Pt${plural}/${tipo === 'desvant' ? 'vez' : 'nível'})`;
            } else if (tipo === 'desvant') {
                 textoCusto = `(+${custoRealItem} Pts)`;
            } else { 
                textoCusto = custoRealItem !== undefined ? `(${custoRealItem} Pts)` : `(Variável)`;
            }
            custoSpan.textContent = textoCusto;
            divItem.appendChild(custoSpan);
        }
        divItemPrincipal.appendChild(divItem); 
        
        if (isElementalista && estaSelecionado) {
            renderizarSubEscolhasVantagem(item, divItemPrincipal); 
        } else if (isAtaqueEspecial && estaSelecionado) {
            renderizarSubEscolhasAtaqueEspecial(item, divItemPrincipal);
        }
        container.appendChild(divItemPrincipal);
    });
    aplicarTooltipsGlobais();
}
	function renderizarSubEscolhasVU() {
    if (!subEscolhaVUContainer) return;
    subEscolhaVUContainer.innerHTML = ''; 

    if (personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.requerEscolhaMagiaGratis) {
        const fieldset = document.createElement('fieldset');
        fieldset.classList.add('sub-lista-escolha');
        const legend = document.createElement('legend');
        legend.textContent = 'Magia Grátis (Elfo Negro):';
        fieldset.appendChild(legend);

        ['magia_branca', 'magia_negra'].forEach(idMagia => {
            const magiaObj = todasAsVantagens.find(v => v.id === idMagia);
            if (magiaObj) {
                const divItem = document.createElement('div');
                divItem.classList.add('item-habilidade');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = 'magia_gratis_elfo_negro';
                radio.id = `sub-vu-${idMagia}`;
                radio.value = idMagia;
                radio.checked = personagem.magiaGratisElfoNegro === idMagia;
                
                radio.onchange = (e) => {
                    const antigaMagia = personagem.magiaGratisElfoNegro;
                    if (antigaMagia && antigaMagia !== e.target.value) {
                        const indexAntiga = personagem.vantagensSelecionadas.indexOf(antigaMagia);
                        if (indexAntiga > -1) {
                            const vantAntigaObj = todasAsVantagens.find(v => v.id === antigaMagia);
                            if(vantAntigaObj && (!personagem.vantagensCompradasMultiplas[antigaMagia] || personagem.vantagensCompradasMultiplas[antigaMagia] === 0)){
                                personagem.vantagensSelecionadas.splice(indexAntiga, 1);
                            }
                        }
                    }
                    personagem.magiaGratisElfoNegro = e.target.value;
                    if (!personagem.vantagensSelecionadas.includes(e.target.value)) {
                        personagem.vantagensSelecionadas.push(e.target.value);
                    }
                    atualizarSumarioPontos();
                    if (listaVantagensContainer) renderizarListaHabilidades(listaVantagensContainer, todasAsVantagens, 'vant', 'custo', personagem.vantagensSelecionadas); 
                };
                const label = document.createElement('label');
                label.htmlFor = radio.id;
                label.textContent = ` ${magiaObj.nome}`;
                divItem.appendChild(radio);
                divItem.appendChild(label);
                fieldset.appendChild(divItem);
            }
        });
        subEscolhaVUContainer.appendChild(fieldset);
    }
    aplicarTooltipsGlobais();
}

function renderizarSubEscolhasVantagem(itemVantagem, containerParaSublista) {
    if (!containerParaSublista) return;
    
    const subContainerExistente = containerParaSublista.querySelector(`.sub-lista-escolha-vantagem[data-vantagem-id="${itemVantagem.id}"]`);
    if (subContainerExistente) subContainerExistente.remove();

    if (itemVantagem.id === 'elementalista' && personagem.vantagensSelecionadas.includes('elementalista')) {
        const fieldset = document.createElement('fieldset');
        fieldset.classList.add('sub-lista-escolha', 'sub-lista-escolha-vantagem');
        fieldset.dataset.vantagemId = itemVantagem.id;
        const legend = document.createElement('legend');
        
        const ehElfo = personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.id === 'elfo';
        
        if (ehElfo) {
            legend.textContent = 'Elementos (Elfo: Acesso a todos por 1 Ponto)';
            // A lógica de adicionar todos os elementos para Elfo já está em aplicarVantagemUnica
        } else {
            legend.textContent = 'Escolha os Elementos (Custo: 1 Ponto por elemento)';
        }
        fieldset.appendChild(legend);

        elementosMagiaElemental.forEach(elem => {
            const divItem = document.createElement('div');
            divItem.classList.add('item-habilidade');
            const check = document.createElement('input');
            check.type = 'checkbox';
            check.id = `elem-${elem.id}`;
            check.value = elem.id;
            check.checked = personagem.elementalistaEscolhidos.includes(elem.id); 
            check.disabled = ehElfo; 

            check.onchange = (e) => {
                if (ehElfo) return; 
                if (e.target.checked) {
                    if (!personagem.elementalistaEscolhidos.includes(e.target.value)) {
                        personagem.elementalistaEscolhidos.push(e.target.value);
                    }
                } else {
                    const idx = personagem.elementalistaEscolhidos.indexOf(e.target.value);
                    if (idx > -1) personagem.elementalistaEscolhidos.splice(idx, 1);
                }
                atualizarSumarioPontos(); 
                if (listaVantagensContainer) renderizarListaHabilidades(listaVantagensContainer, todasAsVantagens, 'vant', 'custo', personagem.vantagensSelecionadas); 
            };
            const label = document.createElement('label');
            label.htmlFor = check.id;
            label.textContent = ` ${elem.nome}`;
            divItem.appendChild(check);
            divItem.appendChild(label);
            fieldset.appendChild(divItem);
        });
        containerParaSublista.appendChild(fieldset); 
    }
    aplicarTooltipsGlobais();
}

function renderizarSubEscolhasAtaqueEspecial(itemVantagem, containerParaSublista) {
    if (!containerParaSublista || itemVantagem.id !== 'ataque_especial') return;

    const subContainerExistente = containerParaSublista.querySelector('.sub-lista-ataque-especial');
    if (subContainerExistente) subContainerExistente.remove();

    const fieldset = document.createElement('fieldset');
    fieldset.classList.add('sub-lista-escolha', 'sub-lista-ataque-especial');
    const legend = document.createElement('legend');
    legend.textContent = 'Configurar Ataques Especiais';
    fieldset.appendChild(legend);

    // --- Configuração para Ataque de FORÇA ---
    const divAtaqueF = document.createElement('div');
    divAtaqueF.style.marginBottom = '15px';
    const checkAtivarF = document.createElement('input');
    checkAtivarF.type = 'checkbox';
    checkAtivarF.id = 'ativar-ae-f';
    checkAtivarF.checked = !!(personagem.ataqueEspecialConfig.forca && personagem.ataqueEspecialConfig.forca.ativo);
    checkAtivarF.onchange = (e) => {
        if (e.target.checked) {
            personagem.ataqueEspecialConfig.forca = { ativo: true, modificadoresSelecionados: [], custoModificadoresPts: 0, custoTotalPMsParaUsar: 1 };
        } else {
            personagem.ataqueEspecialConfig.forca = { ativo: false, modificadoresSelecionados: [], custoModificadoresPts: 0, custoTotalPMsParaUsar: 0 }; 
        }
        renderizarListaHabilidades(listaVantagensContainer, todasAsVantagens, 'vant', 'custo', personagem.vantagensSelecionadas);
        atualizarSumarioPontos();
    };
    const labelAtivarF = document.createElement('label');
    labelAtivarF.htmlFor = 'ativar-ae-f';
    labelAtivarF.textContent = ' Configurar Ataque Especial de Força (Base F+2, Custo: 1 Pt + Mods)';
    divAtaqueF.appendChild(checkAtivarF);
    divAtaqueF.appendChild(labelAtivarF);
    fieldset.appendChild(divAtaqueF);

    if (personagem.ataqueEspecialConfig.forca && personagem.ataqueEspecialConfig.forca.ativo) {
        itemVantagem.modificadores.forEach(mod => {
            if (mod.requerTipoBase && mod.requerTipoBase !== 'F') return; 

            const divMod = document.createElement('div');
            divMod.classList.add('item-habilidade'); 
            divMod.style.marginLeft = '20px';
            const checkMod = document.createElement('input');
            checkMod.type = 'checkbox';
            checkMod.id = `mod-f-${mod.id}`;
            checkMod.value = mod.id;
            checkMod.checked = personagem.ataqueEspecialConfig.forca.modificadoresSelecionados.includes(mod.id);
            checkMod.onchange = (ev) => {
                const cfg = personagem.ataqueEspecialConfig.forca;
                if (ev.target.checked) {
                    if (!cfg.modificadoresSelecionados.includes(mod.id)) cfg.modificadoresSelecionados.push(mod.id);
                } else {
                    const idx = cfg.modificadoresSelecionados.indexOf(mod.id);
                    if (idx > -1) cfg.modificadoresSelecionados.splice(idx, 1);
                }
                cfg.custoModificadoresPts = 0;
                cfg.custoTotalPMsParaUsar = 1; 
                cfg.modificadoresSelecionados.forEach(modId => {
                    const m = itemVantagem.modificadores.find(x => x.id === modId);
                    if(m) {
                        cfg.custoModificadoresPts += m.custoPts;
                        cfg.custoTotalPMsParaUsar += m.custoPMsExtra;
                    }
                });
                if (cfg.custoTotalPMsParaUsar < 1) cfg.custoTotalPMsParaUsar = 1;
                renderizarListaHabilidades(listaVantagensContainer, todasAsVantagens, 'vant', 'custo', personagem.vantagensSelecionadas);
                atualizarSumarioPontos();
            };
            const labelMod = document.createElement('label');
            labelMod.htmlFor = checkMod.id;
            labelMod.innerHTML = ` <span class="tooltip" data-descricao="${mod.descricao} Custo Pts: ${mod.custoPts}, PMs Extra: ${mod.custoPMsExtra}">${mod.nome}</span>`;
            divMod.appendChild(checkMod);
            divMod.appendChild(labelMod);
            fieldset.appendChild(divMod);
        });
        const custoFDisplay = document.createElement('p');
        custoFDisplay.style.marginLeft = "20px";
        custoFDisplay.style.fontSize = "0.9em";
        const custoPontosF = Math.max(1, 1 + (personagem.ataqueEspecialConfig.forca.custoModificadoresPts || 0));
        custoFDisplay.textContent = `Custo do Ataque de Força: ${custoPontosF} Pts. Para usar: ${personagem.ataqueEspecialConfig.forca.custoTotalPMsParaUsar} PMs.`;
        fieldset.appendChild(custoFDisplay);
    }

    // --- Configuração para Ataque de PODER DE FOGO ---
    const divAtaquePdF = document.createElement('div');
    divAtaquePdF.style.marginTop = '20px';
    const checkAtivarPdF = document.createElement('input');
    checkAtivarPdF.type = 'checkbox';
    checkAtivarPdF.id = 'ativar-ae-pdf';
    checkAtivarPdF.checked = !!(personagem.ataqueEspecialConfig.pdf && personagem.ataqueEspecialConfig.pdf.ativo);
    checkAtivarPdF.onchange = (e) => {
        if (e.target.checked) {
            personagem.ataqueEspecialConfig.pdf = { ativo: true, modificadoresSelecionados: [], custoModificadoresPts: 0, custoTotalPMsParaUsar: 1 };
        } else {
            personagem.ataqueEspecialConfig.pdf = { ativo: false, modificadoresSelecionados: [], custoModificadoresPts: 0, custoTotalPMsParaUsar: 0 };
        }
        renderizarListaHabilidades(listaVantagensContainer, todasAsVantagens, 'vant', 'custo', personagem.vantagensSelecionadas);
        atualizarSumarioPontos();
    };
    const labelAtivarPdF = document.createElement('label');
    labelAtivarPdF.htmlFor = 'ativar-ae-pdf';
    labelAtivarPdF.textContent = ' Configurar Ataque Especial de PdF (Base PdF+2, Custo: 1 Pt + Mods)';
    divAtaquePdF.appendChild(checkAtivarPdF);
    divAtaquePdF.appendChild(labelAtivarPdF);
    fieldset.appendChild(divAtaquePdF);

    if (personagem.ataqueEspecialConfig.pdf && personagem.ataqueEspecialConfig.pdf.ativo) {
        itemVantagem.modificadores.forEach(mod => {
            const divMod = document.createElement('div');
            divMod.classList.add('item-habilidade');
            divMod.style.marginLeft = '20px';
            const checkMod = document.createElement('input');
            checkMod.type = 'checkbox';
            checkMod.id = `mod-pdf-${mod.id}`;
            checkMod.value = mod.id;
            checkMod.checked = personagem.ataqueEspecialConfig.pdf.modificadoresSelecionados.includes(mod.id);
            checkMod.disabled = mod.requerTipoBase && mod.requerTipoBase === 'F'; 

            checkMod.onchange = (ev) => {
                const cfg = personagem.ataqueEspecialConfig.pdf;
                if (ev.target.checked) {
                    if (!cfg.modificadoresSelecionados.includes(mod.id)) cfg.modificadoresSelecionados.push(mod.id);
                } else {
                    const idx = cfg.modificadoresSelecionados.indexOf(mod.id);
                    if (idx > -1) cfg.modificadoresSelecionados.splice(idx, 1);
                }
                cfg.custoModificadoresPts = 0;
                cfg.custoTotalPMsParaUsar = 1;
                cfg.modificadoresSelecionados.forEach(modId => {
                    const m = itemVantagem.modificadores.find(x => x.id === modId);
                     if(m) {
                        cfg.custoModificadoresPts += m.custoPts;
                        cfg.custoTotalPMsParaUsar += m.custoPMsExtra;
                    }
                });
                if (cfg.custoTotalPMsParaUsar < 1) cfg.custoTotalPMsParaUsar = 1;
                renderizarListaHabilidades(listaVantagensContainer, todasAsVantagens, 'vant', 'custo', personagem.vantagensSelecionadas);
                atualizarSumarioPontos();
            };
            const labelMod = document.createElement('label');
            labelMod.htmlFor = checkMod.id;
            labelMod.innerHTML = ` <span class="tooltip" data-descricao="${mod.descricao} Custo Pts: ${mod.custoPts}, PMs Extra: ${mod.custoPMsExtra}">${mod.nome}</span>`;
            divMod.appendChild(checkMod);
            divMod.appendChild(labelMod);
            fieldset.appendChild(divMod);
        });
        const custoPdFDisplay = document.createElement('p');
        custoPdFDisplay.style.marginLeft = "20px";
        custoPdFDisplay.style.fontSize = "0.9em";
        const custoPontosPdF = Math.max(1, 1 + (personagem.ataqueEspecialConfig.pdf.custoModificadoresPts || 0));
        custoPdFDisplay.textContent = `Custo do Ataque de PdF: ${custoPontosPdF} Pts. Para usar: ${personagem.ataqueEspecialConfig.pdf.custoTotalPMsParaUsar} PMs.`;
        fieldset.appendChild(custoPdFDisplay);
    }
    containerParaSublista.appendChild(fieldset);
    aplicarTooltipsGlobais();
}

function renderizarSelecaoDeMagias() {
    // ... (código da função renderizarSelecaoDeMagias como fornecido anteriormente) ...
    console.log("Renderizando seleção de magias...");
    const containerMagiasAutomaticas = document.getElementById('magias-automaticas-lista');
    const containerMagiasEscolha = document.getElementById('lista-magias-para-escolha');
    const contadorMagiasAprenderEl = document.getElementById('contador-magias-aprender');
    const magiasJaEscolhidasEl = document.getElementById('magias-ja-escolhidas');

    if (!containerMagiasAutomaticas || !containerMagiasEscolha || !contadorMagiasAprenderEl || !magiasJaEscolhidasEl) {
        console.error("Elementos da UI de magias não encontrados!");
        return;
    }

    containerMagiasAutomaticas.innerHTML = '';
    containerMagiasEscolha.innerHTML = '';
    
    const escolasPersonagem = getEscolasMagiaDoPersonagem();
    const magiasIniciaisAutomaticasIds = [];
    todasAsMagias.forEach(magia => {
        if (magia.tipoInicial === 'basica_escola') {
            const temEscolaRequerida = magia.escolas.includes("todas") || magia.escolas.some(esc => escolasPersonagem.includes(esc));
            if (temEscolaRequerida) {
                magiasIniciaisAutomaticasIds.push(magia.id);
                if (!personagem.magiasConhecidas.includes(magia.id)) {
                    personagem.magiasConhecidas.push(magia.id);
                }
            }
        }
    });
    if (personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.id === 'elfo_negro' && personagem.magiaGratisElfoNegro) {
        if (!personagem.magiasConhecidas.includes(personagem.magiaGratisElfoNegro)) {
            personagem.magiasConhecidas.push(personagem.magiaGratisElfoNegro);
        }
        if (!magiasIniciaisAutomaticasIds.includes(personagem.magiaGratisElfoNegro)) {
            magiasIniciaisAutomaticasIds.push(personagem.magiaGratisElfoNegro);
        }
    }
    
    magiasIniciaisAutomaticasIds.forEach(idMagia => {
        const magia = todasAsMagias.find(m => m.id === idMagia);
        if (magia) {
            const li = document.createElement('li');
            li.classList.add('item-habilidade'); 
            const nomeSpan = document.createElement('span');
            nomeSpan.classList.add('tooltip');
            nomeSpan.textContent = magia.nome;
            let descDetalhada = `${magia.descricao}\nCusto: ${magia.custoPMs}\nAlcance: ${magia.alcance}\nDuração: ${magia.duracao}`;
            if (magia.id === personagem.magiaGratisElfoNegro) {
                descDetalhada += "\n(Concedida pela Vantagem Única Elfo Negro)";
            } else if (magia.tipoInicial === 'basica_escola') {
                descDetalhada += "\n(Magia básica da sua escola)";
            }
            nomeSpan.dataset.descricao = descDetalhada;
            li.appendChild(nomeSpan);
            
            const origemSpan = document.createElement('span');
            origemSpan.classList.add('custo'); 
            origemSpan.style.marginLeft = '10px';
            if (magia.id === personagem.magiaGratisElfoNegro) {
                origemSpan.textContent = `(VU Elfo Negro)`;
            } else if (magia.tipoInicial === 'basica_escola') {
                origemSpan.textContent = `(Automática)`;
            }
            li.appendChild(origemSpan);
            containerMagiasAutomaticas.appendChild(li);
        }
    });

    let totalSlotsMagias = personagem.caracteristicas.H; 
    if (personagem.vantagensSelecionadas.includes('clericato')) totalSlotsMagias += 3;
    if (personagem.vantagensSelecionadas.includes('mentor')) totalSlotsMagias += 3;
    if (personagem.vantagensSelecionadas.includes('patrono')) totalSlotsMagias += 3;
    
    let magiasEscolhidasManualmenteCount = personagem.magiasConhecidas.filter(idMagia => {
        const magia = todasAsMagias.find(m => m.id === idMagia);
        return magia && magia.tipoInicial !== 'basica_escola' && idMagia !== personagem.magiaGratisElfoNegro;
    }).length;

    contadorMagiasAprenderEl.textContent = Math.max(0, totalSlotsMagias - magiasEscolhidasManualmenteCount).toString();
    magiasJaEscolhidasEl.textContent = magiasEscolhidasManualmenteCount.toString();

    todasAsMagias.forEach(magia => {
        const temAcessoEscola = magia.escolas.some(esc => escolasPersonagem.includes(esc) || esc === "todas");
        if (!temAcessoEscola) return;

        const divItem = document.createElement('div');
        divItem.classList.add('item-habilidade');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `magia-sel-${magia.id}`;
        checkbox.value = magia.id;
        
        let tagOrigem = "";
        if (magia.tipoInicial === 'basica_escola' || magia.id === personagem.magiaGratisElfoNegro) {
            checkbox.checked = true;
            checkbox.disabled = true;
            tagOrigem = (magia.id === personagem.magiaGratisElfoNegro) ? "(VU Elfo Negro)" : "(Automática)";
        } else {
            checkbox.checked = personagem.magiasConhecidas.includes(magia.id);
        }

        checkbox.addEventListener('change', (e) => {
            const idMagiaSelecionada = e.target.value;
            const selecionada = e.target.checked;
            
            let magiasManuaisAtuais = personagem.magiasConhecidas.filter(idM => {
                const m = todasAsMagias.find(mg => mg.id === idM);
                return m && m.tipoInicial !== 'basica_escola' && idM !== personagem.magiaGratisElfoNegro;
            }).length;

            if (selecionada) {
                if (magiasManuaisAtuais < totalSlotsMagias) { 
                    if (!personagem.magiasConhecidas.includes(idMagiaSelecionada)) {
                        personagem.magiasConhecidas.push(idMagiaSelecionada);
                        magiasManuaisAtuais++;
                    }
                } else {
                    alert(`Você já escolheu o máximo de ${totalSlotsMagias} magias (Habilidade + Bônus).`);
                    e.target.checked = false; 
                }
            } else {
                const index = personagem.magiasConhecidas.indexOf(idMagiaSelecionada);
                if (index > -1) {
                    personagem.magiasConhecidas.splice(index, 1);
                    magiasManuaisAtuais--;
                }
            }
            contadorMagiasAprenderEl.textContent = Math.max(0, totalSlotsMagias - magiasManuaisAtuais).toString();
            magiasJaEscolhidasEl.textContent = magiasManuaisAtuais.toString();
        });

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        const nomeMagiaSpan = document.createElement('span');
        nomeMagiaSpan.classList.add('tooltip');
        nomeMagiaSpan.textContent = ` ${magia.nome}`;
        nomeMagiaSpan.dataset.descricao = `${magia.descricao}\nEscola(s): ${magia.escolas.join(', ')}\nCusto: ${magia.custoPMs}\nAlcance: ${magia.alcance}\nDuração: ${magia.duracao}`;
        label.appendChild(nomeMagiaSpan);

        divItem.appendChild(checkbox);
        divItem.appendChild(label);
        
        const custoSpan = document.createElement('span');
        custoSpan.classList.add('custo');
        if(tagOrigem){
            custoSpan.textContent = tagOrigem;
        } else {
            custoSpan.textContent = `(${magia.custoPMs})`;
        }
        divItem.appendChild(custoSpan);
        containerMagiasEscolha.appendChild(divItem);
    });
    aplicarTooltipsGlobais();
}

function atualizarSumarioPontos() {
    // ... (código da função atualizarSumarioPontos como fornecido anteriormente) ...
    // Garantir que está usando a versão mais recente que inclui o custo do Ataque Especial
    // e trata corretamente os custos de vantagens com aptidão e múltiplas compras.
    personagem.pontosGastosCaracteristicas = 0;
    for(const carac in personagem.caracteristicasBase) {
        personagem.pontosGastosCaracteristicas += personagem.caracteristicasBase[carac];
    }
    if(elSumarioPontosGastosCarac) elSumarioPontosGastosCarac.textContent = personagem.pontosGastosCaracteristicas;
    
    let custoVantManuais = 0;
    const tiposVariaveisMultiplos = ["multiploVariavel", "multiplo", "porMembro", "porAliadoNivel", "porTipo", "porForma", "porParceiro", "porProtegido", "porCodigo"];

    personagem.vantagensSelecionadas.forEach(idVant => {
        const vant = todasAsVantagens.find(v => v.id === idVant);
        let embutidaPorVU = false;
        let custoRealVantagem = vant ? (vant.custoBase !== undefined ? vant.custoBase : vant.custo || 0) : 0;

        if(personagem.vantagemUnicaSelecionada) {
            if (personagem.vantagemUnicaSelecionada.vantagensEmbutidas && personagem.vantagemUnicaSelecionada.vantagensEmbutidas.includes(idVant)) {
                embutidaPorVU = true;
            }
            if (personagem.vantagemUnicaSelecionada.id === 'elfo_negro' && idVant === personagem.magiaGratisElfoNegro) {
                embutidaPorVU = true; 
            }
            if (personagem.vantagemUnicaSelecionada.aptidoes && personagem.vantagemUnicaSelecionada.aptidoes.vantagens &&
                personagem.vantagemUnicaSelecionada.aptidoes.vantagens[idVant] !== undefined) {
                custoRealVantagem = personagem.vantagemUnicaSelecionada.aptidoes.vantagens[idVant];
            }
        }
        
        if (vant && !embutidaPorVU) {
            if (vant.id === 'elementalista') { 
                if (personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.id === 'elfo') {
                    custoVantManuais += custoRealVantagem; 
                } else { 
                    custoVantManuais += (vant.custo || 0) * personagem.elementalistaEscolhidos.length;
                }
            } else if (vant.id === 'ataque_especial') {
                // Custo é somado depois
            } else if (tiposVariaveisMultiplos.includes(vant.tipoCusto) && personagem.vantagensCompradasMultiplas[idVant] > 0) {
                custoVantManuais += custoRealVantagem * personagem.vantagensCompradasMultiplas[idVant];
            } else if (!tiposVariaveisMultiplos.includes(vant.tipoCusto) && vant.custo !== undefined && vant.id !== 'ataque_especial') { 
                custoVantManuais += custoRealVantagem;
            }
        }
    });

    let custoAtaqueEspecialTotal = 0;
    if (personagem.ataqueEspecialConfig.forca && personagem.ataqueEspecialConfig.forca.ativo) {
        custoAtaqueEspecialTotal += Math.max(1, 1 + (personagem.ataqueEspecialConfig.forca.custoModificadoresPts || 0));
    }
    if (personagem.ataqueEspecialConfig.pdf && personagem.ataqueEspecialConfig.pdf.ativo) {
        custoAtaqueEspecialTotal += Math.max(1, 1 + (personagem.ataqueEspecialConfig.pdf.custoModificadoresPts || 0));
    }
    if (personagem.vantagensSelecionadas.includes('ataque_especial')) {
        custoVantManuais += custoAtaqueEspecialTotal;
    }
    
    let custoPer = 0;
    personagem.periciasCompletas.forEach(idPer => {
        let custoDaPericia = 2; 
        if (personagem.vantagemUnicaSelecionada && 
            personagem.vantagemUnicaSelecionada.aptidoes && 
            personagem.vantagemUnicaSelecionada.aptidoes.pericias && 
            personagem.vantagemUnicaSelecionada.aptidoes.pericias[idPer] !== undefined) {
            custoDaPericia = personagem.vantagemUnicaSelecionada.aptidoes.pericias[idPer];
        }
        custoPer += custoDaPericia;
    });

    let especAvulsasContadasParaCusto = 0;
    if(personagem.especializacoesSelecionadas){
        personagem.especializacoesSelecionadas.forEach(efId => {
            const pPaiId = efId.split('_')[0];
            if (!personagem.periciasCompletas.includes(pPaiId)) especAvulsasContadasParaCusto++;
        });
    }
    custoPer += Math.floor(especAvulsasContadasParaCusto / 3);
    
    personagem.pontosGastosVantagensVUPericias = (personagem.custoVantagemUnica || 0) + custoVantManuais + custoPer;
    if(elSumarioPontosGastosVant) elSumarioPontosGastosVant.textContent = personagem.pontosGastosVantagensVUPericias;
    
    let ptsDesvantManuais = 0;
    if(personagem.desvantagensSelecionadas){
         personagem.desvantagensSelecionadas.forEach(idDesvant => {
            const desvant = todasAsDesvantagens.find(d => d.id === idDesvant);
            let embutidaPorVU = false;
            if(personagem.vantagemUnicaSelecionada && personagem.vantagemUnicaSelecionada.desvantagensEmbutidas && personagem.vantagemUnicaSelecionada.desvantagensEmbutidas.includes(idDesvant)) embutidaPorVU = true;
            
            if (desvant && !embutidaPorVU && desvant.pontosConcedidos !== undefined) { 
                if ( (desvant.tipoCusto === "porCodigo" || desvant.tipoCusto === "porProtegido") && personagem.vantagensCompradasMultiplas[idDesvant] > 0) {
                     ptsDesvantManuais += desvant.pontosConcedidos * personagem.vantagensCompradasMultiplas[idDesvant];
                } else if (desvant.tipoCusto !== "porCodigo" && desvant.tipoCusto !== "porProtegido") { 
                     ptsDesvantManuais += desvant.pontosConcedidos;
                }
            }
        });
    }
    personagem.pontosDesvantagensConcedidos = ptsDesvantManuais;
    if(elSumarioPontosDesvantagens) elSumarioPontosDesvantagens.textContent = personagem.pontosDesvantagensConcedidos;

    if(avisoLimiteDesvantagens) avisoLimiteDesvantagens.style.display = (personagem.pontosDesvantagensConcedidos > personagem.limiteDesvantagens && personagem.limiteDesvantagens > 0) ? 'block' : 'none';
    
    let bonusResistenciaPM = 0;
    if (personagem.vantagensSelecionadas.includes("pontos_magia_extras") && personagem.vantagensCompradasMultiplas["pontos_magia_extras"]) {
        bonusResistenciaPM = personagem.vantagensCompradasMultiplas["pontos_magia_extras"] * 2;
    }
    let bonusResistenciaPV = 0;
    if (personagem.vantagensSelecionadas.includes("pontos_vida_extras") && personagem.vantagensCompradasMultiplas["pontos_vida_extras"]) {
        bonusResistenciaPV = personagem.vantagensCompradasMultiplas["pontos_vida_extras"] * 2;
    }

    personagem.pvMax = (personagem.caracteristicas.R + bonusResistenciaPV) * 5;
	personagem.pvs = personagem.pvMax;
    personagem.pmMax = (personagem.caracteristicas.R + bonusResistenciaPM) * 5;
	personagem.pms = personagem.pmMax;
    if(displayPVs) displayPVs.textContent = personagem.pvMax;
    if(displayPMs) displayPMs.textContent = personagem.pmMax;

    let totalGasto = calcularCustoTotalAgregado();
    let pontosDisponiveis = personagem.pontuacaoInicial + personagem.pontosDesvantagensConcedidos;
    let pontosRestantes = pontosDisponiveis - totalGasto;

    if(elSumarioPontuacaoInicial) elSumarioPontuacaoInicial.textContent = personagem.pontuacaoInicial;
    if(elSumarioPontosRestantes) elSumarioPontosRestantes.textContent = pontosRestantes;
    _atualizarCaracteristicasEfetivasEDisplay(); 
}

function calcularDinheiroInicial() {
    if (!inputDadoDinheiro || !moedasIniciaisDisplay) {
        dinheiroCalculadoPelaUltimaVez = false;
        return;
    }
    const valorDado = parseInt(inputDadoDinheiro.value);

    if (isNaN(valorDado) || valorDado < 1 || valorDado > 6) {
        alert("Por favor, insira um valor de 1 a 6 para o resultado do dado.");
        moedasIniciaisDisplay.textContent = "(Valor do dado inválido)";
        personagem.dinheiroNumerico = 0;
        personagem.dinheiroTexto = "(Valor do dado inválido)";
        dinheiroCalculadoPelaUltimaVez = false; 
        return;
    }

    let dinheiroCalculado = 0;
    const temRiqueza = personagem.vantagensSelecionadas.includes("riqueza");
    if (temRiqueza) {
        dinheiroCalculado = valorDado * 100000000; 
    } else {
        dinheiroCalculado = valorDado * 100;
        if (personagem.vantagensSelecionadas.includes("apar_inofensiva")) dinheiroCalculado += 175;
        if (personagem.vantagensSelecionadas.includes("boa_fama")) dinheiroCalculado += 175;
        if (personagem.vantagensSelecionadas.includes("genialidade")) dinheiroCalculado += 700;
        if (personagem.vantagensSelecionadas.includes("patrono")) dinheiroCalculado += 700;
        if (personagem.vantagensSelecionadas.includes("torcida")) dinheiroCalculado += 35;
        if(personagem.periciasCompletas) personagem.periciasCompletas.forEach(() => dinheiroCalculado += 700);
        let especAvulsasContadas = 0;
        if(personagem.especializacoesSelecionadas){
            personagem.especializacoesSelecionadas.forEach(especFullId => {
                const periciaPaiId = especFullId.split('_')[0];
                if (!personagem.periciasCompletas.includes(periciaPaiId)) especAvulsasContadas++;
            });
        }
        dinheiroCalculado += Math.floor(especAvulsasContadas / 3) * 175;
        if (personagem.desvantagensSelecionadas.includes("assombrado")) dinheiroCalculado -= 35;
        if (personagem.desvantagensSelecionadas.includes("cod_herois")) dinheiroCalculado -= 35; 
        if (personagem.vantagensSelecionadas.includes("clericato") || personagem.vantagensSelecionadas.includes("paladino")) dinheiroCalculado -=35;
        if (personagem.desvantagensSelecionadas.includes("inculto")) dinheiroCalculado -= 350;
        const desvantagensInsanasRelevantes = ["ins_cleptomaniaco", "ins_compulsivo", "ins_demente", "ins_fantasia", "ins_furia", "ins_megalomaniaco", "ins_mentiroso", "ins_obsessivo", "ins_paranoico"]; 
        const temInsanidadeComCustoDinheiro = personagem.desvantagensSelecionadas.some(id => desvantagensInsanasRelevantes.includes(id) || (id.startsWith("ins_fobia_") && id !== "ins_fobia_0"));
        if (temInsanidadeComCustoDinheiro && !personagem.desvantagensSelecionadas.includes("ins_depressivo") && !personagem.desvantagensSelecionadas.includes("ins_histerico") && !personagem.desvantagensSelecionadas.includes("ins_homicida")) {
             dinheiroCalculado -= 175;
        }
        if (personagem.desvantagensSelecionadas.includes("ma_fama")) dinheiroCalculado -= 350;
        if (personagem.desvantagensSelecionadas.includes("monstruoso")) dinheiroCalculado -= 35;
    }

    personagem.dinheiroNumerico = dinheiroCalculado;
    personagem.dinheiroTexto = (dinheiroCalculado < 0) ? `Dívida de: ${Math.abs(dinheiroCalculado)} Moedas` : `${dinheiroCalculado} Moedas`;
    moedasIniciaisDisplay.textContent = personagem.dinheiroTexto;
    dinheiroCalculadoPelaUltimaVez = true;
}
// --- FUNÇÕES AUXILIARES DE GERAÇÃO DE HTML ---

function gerarListaVantagensHTML(personagem) {
    let vantagensHTML = [];

    const ataqueEspecialInfo = todasAsVantagens.find(v => v.id === "ataque_especial");
    const modificadoresOficiais = ataqueEspecialInfo?.modificadores || [];

    if (personagem.vantagensSelecionadas) {
        personagem.vantagensSelecionadas.forEach(idVant => {
            let textoVantagem = todasAsVantagens.find(v => v.id === idVant)?.nome || idVant;

            // Trata modificadores de Ataque Especial (Força ou PdF)
            if (idVant === "ataque_especial" && personagem.ataqueEspecialConfig) {
                const listaFinal = [];

                const forca = personagem.ataqueEspecialConfig.forca;
                const pdf = personagem.ataqueEspecialConfig.pdf;

                [forca, pdf].forEach((entrada, idx) => {
                    if (entrada?.modificadoresSelecionados?.length) {
                        const tipo = idx === 0 ? "Força" : "PdF";
                        const linha = entrada.modificadoresSelecionados.map(modId => {
                            const mod = modificadoresOficiais.find(m => m.id === modId);
                            return mod ? `→ <strong>${mod.nome}</strong>: ${mod.descricao}` : `→ ${modId}`;
                        }).join("<br>&nbsp;&nbsp;&nbsp;");
                        listaFinal.push(`<em>${tipo}</em><br>&nbsp;&nbsp;&nbsp;${linha}`);
                    }
                });

                if (listaFinal.length > 0) {
                    textoVantagem += `<br><div style="margin-left: 15px; font-size: 0.95em;">${listaFinal.join('<br><br>')}</div>`;
                }
            }

            vantagensHTML.push(`<li data-item-id="${idVant}" data-item-type="vantagem">${textoVantagem}</li>`);
        });
    }

    return `<ul id="mj-lista-vantagens">${vantagensHTML.join('') || '<li>Nenhuma</li>'}</ul>`;
}


function gerarListaDesvantagensHTML(personagem) {
    let desvantagensHTML = [];
    if(personagem.desvantagensSelecionadas) {
        personagem.desvantagensSelecionadas.forEach(idDesvant => {
            const desvant = todasAsDesvantagens.find(d => d.id === idDesvant);
            if (desvant) {
                let textoDesvantagem = desvant.nome;
                if (personagem.vantagensCompradasMultiplas[idDesvant] > 1) { textoDesvantagem += ` (${personagem.vantagensCompradasMultiplas[idDesvant]}x)`; }
                desvantagensHTML.push(`<li data-item-id="${desvant.id}" data-item-type="desvantagem">${textoDesvantagem}</li>`);
            }
        });
    }
    return `<ul id="mj-lista-desvantagens">${desvantagensHTML.join('') || '<li>Nenhuma</li>'}</ul>`;
}

function gerarListaPericiasHTML(personagem) {
    let periciasListadas = [];
    if (personagem.periciasCompletas) {
        personagem.periciasCompletas.forEach(idPericia => {
            const pericia = todasAsPericias.find(p => p.id === idPericia);
            if (pericia) {
                periciasListadas.push(`<strong data-item-id="${pericia.id}" data-item-type="pericia">${pericia.nome} (Completa)</strong>`);
            }
        });
    }
    let especAvulsasTexto = [];
    if (personagem.especializacoesSelecionadas) {
        personagem.especializacoesSelecionadas.forEach(idEspecFull => {
            const periciaPaiId = idEspecFull.split('_')[0];
            if (!personagem.periciasCompletas || !personagem.periciasCompletas.includes(periciaPaiId)) {
                const periciaPai = todasAsPericias.find(p => p.id === periciaPaiId);
                const espec = periciaPai && periciaPai.especializacoes ? periciaPai.especializacoes.find(e => `${periciaPaiId}_${e.id}` === idEspecFull) : null;
                if (espec) {
                    especAvulsasTexto.push(`<span data-item-id="${espec.id}" data-item-type="pericia">${espec.nome}</span>`);
                }
            }
        });
    }
    if (especAvulsasTexto.length > 0) {
        periciasListadas.push(`<strong>Especializações:</strong> ${especAvulsasTexto.join(', ')}`);
    }
    return periciasListadas.length > 0 ? periciasListadas.join('<br>') : 'Nenhuma perícia selecionada.';
}

function gerarListaMagiasHTML(personagem) {
  if (!personagem.magias || personagem.magias.length === 0) {
    return "<p>Nenhuma magia conhecida.</p>";
  }

  const magiasValidas = personagem.magias.filter(m => m && m.nome);
  if (magiasValidas.length === 0) return "<p>Nenhuma magia conhecida.</p>";

  return `
  <ul id="mj-lista-magias">
    ${magiasValidas.map(m => {
		console.log("Magia:", m.nome, "| custovariavel:", m.custoVariavel);
      const nome = m.nome;
      const custo = m.custoPMs || m.custo || "?";
      const descricao = m.descricao || "Sem descrição.";
      const custovariavel = m.custovariavel === "true" ? "true" : "false"; // <- esta linha corrige o erro

      return `
        <li class="mj-magia-item"
            data-nome="${nome}"
            data-custo="${custo}"
            data-variavel="${custovariavel}"
            data-tooltip-text="${descricao.replace(/"/g, '&quot;')}">
          <span class="mj-magia-nome">${nome}</span>
          <span class="mj-magia-custo"> (${custo})</span>
          <button class="btn-conjurar-magia" 
                  data-nome="${nome}" 
                  data-custo="${custo}" 
                  data-variavel="${custovariavel}">Conjurar</button>
        </li>
      `;
    }).join('')}
  </ul>`;
}
document.addEventListener("click", function (e) {
  if (e.target && e.target.classList.contains("btn-conjurar-magia")) {
    const botao = e.target;
    const nome = botao.dataset.nome;
    const custoPadrao = parseInt(botao.dataset.custo);
    const custoVariavel = botao.dataset.variavel === "true";

    console.log(`Conjurando magia: ${nome}`);
    console.log(`Custo padrão: ${custoPadrao}`);
    console.log(`É custo variável? ${custoVariavel}`);

    let custoFinal = custoPadrao;

    if (custoVariavel) {
      const entrada = prompt(`A magia "${nome}" tem custo variável. Quanto PM deseja gastar? (máximo: ${custoPadrao})`);
      const valorDigitado = parseInt(entrada);

      if (!isNaN(valorDigitado) && valorDigitado > 0 && valorDigitado <= custoPadrao) {
        custoFinal = valorDigitado;
      } else {
        alert("Valor inválido. A conjuração foi cancelada.");
        return;
      }
	  custoFinal = valorDigitado;
    }

    const campoPM = document.getElementById("campo-pm-atual");
    const pmAtual = parseInt(campoPM.textContent || campoPM.value);

    if (pmAtual < custoFinal) {
      alert("PMs insuficientes!");
      return;
    }

    const novoPM = pmAtual - custoFinal;
    if (campoPM.tagName === "INPUT") {
      campoPM.value = novoPM;
    } else {
      campoPM.textContent = novoPM;
    }

    alert(`Você conjurou "${nome}" e gastou ${custoFinal} PM.`);
  }
});


function verificarAcessoMagia() {
    const vantagensMagicas = ['magia_branca', 'magia_negra', 'magia_elemental', 'arcano'];
    if (personagem.vantagensSelecionadas.some(vantId => vantagensMagicas.includes(vantId))) {
        return true;
    }
    if (personagem.vantagemUnicaSelecionada) {
        if (personagem.vantagemUnicaSelecionada.id === 'elfo_negro' && personagem.magiaGratisElfoNegro) {
            return true;
        }
    }
    return false;
}

// --- FUNÇÕES DE UI (TOOLTIPS, NAVEGAÇÃO DE ETAPAS) ---
function mostrarTooltipGlobal(elementoGatilho, texto) {
    if (!globalTooltipContainer || !elementoGatilho || !texto) {
        esconderTooltipGlobal();
        return;
    }
    globalTooltipContainer.innerHTML = texto;
    // Lógica de posicionamento
    globalTooltipContainer.style.visibility = 'hidden'; 
    globalTooltipContainer.style.opacity = '0';
    globalTooltipContainer.style.display = 'block'; 
    const tooltipRect = globalTooltipContainer.getBoundingClientRect();
    globalTooltipContainer.style.display = ''; 
    const gatilhoRect = elementoGatilho.getBoundingClientRect();
    let topPos = gatilhoRect.top - tooltipRect.height - 10;
    let leftPos = gatilhoRect.left + (gatilhoRect.width / 2) - (tooltipRect.width / 2);
    if (topPos < 5) { topPos = gatilhoRect.bottom + 10; }
    if (leftPos < 5) { leftPos = 5; }
    if (leftPos + tooltipRect.width > window.innerWidth - 5) { leftPos = window.innerWidth - tooltipRect.width - 5; }
    if (topPos + tooltipRect.height > window.innerHeight - 5) { topPos = window.innerHeight - tooltipRect.height - 5; if (topPos < 5) topPos = 5; }
    globalTooltipContainer.style.top = `${topPos}px`;
    globalTooltipContainer.style.left = `${leftPos}px`;
    
    globalTooltipContainer.style.visibility = 'visible';
    globalTooltipContainer.style.opacity = '1';
    globalTooltipContainer.style.pointerEvents = 'none';
}

function esconderTooltipGlobal() {
    if (!globalTooltipContainer) return;
    globalTooltipContainer.style.visibility = 'hidden';
    globalTooltipContainer.style.opacity = '0';
    globalTooltipContainer.style.pointerEvents = 'none';
}

function aplicarTooltipsGlobais() { 
    const elementosComTooltip = document.querySelectorAll('.etapa-tutorial .tooltip');
    elementosComTooltip.forEach(el => {
        const d = el.dataset.descricao;
        if (d) {
            el.removeEventListener('mouseenter', handleTooltipMouseEnter);
            el.removeEventListener('mouseleave', handleTooltipMouseLeave);
            el.addEventListener('mouseenter', handleTooltipMouseEnter);
            el.addEventListener('mouseleave', handleTooltipMouseLeave);
        }
    });
}

function handleTooltipMouseEnter(event) {
    const d = event.currentTarget.dataset.descricao;
    mostrarTooltipGlobal(event.currentTarget, d);
}

function handleTooltipMouseLeave(event) {
    esconderTooltipGlobal();
}

function mostrarTooltipAtributo(elementoGatilho, caracNome) {
    if (!globalTooltipContainer || !elementoGatilho || !personagem) {
        esconderTooltipGlobal();
        return;
    }

    const caracBase = personagem.caracteristicasBase[caracNome];
    const caracEfetiva = personagem.caracteristicas[caracNome];
    let textoCalculo = "";
    let bonusVUNum = 0;
    let nomeDaVU = "";

    if (personagem.vantagemUnicaSelecionada && 
        personagem.vantagemUnicaSelecionada.modificadoresCaracteristicas &&
        personagem.vantagemUnicaSelecionada.modificadoresCaracteristicas[caracNome] !== undefined) {
        bonusVUNum = personagem.vantagemUnicaSelecionada.modificadoresCaracteristicas[caracNome];
        nomeDaVU = personagem.vantagemUnicaSelecionada.nome;
    }

    if (bonusVUNum !== 0) {
        textoCalculo = `Base: ${caracBase} ${bonusVUNum > 0 ? '+' : ''} ${bonusVUNum} (de ${nomeDaVU}) = <strong>${caracEfetiva}</strong>`;
    } else {
        textoCalculo = `Base: ${caracBase} = <strong>${caracEfetiva}</strong>`;
    }
    
    let tooltipHTML = `<p>${textoCalculo}</p>`;
    
    globalTooltipContainer.innerHTML = tooltipHTML;

    globalTooltipContainer.style.visibility = 'hidden'; 
    globalTooltipContainer.style.opacity = '0';
    globalTooltipContainer.style.display = 'block'; 

    const tooltipRect = globalTooltipContainer.getBoundingClientRect();
    const gatilhoRect = elementoGatilho.getBoundingClientRect();
    
    let topPos = gatilhoRect.bottom + 8; 
    let leftPos = gatilhoRect.left + (gatilhoRect.width / 2) - (tooltipRect.width / 2);

    if (leftPos < 5) leftPos = 5;
    if (leftPos + tooltipRect.width > window.innerWidth - 5) leftPos = window.innerWidth - tooltipRect.width - 5;
    if (topPos + tooltipRect.height > window.innerHeight - 5) topPos = gatilhoRect.top - tooltipRect.height - 8; 
    if (topPos < 5) topPos = 5;
    
    globalTooltipContainer.style.top = `${topPos}px`;
    globalTooltipContainer.style.left = `${leftPos}px`;
    globalTooltipContainer.style.visibility = 'visible';
    globalTooltipContainer.style.opacity = '1';
    globalTooltipContainer.style.pointerEvents = 'none';
}

function atualizarExibicaoEtapa() {
    console.log("--- atualizarExibicaoEtapa ---");
    console.log("Etapa Atual ANTES de processar:", etapaAtual, "Modo Finalizado:", modoCriacaoFinalizado);

    const fichaModoJogoDiv = document.getElementById('ficha-modo-jogo');
    const navTutorial = document.querySelector('.navegacao-tutorial');

    // Gerencia a visibilidade das etapas do tutorial e da ficha modo jogo
    for (let i = 0; i <= totalEtapasCriacao; i++) {
        const elTutorial = document.getElementById(`etapa-${i}`);
        if (elTutorial) {
            if (!modoCriacaoFinalizado && i === etapaAtual) {
                elTutorial.classList.add('etapa-ativa'); // Mantém para outros estilos, se houver
                elTutorial.style.display = 'block';     // MOSTRA a etapa atual
                console.log(`Mostrando etapa-${i}`);
            } else {
                elTutorial.classList.remove('etapa-ativa');
                elTutorial.style.display = 'none';      // ESCONDE outras etapas ou se finalizado
            }
        }
    }

    // A ficha-modo-jogo da página ATUAL deve estar sempre oculta durante a criação
    // e só se torna visível (em um NOVO ARQUIVO) após a finalização.
    // No contexto desta página de criação, ela deve permanecer oculta após a lógica inicial.
    if (fichaModoJogoDiv) {
        // Se o modo criação não foi finalizado, a ficha-modo-jogo DEVE estar oculta.
        // Se foi finalizado, esta página inteira de criação será "desativada" em favor da tela final.
        if (!modoCriacaoFinalizado) {
            fichaModoJogoDiv.style.display = 'none';
        }
        // Se modoCriacaoFinalizado é true, a tela de finalização é que deve estar visível,
        // e a ficha-modo-jogo desta página não importa mais.
    }

    // Atualiza estado dos botões de navegação do tutorial
    if (!modoCriacaoFinalizado) { // Só atualiza botões se não estiver finalizado
        if(btnAnterior) {
            btnAnterior.disabled = (etapaAtual === 0);
        }
        if(btnProximo) {
            if (navTutorial && navTutorial.style.display !== 'none') {
                 btnProximo.textContent = (etapaAtual === totalEtapasCriacao) ? "Finalizar Criação" : "Próximo";
            }
        }
    } else { // Se finalizado, esconde a navegação do tutorial
        if (navTutorial) navTutorial.style.display = 'none';
    }


    // Atualiza características efetivas, PVs, PMs (isso é sempre necessário se a ficha de criação estiver visível)
    if (!modoCriacaoFinalizado) {
         _atualizarCaracteristicasEfetivasEDisplay();
    }

    // Lógica de renderização específica da etapa (SÓ EXECUTA SE NÃO ESTIVER FINALIZADO E FOR A ETAPA ATIVA)
    if (!modoCriacaoFinalizado) {
        // A renderização específica só precisa acontecer para a etapa que se tornou ativa
        if (document.getElementById(`etapa-${etapaAtual}`) && document.getElementById(`etapa-${etapaAtual}`).style.display === 'block') {
            if (etapaAtual === 0) {
                // console.log("Renderizando Etapa 0 (Identificação e Pontuação)");
            } else if (etapaAtual === 1) {
                // console.log("Renderizando Etapa 1 (Conceito)");
            } else if (etapaAtual === 2 && listaVantagensUnicasContainer) {
                console.log("Renderizando Etapa 2 (Vantagem Única)");
                renderizarListaHabilidades(listaVantagensUnicasContainer, todasAsVantagensUnicas, 'vu', 'custo', personagem.vantagemUnicaSelecionada ? [personagem.vantagemUnicaSelecionada.id] : ['humano']);
                renderizarSubEscolhasVU();
            } else if (etapaAtual === 3) {
                console.log("Renderizando Etapa 3 (Características)");
            } else if (etapaAtual === 4 && listaVantagensContainer) {
                console.log("Renderizando Etapa 4 (Vantagens)");
                renderizarListaHabilidades(listaVantagensContainer, todasAsVantagens, 'vant', 'custo', personagem.vantagensSelecionadas);
            } else if (etapaAtual === 5 && listaDesvantagensContainer) {
                console.log("Renderizando Etapa 5 (Desvantagens)");
                renderizarListaHabilidades(listaDesvantagensContainer, todasAsDesvantagens, 'desvant', 'pontosConcedidos', personagem.desvantagensSelecionadas);
            } else if (etapaAtual === 6 && listaPericiasContainer) {
                console.log("Renderizando Etapa 6 (Perícias)");
                renderizarPericias();
            } else if (etapaAtual === 7) {
                console.log("Verificando para renderizar Etapa 7 (Magias)");
                if (verificarAcessoMagia()) {
                    renderizarSelecaoDeMagias();
                } else {
                    console.log("Sem acesso a magia, pulando renderização da Etapa 7.");
                }
            } else if (etapaAtual === 8 && moedasIniciaisDisplay) {
                console.log("Renderizando Etapa 8 (Dinheiro e Pertences)");
                if (!dinheiroCalculadoPelaUltimaVez) {
                    if (inputDadoDinheiro && inputDadoDinheiro.value.trim() !== "") {
                         moedasIniciaisDisplay.textContent = "(Valor do dado presente, clique em 'Calcular Dinheiro')";
                    } else {
                         moedasIniciaisDisplay.textContent = "(Informe o resultado do dado e clique em calcular)";
                    }
                } else {
                    moedasIniciaisDisplay.textContent = personagem.dinheiroTexto;
                }
            } else if (etapaAtual === 9) {
                console.log("Renderizando Etapa 9 (Revisão e Finalização)");
            }
        }
    }

    aplicarTooltipsGlobais();
    console.log("Visibilidade de navTutorial no fim de atualizarExibicaoEtapa:", navTutorial ? navTutorial.style.display : "não encontrado");
    console.log("---------------------------------");
}

function proximaEtapa() {
    salvarDadosDaEtapaAtual();

    if (!validarEtapaAtual()) {
        return;
    }

    if (etapaAtual === 8) {
        const dadoInputEl = inputDadoDinheiro;
        const dadoPreenchido = dadoInputEl && dadoInputEl.value.trim() !== "";
        const valorDadoNumerico = dadoPreenchido ? parseInt(dadoInputEl.value) : NaN;
        const dadoValido = dadoPreenchido && !isNaN(valorDadoNumerico) && valorDadoNumerico >= 1 && valorDadoNumerico <= 6;

        if (dinheiroCalculadoPelaUltimaVez) {
            if (!dadoValido) {
                alert("O valor do dado foi alterado para um valor inválido (1-6) após o último cálculo. Por favor, corrija e clique em 'Calcular Dinheiro'.");
                dinheiroCalculadoPelaUltimaVez = false; 
                if (moedasIniciaisDisplay) moedasIniciaisDisplay.textContent = "(Dado inválido, recalcule)";
                return;
            }
        } else {
            let mensagemAlerta = "Por favor, clique no botão 'Calcular Dinheiro' antes de prosseguir.";
            if (!dadoPreenchido) {
                mensagemAlerta = "Por favor, informe o resultado do dado (1-6) e clique no botão 'Calcular Dinheiro'.";
            } else if (!dadoValido) {
                mensagemAlerta = "O valor do dado informado é inválido (deve ser 1-6). Por favor, corrija e clique no botão 'Calcular Dinheiro'.";
            }
            alert(mensagemAlerta);
            return; 
        }
    }

    if (etapaAtual < totalEtapasCriacao) {
        let proximaEtapaLogica = etapaAtual + 1;
        
        if (proximaEtapaLogica === 7 && !verificarAcessoMagia()) {
            console.log("proximaEtapa: Pulando etapa lógica 7 (Magias) para 8 (Dinheiro).");
            etapaAtual = 8; 
        } else {
            etapaAtual = proximaEtapaLogica;
        }
        
        atualizarExibicaoEtapa();
    } else {
        finalizarCriacao();
    }
}

function etapaAnterior() {
    salvarDadosDaEtapaAtual();

    if (etapaAtual === 8) {
        dinheiroCalculadoPelaUltimaVez = false;
        console.log("Saindo da etapa de dinheiro para anterior, flag 'dinheiroCalculadoPelaUltimaVez' resetada.");
    }

    if (etapaAtual > 0) {
        let etapaAnteriorLogica = etapaAtual - 1;
        
        if (etapaAnteriorLogica === 7 && !verificarAcessoMagia()) {
            console.log("etapaAnterior: Pulando etapa lógica 7 (Magias) para 6 (Perícias).");
            etapaAtual = 6; 
        } else {
            etapaAtual = etapaAnteriorLogica;
        }
        
        atualizarExibicaoEtapa();
    }
}

/************************************************************
 * BLOCO: Validação por etapa (Criação)
 * Política:
 *  - Permitir avançar com pontos negativos (exceto na finalização).
 *  - Checar limite de desvantagens manuais.
 *  - Se o jogador comprou "Ataque Especial", exigir ao menos um tipo
 *    ATIVO (Força ou PdF) a partir da etapa 4.
 ************************************************************/
function validarEtapaAtual() {
  // 1) Pontuação Inicial obrigatória na etapa 0
  if (elPontuacaoInicial && etapaAtual === 0 && personagem.pontuacaoInicial === 0 && elPontuacaoInicial.value === "0") {
    alert("Por favor, selecione a Pontuação Inicial antes de prosseguir.");
    return false;
  }

  // 2) Limite de desvantagens manuais (mantido)
  let ptsDesvantManual = 0;
  if (personagem.desvantagensSelecionadas) {
    personagem.desvantagensSelecionadas.forEach(idDesvant => {
      const desvant = todasAsDesvantagens.find(d => d.id === idDesvant);
      let embutidaPorVU = false;
      if (
        personagem.vantagemUnicaSelecionada &&
        personagem.vantagemUnicaSelecionada.desvantagensEmbutidas &&
        personagem.vantagemUnicaSelecionada.desvantagensEmbutidas.includes(idDesvant)
      ) {
        embutidaPorVU = true;
      }
      if (desvant && !embutidaPorVU && desvant.pontosConcedidos !== undefined) {
        if (
          (desvant.tipoCusto === "porCodigo" || desvant.tipoCusto === "porProtegido") &&
          personagem.vantagensCompradasMultiplas &&
          personagem.vantagensCompradasMultiplas[idDesvant] > 0
        ) {
          ptsDesvantManual += desvant.pontosConcedidos * personagem.vantagensCompradasMultiplas[idDesvant];
        } else if (desvant.tipoCusto !== "porCodigo" && desvant.tipoCusto !== "porProtegido") {
          ptsDesvantManual += desvant.pontosConcedidos;
        }
      }
    });
  }

  if (ptsDesvantManual > personagem.limiteDesvantagens && personagem.limiteDesvantagens > 0) {
    if (etapaAtual >= 5) {
      alert(`Você excedeu o limite de ${personagem.limiteDesvantagens} pontos de desvantagens manuais (${ptsDesvantManual} pts). Por favor, ajuste suas escolhas.`);
    }
    if (etapaAtual >= 5) return false;
  }

  // 3) Obrigatoriedade do tipo ATIVO do Ataque Especial (quando comprado)
  // Observação: a vantagem cria ramos .forca/.pdf por padrão ao marcar a caixa,
  // então precisamos checar a FLAG 'ativo' — não apenas a existência do objeto.
  try {
    const comprouAE = Array.isArray(personagem.vantagensSelecionadas) &&
                      personagem.vantagensSelecionadas.includes("ataque_especial");
    if (comprouAE && etapaAtual >= 4) {
      const cfg = personagem.ataqueEspecialConfig || {};
      const ativoForca = !!(cfg.forca && cfg.forca.ativo);
      const ativoPdf   = !!(cfg.pdf   && cfg.pdf.ativo);
      if (!ativoForca && !ativoPdf) {
        alert("Você comprou a vantagem Ataque Especial, mas não ativou nenhum tipo base (Força ou PdF). Marque pelo menos um antes de avançar.");
        return false;
      }
    }
  } catch (e) {
    console.warn("Validação de Ataque Especial falhou:", e);
  }

  return true;
}

function salvarDadosDaEtapaAtual() {
    if (elNomePersonagem) personagem.nome = elNomePersonagem.value;
    if (elConceitoPersonagem) personagem.conceito = elConceitoPersonagem.value;
    if (pertencesPessoaisTextarea && etapaAtual === 8) { 
        personagem.pertencesPessoais = pertencesPessoaisTextarea.value;
    }
    atualizarSumarioPontos();
}
function finalizarCriacao() {
    salvarDadosDaEtapaAtual();
    
  // 2) Mantemos as demais validações já existentes (ex.: limite de desvantagens etc.)
  if (!validarEtapaAtual()) { 
    return; 
  }

  // 3) Recalcular saldos com as MESMAS regras usadas no sumário
  //    - totalGasto: custo agregado de tudo (características, vantagens, VU, perícias...)
  //    - pontosDisponiveis: pontuação inicial + desvantagens concedidas
  //    - pontosRestantes: precisa ser EXATAMENTE 0 para finalizar
  const totalGasto = calcularCustoTotalAgregado();
  const pontosDisponiveis = (personagem.pontuacaoInicial || 0) + (personagem.pontosDesvantagensConcedidos || 0);
  const pontosRestantes = pontosDisponiveis - totalGasto;

  // 4) Gate final: só deixa gerar a ficha se pontosRestantes === 0
  if (pontosRestantes !== 0) {
    // Feedback didático informando excesso ou falta
    const msg =
      pontosRestantes < 0
        ? `Você gastou ${Math.abs(pontosRestantes)} ponto(s) a mais do que o permitido. Ajuste suas escolhas até zerar os Pontos Restantes.`
        : `Você ainda tem ${pontosRestantes} ponto(s) disponível(is). Gaste-os ou reduza desvantagens para que os Pontos Restantes fiquem em 0.`;

    alert(`Finalização bloqueada.\n\n${msg}`);

    // Garantir que o usuário esteja na Etapa 9 (Revisão) para ajustar
    // sem impedir que ele volte, se quiser.
    if (typeof etapaAtual === "number" && etapaAtual !== 9) {
      etapaAtual = 9;
      atualizarExibicaoEtapa();
    }
    return;
  }
   // (Opcional) confirmação — pode remover se quiser fluxo direto
  if (!confirm("Finalizar criação e enviar o personagem ao host?")) return;

  // 4) EXPOR O RESULTADO — sem gerar ficha HTML, sem download
  try {
    // compat global (alguns fluxos esperam isso)
    window.personagemDados = personagem;

    // log/backup local para debug
    try { localStorage.setItem("fi:ultima_ficha_criada", JSON.stringify(personagem)); } catch(_) {}

    // gancho opcional do container (se existir)
    if (typeof window.__FI_emitFinalize === "function") {
      window.__FI_emitFinalize(personagem);
    }

    // fallback universal (útil em Discord Activity / WebView)
    window.parent?.postMessage({ type: "Ficha3DT:FINALIZAR", personagemDados: personagem }, "*");
  } catch (err) {
    console.error("Falha ao expor personagem:", err);
    alert("Não foi possível enviar o personagem ao host. Veja o console para detalhes.");
    return;
  }

  // 5) Encerramento visual básico (sem “tela de sucesso” que gruda)
  //    - Trava navegação/edição para evitar inconsistências pós-finalização.
  try {
    const nav = document.querySelector(".navegacao-tutorial");
    if (nav) nav.style.display = "none";
    const cab = document.querySelector(".cabecalho-ficha");
    if (cab) cab.style.pointerEvents = "none";
    // Sinaliza internamente que encerrou
    window.modoCriacaoFinalizado = true;
  } catch(_) {}

  // (Opcional) Mensagem bem discreta
  alert("Personagem enviado com sucesso!");
}

// --- EVENT LISTENERS INICIAIS ---
if(elNomePersonagem) elNomePersonagem.addEventListener('input', (event) => { personagem.nome = event.target.value; });
if(elPontuacaoInicial) elPontuacaoInicial.addEventListener('change', (event) => {
    personagem.pontuacaoInicial = parseInt(event.target.value) || 0;
    definirLimiteDesvantagens();
    aplicarVantagemUnica(personagem.vantagemUnicaSelecionada ? personagem.vantagemUnicaSelecionada.id : 'humano');
});
if(elConceitoPersonagem) elConceitoPersonagem.addEventListener('input', (event) => { personagem.conceito = event.target.value; });
if(pertencesPessoaisTextarea) pertencesPessoaisTextarea.addEventListener('input', (event) => {personagem.pertencesPessoais = event.target.value;});


document.querySelectorAll('#etapa-3 .caracteristicas-grid select').forEach(select => {
    select.addEventListener('change', (event) => {
        const caracNome = event.target.dataset.caracteristica;
        const valorComprado = parseInt(event.target.value);
        personagem.caracteristicasBase[caracNome] = valorComprado;
        _atualizarCaracteristicasEfetivasEDisplay();
        atualizarSumarioPontos();
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    console.log("DOM carregado, inicializando ficha...");
    document.querySelectorAll('#etapa-3 .caracteristicas-grid select').forEach(select => {
        personagem.caracteristicasBase[select.dataset.caracteristica] = parseInt(select.value);
        personagem.caracteristicas[select.dataset.caracteristica] = parseInt(select.value);
    });
    definirLimiteDesvantagens();
    aplicarVantagemUnica('humano'); 
    atualizarExibicaoEtapa(); 
    
    if (inputDadoDinheiro) {
        inputDadoDinheiro.addEventListener('input', () => {
            if (dinheiroCalculadoPelaUltimaVez) {
                console.log("Dado alterado após cálculo. Flag 'dinheiroCalculadoPelaUltimaVez' resetada.");
                dinheiroCalculadoPelaUltimaVez = false;
                if (moedasIniciaisDisplay) {
                    moedasIniciaisDisplay.textContent = "(Dado alterado, clique em 'Calcular Dinheiro')";
                }
            }
        });
    }
	const btnCriarNovo = document.getElementById('btnCriarNovoPersonagem');
    if (btnCriarNovo) {
        btnCriarNovo.addEventListener('click', () => {
            if (confirm("Isso irá recarregar a página e perderá qualquer dado não salvo da criação atual. Deseja continuar?")) {
                window.location.reload();
            }
        });
    }

    const btnFechar = document.getElementById('btnFecharJanela');
    if (btnFechar) {
        btnFechar.addEventListener('click', () => {
            window.close()
            alert("Para fechar, por favor, use o botão de fechar do seu navegador para esta aba/janela.");
        });
    }
    console.log("Ficha inicializada.");
});