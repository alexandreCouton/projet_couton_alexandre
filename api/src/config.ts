const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable d'environnement ${name} manquante. ` +
        "En local : copier api/.env.example vers api/.env. Sur Render : la définir dans Environment."
    );
  }
  return value;
};

export const DATABASE_URL = requireEnv("DATABASE_URL");
