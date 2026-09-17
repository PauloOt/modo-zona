# Modo Zona

**→ [pauloot.github.io/modo-zona](https://pauloot.github.io/modo-zona/)**

App de música funcional para foco — no espírito do Brain.fm, mas com o motor
aberto e todos os parâmetros na mão do usuário.

Não há arquivo de áudio nenhum no repositório. Tudo é sintetizado na hora com
a Web Audio API: cada sessão soa diferente, funciona offline e o pacote inteiro
tem menos de 100 kB.

## O motor

Duas camadas independentes, que é o que o Brain.fm chama de "música funcional":

**1. A trilha.** Pad de quatro vozes (duas serras desafinadas + triângulo uma
oitava abaixo, por um passa-baixa ressonante), leito de ruído marrom em loop
com crossfade na emenda e o filtro respirando a 0,035 Hz, sub-grave senoidal
de fundação, e um reverb de convolução com resposta impulsiva sintética. A
harmonia anda devagar de propósito: música que pede atenção compete com a tarefa.

**2. A modulação.** Todo o mix passa por um `GainNode` cujo ganho oscila na
frequência-alvo. É esse o mecanismo de arrastamento — o mesmo princípio que o
Brain.fm patenteia em volta, e o que tem melhor sustentação experimental entre
as técnicas de entrainment auditivo.

A envoltória não é uma senoide simples: é uma série harmônica com janela
gaussiana (`harmonics()` em `index.html`), do quase-senoidal ao pulso estreito
tipo isocrônico. O controle **Envoltória** é o desvio dessa janela. A mesma
função desenha as ondinhas nos cartões de modo e alimenta o `PeriodicWave` do
LFO — uma definição só, som e gráfico sempre coerentes.

### Faixas

| Faixa | Hz        | Modo de fábrica     |
|-------|-----------|---------------------|
| Delta | < 4       | Sono (desce a 2,5)  |
| Teta  | 4 – 8     | Meditação (6)       |
| Alfa  | 8 – 13    | Calma (8), Criativo (10) |
| Beta  | 13 – 30   | Foco (16)           |
| Gama  | > 30      | Zona (40)           |

A faixa é derivada da frequência, não fixada no preset: arraste o slider e o
rótulo acompanha.

### Detalhes que não são acidentais

- **Lookahead de 2 s** no sequenciador. Aba em segundo plano faz o navegador
  estrangular timers para ~1 Hz; janela curta deixaria buracos no som justo
  quando você está trabalhando em outra janela.
- **Rampa de entrada.** A modulação sobe de 25% ao valor cheio ao longo do
  tempo configurado em *Entrada*, em vez de bater de cara.
- **Binaural se desabilita acima de 30 Hz.** Acima disso o cérebro não funde
  os dois tons e o batimento simplesmente não existe — anunciar "binaural de
  40 Hz" seria mentira. A AM cobre essa faixa.
- **O anel visual tem constante de tempo de ~0,3 s**, então não consegue piscar
  a 16 ou 40 Hz. Sincronizar de verdade é um checkbox separado, com aviso sobre
  epilepsia fotossensível.
- **`<audio>` silencioso em loop** durante a sessão: sem ele o Web Audio não
  aparece nos controles de mídia do sistema nem sobrevive bem à tela apagada
  no celular.

## Personalização

Todos os parâmetros são editáveis ao vivo — mudar de modo ou mexer num slider
nunca reconstrói o grafo, só reajusta os nós com `setTargetAtTime`, então a
transição é contínua. Modos salvos ficam em `localStorage` e podem ser
exportados como JSON pela aba **Modos → Levar para outro aparelho**.

## Rodar

O app funciona abrindo `index.html` direto no navegador. Para o service worker
e a instalação como PWA, precisa de um servidor (origem segura):

```bash
npx serve .
```

ou

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000` — o Chrome oferece "Instalar" na barra de
endereço; no iOS, Safari → Compartilhar → Adicionar à Tela de Início.

## Publicar como Artifact

`index.html` é o único fonte. O build tira dele o esqueleto de documento e os
blocos marcados com `<!--#standalone-->`, que a plataforma de Artifacts injeta
por conta própria:

```bash
node tools/build-artifact.mjs
```

Sai em `dist/artifact.html` (fora do versionamento).

## Ressalva

A evidência sobre arrastamento auditivo é modesta e varia muito de pessoa para
pessoa — por isso tudo aqui é ajustável em vez de prometido. Isso é ruído de
fundo bem projetado, não tratamento.
