// Prépare les photos de data/photos/ pour le site (public/photos/) :
//  - redimensionnées à 640 px maximum (les originaux peuvent peser plusieurs Mo) ;
//  - orientées selon l'appareil photo, puis débarrassées de leurs métadonnées
//    (EXIF, position GPS...) que sharp n'inclut pas par défaut.
// Les noms de fichiers ne changent pas.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const source = path.resolve(__dirname, "..", "..", "data", "photos");
const destination = path.resolve(__dirname, "..", "public", "photos");

async function main() {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });
  let avant = 0;
  let apres = 0;
  const fichiers = fs.readdirSync(source).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  // Toutes en même temps : sharp répartit le travail sur les cœurs du processeur.
  await Promise.all(
    fichiers.map(async (f) => {
      const image = sharp(path.join(source, f)).rotate().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true });
      const sortie = path.join(destination, f);
      if (/\.png$/i.test(f)) await image.png({ compressionLevel: 9, palette: true }).toFile(sortie);
      else if (/\.webp$/i.test(f)) await image.webp({ quality: 82 }).toFile(sortie);
      else await image.jpeg({ quality: 82, mozjpeg: true }).toFile(sortie);
      avant += fs.statSync(path.join(source, f)).size;
      apres += fs.statSync(sortie).size;
    }),
  );
  console.log(`${fichiers.length} photos préparées : ${(avant / 1e6).toFixed(1)} Mo -> ${(apres / 1e6).toFixed(1)} Mo`);
}

main();
