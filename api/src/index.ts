import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import db from "./models";
import initRoutes from "./routes";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  exposedHeaders: "Authorization"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// health checks
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pollution API." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

db.sequelize
  .sync()
  .then(async () => {
    console.log("Synced db.");
    try {
      const count = await db.pollutions.count();
      if (count === 0) {
        await db.pollutions.bulkCreate([
          { titre: "Bouteilles sur la plage", type: "Plastique", description: "Une cinquantaine de bouteilles échouées après la tempête.", dateObservation: "2026-09-12", lieu: "Plage du Prado, Marseille", latitude: 43.2593, longitude: 5.3752, photoUrl: null },
          { titre: "Fût abandonné", type: "Chimique", description: "Fût métallique rouillé qui fuit, odeur de solvant.", dateObservation: "2026-10-02", lieu: "Zone industrielle, Lyon", latitude: 45.7215, longitude: 4.8542, photoUrl: null },
          { titre: "Gravats en forêt", type: "Dépôt sauvage", description: "Tas de gravats et de plaques de plâtre au bord du chemin.", dateObservation: "2026-08-27", lieu: "Forêt de Fontainebleau", latitude: 48.4047, longitude: 2.7016, photoUrl: null },
          { titre: "Mousse sur la rivière", type: "Eau", description: "Mousse blanche persistante en aval du déversoir.", dateObservation: "2026-10-15", lieu: "La Garonne, Toulouse", latitude: 43.6045, longitude: 1.4442, photoUrl: null }
        ]);
        console.log("Jeu de données initial pour la table pollution inséré avec succès.");
      }
    } catch (seedErr: unknown) {
      console.warn("Remarque : impossible d'insérer les données d'initialisation :", seedErr);
    }
  })
  .catch((err: Error) => {
    console.log("Failed to sync db: " + err.message);
  });


initRoutes(app);

// set port, listen on 0.0.0.0 for Render and container environments
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}.`);
});

export default app;
