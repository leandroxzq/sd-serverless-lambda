import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3Client = new S3Client({});

export const handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " "),
  );

  if (!key.startsWith("entradas/")) {
    console.log("Arquivo fora da pasta de entradas. Ignorando.");
    return;
  }

  try {
    console.log(`Buscando arquivo: ${bucket}/${key}`);

    const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await s3Client.send(getCommand);

    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    const inputBuffer = Buffer.concat(chunks);

    console.log("Convertendo arquivo...");
    const outputBuffer = await sharp(inputBuffer)
      .jpeg({ quality: 80 })
      .toBuffer();

    const newKey = key
      .replace("entradas/", "saidas/")
      .replace(/\.[^/.]+$/, ".jpg");

    console.log(`Salvando em: ${bucket}/${newKey}`);

    const finalPayload = new Uint8Array(outputBuffer);

    const putCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: newKey,
      Body: finalPayload,
      ContentType: "image/jpeg",
    });
    await s3Client.send(putCommand);

    return { status: "Sucesso", file: newKey };
  } catch (error) {
    console.error("Erro no processamento:", error);
    throw error;
  }
};
