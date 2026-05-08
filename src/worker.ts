import { loadWasmModule } from './wasm_loader';

let magicEngine: any = null;

loadWasmModule().then(module => {
  magicEngine = module;
}).catch(error => {
  console.error('Falha ao carregar o motor WASM:', error);
});

self.onmessage = async (e: MessageEvent) => {
  const { magicString } = e.data;
  try {
    if (!magicEngine) {
      throw new Error('Motor WASM ainda não carregado.');
    }

    const resultJson = magicEngine.compile(magicString);
    self.postMessage({ status: 'success', data: JSON.parse(resultJson) });
  } catch (error: any) {
    self.postMessage({ status: 'error', message: error?.message || 'Erro desconhecido no motor WASM.' });
  }
};