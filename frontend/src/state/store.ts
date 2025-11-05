/* ============================ STATE + HELPERS ============================ */
/* Mantém o estado global e utilitários DOM simples. */

export const state = {
  token: null,
  me: null,
  guild: null,
  papel: null,        // "jogador" | "mestre"
  campanhas: [],      // vindo de campanhas.json (fallback: mock)
  campanhaAtual: null // { id, nome, codigo, ... }
};

// Atalhos DOM e toggle
export const $    = (sel)=>document.querySelector(sel);
export const show = (el)=>el.classList.remove('hide');
export const hide = (el)=>el.classList.add('hide');

// Elementos usados em vários módulos

export const els = {
  // NOVOS:
  elInicio:         $("#telaInicio"),
  btnIniciar:       $("#btnIniciar"),

  // Antigos:
  elPapel:           $("#telaPapel"),
  elCampanhas:       $("#telaCampanhas"),
  elDentro:          $("#telaDentroCampanha"),
  elLista:           $("#listaCampanhas"),
  elUiUser:          $("#uiUser"),
  elUiGuild:         $("#uiGuild"),
  elBtnSairCampanha: $("#btnSairCampanha"),
  elBtnReauth:       $("#btnReauth"),
  elTituloCampanha:  $("#tituloCampanha"),
  elTagPapel:        $("#tagPapel"),
  elPanel:           $("#panelModulo"),
  elIframe:          $("#frameModulo"),
  elModuloTitulo:    $("#moduloTitulo"),
  elModuloNomeCamp:  $("#moduloCampanha"),
  elModuloPapel:     $("#moduloPapel"),
  hubCenter:         $("#hub-center"),
};

