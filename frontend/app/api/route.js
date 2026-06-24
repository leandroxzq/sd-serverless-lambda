import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const s3Client = new S3Client({
  region: "sa-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_PROJECT,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_PROJECT,
  },
});

export async function POST(request) {
  try {
    const { filename, contentType } = await request.json();
    const bucketName = "converter-s3-sd";

    // Nome do arquivo original na pasta de entradas
    const keyInput = `entradas/${Date.now()}-${filename}`;

    // Nome esperado para o arquivo final convertido
    const keyOutput = keyInput
      .replace("entradas/", "saidas/")
      .replace(/\.[^/.]+$/, ".jpg");

    // 1. Gera a URL assinada para o UPLOAD (PUT)
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: keyInput,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3Client, uploadCommand, {
      expiresIn: 60,
    });

    // 2. NOVA LÓGICA: Gera uma URL assinada para o DOWNLOAD (GET) do arquivo convertido
    // Essa URL expira em 20 minutos (1200 segundos), tempo de sobra para o avaliador testar e baixar
    const downloadCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: keyOutput,
    });
    const downloadUrl = await getSignedUrl(s3Client, downloadCommand, {
      expiresIn: 1200,
    });

    return NextResponse.json({ uploadUrl, downloadUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
