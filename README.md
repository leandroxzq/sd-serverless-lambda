# Conversor de Imagens Serverless (S3 + AWS Lambda)

Este projeto é uma Prova de Conceito (PoC) de um sistema de processamento de arquivos baseado em computação serverless (FaaS). Ele realiza a conversão automática de imagens enviadas para o Amazon S3 para o formato JPEG utilizando o AWS Lambda e a biblioteca Sharp.

## 🛠️ Arquitetura da Solução

O projeto segue uma arquitetura orientada a eventos (Event-Driven Architecture):

1. O usuário faz o upload de uma imagem na pasta `entradas/` do Bucket S3.
2. O Amazon S3 gera um evento de criação (`s3:ObjectCreated:*`).
3. O evento dispara automaticamente a função AWS Lambda.
4. A função Lambda processa o stream do arquivo, converte a imagem para `.jpg` (qualidade 80%) via biblioteca `sharp` e salva o resultado na pasta `saidas/` do mesmo Bucket.

## 🚀 Tecnologias Utilizadas

- **Runtime:** Node.js 24.x
- **FaaS:** AWS Lambda (configurado com 1024MB de memória para processamento eficiente)
- **Storage:** Amazon S3 (Buckets de uso geral)
- **Processamento:** Sharp Image Library & AWS SDK v3 (`@aws-sdk/client-s3`)

## 📦 Como Implantar (Deploy Local para Nuvem)

1. Clone o repositório e instale as dependências especificando a arquitetura alvo do AWS Lambda (Linux x64):
   ```bash
   npm install
   npm install --os=linux --cpu=x64 sharp
   ```
2. Compacte o arquivo index.mjs, a pasta node_modules e o package.json em um arquivo projeto.zip.
3. Faça o upload do ZIP na aba Código da sua função Lambda no Console AWS.
4. Certifique-se de que a Role do Lambda possui a política de permissão AmazonS3FullAccess anexada.
5. Configure o Gatilho (Trigger) do S3 no Lambda apontando para o seu Bucket com o prefixo entradas/.
