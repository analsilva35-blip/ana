# 🎓 EstudaFlow — Central de Alta Performance nos Estudos

> Uma plataforma web moderna, rápida, minimalista e **100% livre de servidores, compiladores ou instalações** (zero `node_modules`, zero backend). Desenvolvida exclusivamente com **HTML5**, **CSS3** e **JavaScript Puro (Vanilla)**.

---

## ⚡ Como Abrir (SEM SERVIDOR / SEM INSTALAR NADA)

**Basta dar um duplo clique no arquivo:**
```text
C:\antigravity2\index.html
```
Ou arrastá-lo para dentro de qualquer navegador (Chrome, Edge, Firefox, Safari, Opera).

- ✅ **Sem Node.js**
- ✅ **Sem terminal**
- ✅ **Sem servidor web**
- ✅ **Sem dependências externas**
- ✅ **100% Offline (Funciona mesmo sem internet)**

---

## 🏛️ Estrutura de Arquivos

```text
c:\antigravity2/
├── index.html         # Página principal da aplicação (abra diretamente no navegador)
├── css/
│   └── styles.css     # Estilização completa, variáveis para Modo Claro/Escuro e animações 3D
├── js/
│   ├── icons.js       # Biblioteca nativa de ícones SVG embutidos (100% offline)
│   ├── audio.js       # Síntese sonora nativa (Web Audio API) com sons de sino e ruído ambiente
│   ├── data.js        # Banco de dados e persistência em LocalStorage com dados de demonstração
│   ├── charts.js      # Motor gráfico em SVG nativo de alta precisão
│   └── app.js         # Controlador da aplicação, navegação entre abas, modais e Pomodoro
└── README.md          # Documentação do projeto
```

---

## ✨ Funcionalidades Principais

### 1. 📊 Painel Geral (Dashboard)
- **Métricas do Dia:** Horas estudadas hoje versus meta diária com barra de progresso visual em tempo real.
- **Contador de Consistência (*Streak*):** Registro de dias seguidos estudando com mensagens motivacionais dinâmicas.
- **Acesso Rápido ao Pomodoro:** Botão para iniciar sessões de 25 min com um clique.
- **Gerenciador de Tarefas do Dia:** Filtros por tarefas *Pendentes*, *Concluídas* e *Todas*, marcação por checkbox, tags por disciplina e prioridades (*Alta*, *Média*, *Baixa*).
- Próximos prazos e exames com contagem regressiva em dias e barra de progresso do edital por matéria.

### 2. 📅 Planejador e Cronograma de Estudos
- **Grade Semanal (Timetable):** Grid interativo de 7 dias (Segunda a Domingo) com blocos de estudo coloridos pela matéria, horários de início e término e sala/local.
- **Calendário Acadêmico:** Visualização mensal com marcação de Provas, Trabalhos e Revisões e painel lateral com detalhes da data selecionada.
- **Assistente de Revisão Espaçada (1 Clique):** Agenda automaticamente no calendário as revisões **R1 (24h)**, **R2 (7 dias)** e **R3 (30 dias)** para qualquer tópico estudado.

### 3. 📚 Gerenciador de Matérias e Conteúdos (Edital Verticalizado)
- Cadastro e edição de matérias com cor personalizada, professor e meta de horas semanais.
- Barra de progresso individual (% de tópicos concluídos e dominados).
- Sistema de status por tópico com 4 níveis: *A Estudar*, *Em Andamento*, *Revisado* e *Dominado 🏆*.
- Campo para anotações e referências bibliográficas por tópico.

### 4. ⏱️ Ferramentas de Produtividade Integradas
- **Pomodoro & Cronômetro Livre:** Modos *Pomodoro (25m)*, *Pausa Curta (5m)*, *Pausa Longa (15m)* e *Cronômetro Livre*.
- Mostrador de tempo circular SVG animado de alta precisão.
- **Sintetizador Sonoro Nativo (Web Audio API):** Som de sino tibetano relaxante ao concluir cada ciclo (100% offline, sem dependência de arquivos de áudio externos).
- **Sons Ambientes de Concentração:** Chuva Suave, Ruído de Foco e Ondas do Mar gerados pelo sintetizador de áudio do navegador.
- **Vinculação Automática:** Todo o tempo estudado é salvo na matéria ativa e computado nas estatísticas.

### 5. 🗂️ Flashcards Simples (Revisão Ativa)
- Baralhos organizados por disciplina.
- **Modo Estudo 3D:** Cartão com animação de virada tridimensional ao clique ou tecla Espaço.
- Botões de autoavaliação (*Difícil*, *Bom*, *Fácil*) com histórico de revisões.

### 6. 📈 Estatísticas e Relatórios de Progresso
- **Motor Gráfico em SVG Puro (Zero dependências):**
  - Gráfico de barras com as horas estudadas nos últimos 7 dias e linha da meta diária.
  - Gráfico de rosca (*Donut Chart*) com a distribuição de tempo por matéria.
  - Gráfico comparativo entre horas planejadas vs. horas reais executadas na semana.
- Total de horas acumuladas, média diária e matéria líder.

### 7. ⚙️ Design System, Tema e Backup
- Alternância fluida entre **Modo Escuro (Dark Mode)** e **Modo Claro (Light Mode)** via variáveis CSS.
- Menu lateral responsivo no desktop e barra de navegação inferior (*Bottom Nav*) para dispositivos móveis.
- Armazenamento 100% no navegador via `localStorage` com suporte a **Exportar Backup (Download JSON)** e **Restaurar Backup (Upload JSON)**.

---

## 🌐 Como Fazer Deploy na Web (Opcional)

Se você desejar publicar o site na internet gratuitamente para acessar do celular de qualquer lugar:
- **GitHub Pages:** Faça upload dos arquivos para a raiz de um repositório e ative o Pages.
- **Vercel / Netlify:** Arraste e solte a pasta `c:\antigravity2` diretamente na interface web da Vercel ou Netlify. O site entrará no ar imediatamente com HTTPS gratuito.
