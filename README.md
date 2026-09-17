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

### Cores de ruído

O leito de ruído tem cinco cores, que diferem pela inclinação do espectro —
cada −3 dB por oitava é uma integração do branco, cada +3 dB uma derivada:

| Cor | Inclinação | Para quê |
|-----|-----------|----------|
| Marrom | −6 dB/oitava | cachoeira; mascara trânsito e zumbido de máquina |
| Rosa | −3 dB/oitava | energia igual por oitava, que é como o ouvido divide o espectro |
| Branco | plano | o que mais cobre voz, e o que mais cansa |
| Azul | +3 dB/oitava | chiado fino, com o brilho fechado |
| Violeta | +6 dB/oitava | mascarar tinnitus agudo |

Cada buffer é **normalizado pelo RMS** antes de tocar, então trocar de cor
muda o timbre sem mudar o volume — que é o que permite compará-las. E como um
`AudioBufferSourceNode` não troca de buffer depois de iniciado, a troca entra
como crossfade de 1,5 s entre duas fontes (`startNoise()`), sem cortar o som.

### Recomendações

A aba **Modos** traz receitas: cada uma aplica um conjunto de ajustes e diz
por que aquilo funciona. E como a frequência virou um slider livre, a aba
**Ajustes** mostra ao vivo em que faixa de EEG você caiu, o que se observa
nela, para que serve e onde a promessa costuma passar do que foi demonstrado
(`BAND_INFO`).

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

## Temas

Seis paletas, cada uma definida por **dois matizes e dois cromas** — o neutro
e o acento. A luminosidade vem de uma escada fixa por modo (`LADDER`), o que
mantém o contraste igual em todos os temas: não dá para escolher um tema
ilegível. A conversão OKLCH → sRGB é feita em JS (`oklchHex()`, matrizes de
Björn Ottosson) em vez de `oklch()` no CSS, para que o mesmo hex sirva ao CSS,
ao canvas e à `<meta name="theme-color">` sem depender de suporte do navegador
em três lugares distintos.

A aparência é um eixo separado do tema: Sistema, Claro ou Escuro. Os dois
ficam no aparelho (`localStorage`), não no modo — trocar de modo não mexe nas
suas cores.

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
