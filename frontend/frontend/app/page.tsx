"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files);
    setResultUrl("");
    setMessage("");
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Selecione um arquivo primeiro!");

    setUploading(true);
    setMessage("Solicitando permissão de upload...");

    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file[0].name,
          contentType: file[0].type,
        }),
      });
      const { uploadUrl, downloadUrl } = await res.json();

      setMessage("Enviando arquivo diretamente para o Amazon S3...");

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file[0],
        headers: { "Content-Type": file[0].type },
      });

      if (uploadRes.ok) {
        setMessage("Upload concluído! Aguardando conversão Serverless...");

        setTimeout(() => {
          setResultUrl(downloadUrl);
          setMessage("Imagem convertida com sucesso para JPEG!");
          setUploading(false);
        }, 3500);
      } else {
        throw new Error("Falha no upload para o S3");
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage(`Erro: ${String(error)}`);
      }
      setUploading(false);
    }
  };

  const selectedFile = file?.[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f3ee] text-[#22201c]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-4 border-b border-[#ded7cc] pb-5">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg bg-[#1f6f68] text-sm font-bold text-white shadow-sm">
              S3
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a6752]">
                AWS Lambda
              </p>
              <h1 className="text-xl font-semibold text-[#22201c]">
                Conversor Serverless
              </h1>
            </div>
          </div>
          <span className="hidden rounded-full border border-[#d8cfbf] bg-white/70 px-4 py-2 text-sm font-medium text-[#5e5549] shadow-sm sm:inline-flex">
            PNG e WEBP para JPEG
          </span>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
          <div className="max-w-xl">
            <p className="mb-4 inline-flex rounded-full bg-[#efe5d6] px-4 py-2 text-sm font-semibold text-[#795f36]">
              Upload direto para S3
            </p>
            <h2 className="text-4xl font-semibold leading-tight text-[#22201c] sm:text-5xl">
              Converta imagens com uma interface mais limpa e direta.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#6b6258] sm:text-lg">
              Selecione uma imagem, envie para o bucket e acompanhe o status da
              conversão até o link final em JPEG ficar pronto.
            </p>

            <div className="mt-8 grid gap-3 text-sm text-[#5f5549] sm:grid-cols-3">
              <div className="rounded-lg border border-[#ded7cc] bg-white/55 p-4">
                <strong className="block text-[#1f6f68]">01</strong>
                Assinatura segura
              </div>
              <div className="rounded-lg border border-[#ded7cc] bg-white/55 p-4">
                <strong className="block text-[#1f6f68]">02</strong>
                Upload no S3
              </div>
              <div className="rounded-lg border border-[#ded7cc] bg-white/55 p-4">
                <strong className="block text-[#1f6f68]">03</strong>
                Saída em JPEG
              </div>
            </div>
          </div>

          <form
            onSubmit={handleUpload}
            className="rounded-lg border border-[#d8cfbf] bg-white p-5 shadow-[0_24px_70px_rgba(70,58,42,0.12)] sm:p-7"
          >
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7a6752]">
                Arquivo
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#22201c]">
                Escolha a imagem
              </h3>
            </div>

            <label
              className={`group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition ${
                uploading
                  ? "cursor-not-allowed border-[#d8cfbf] bg-[#f5f1ea] opacity-70"
                  : "border-[#b8aa95] bg-[#fbf8f2] hover:border-[#1f6f68] hover:bg-[#f3faf7]"
              }`}
            >
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
              <span className="grid size-14 place-items-center rounded-lg bg-[#1f6f68] text-xl font-bold text-white shadow-sm transition group-hover:scale-105">
                +
              </span>
              <span className="mt-4 text-base font-semibold text-[#2e2a25]">
                {selectedFile ? selectedFile.name : "Clique para selecionar"}
              </span>
              <span className="mt-2 text-sm leading-6 text-[#74695c]">
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "Formatos aceitos: PNG, WEBP e outras imagens"}
              </span>
            </label>

            <button
              type="submit"
              disabled={!file || uploading}
              className="mt-5 flex min-h-12 w-full items-center justify-center rounded-lg bg-[#1f6f68] px-5 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#195b56] disabled:cursor-not-allowed disabled:bg-[#b8b0a5] disabled:text-white/75"
            >
              {uploading ? "Processando..." : "Enviar e converter"}
            </button>

            {message && (
              <div className="mt-5 rounded-lg border border-[#ded7cc] bg-[#fbf8f2] px-4 py-3 text-sm font-medium leading-6 text-[#5f5549]">
                {message}
              </div>
            )}

            {resultUrl && (
              <div className="mt-5 rounded-lg border border-[#9ac8bd] bg-[#ecf8f4] p-4">
                <strong className="block text-base text-[#1f6f68]">
                  Resultado pronto
                </strong>
                <a
                  href={resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-[#d49b3f] px-4 text-sm font-bold text-[#241b0f] transition hover:bg-[#c78d31]"
                >
                  Abrir ou baixar imagem JPEG
                </a>
              </div>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
