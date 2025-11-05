// Este arquivo NÃO troca sua lógica. Só “ouve” sua finalização e repassa eventos.

(function(){
  // 1) Se sua Rev30 chama window.finalizarCriacao(personagem) OU monta o objeto internamente,
  //    você pode interceptar após o clique em "Finalizar":

  // a) Pega referência do botão "Finalizar" se ele já existir
  const btn = document.getElementById('btnFinalizar') || document.querySelector('button[onclick*="finalizar"]');
  if (btn) {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        try {
          const personagemDados = window.personagemDados || window.__personagemGerado__;
          if (personagemDados) {
            // Notifica o host (Discord Activity / app pai)
            window.__FI_emitFinalize && window.__FI_emitFinalize(personagemDados);
            window.parent?.postMessage({ type: 'FIcha3DT:FINALIZAR', personagemDados }, '*');
          }
        } catch(_) {}
      }, 0);
    }, { capture: true });
  }

  // b) Exponha um helper que o seu código antigo pode chamar sem quebrar
  window.__FI_emitFinalize = window.__FI_emitFinalize || function(){};
})();
