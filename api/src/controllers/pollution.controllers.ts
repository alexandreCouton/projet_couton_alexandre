import { Request, Response } from "express";
import db from "../models";
import { PollutionCreationAttributes } from "../models/pollutions.model";

const Pollutions = db.pollutions;

const parseId = (req: Request): number => {
  const paramId = req.params.id;
  return Array.isArray(paramId) ? Number(paramId[0]) : Number(paramId);
};

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

/**
 * Ne garde que les champs connus du modèle (l'id vient de l'URL ou de la base).
 */
const pickBody = (body: Record<string, unknown>): PollutionCreationAttributes => ({
  titre: body.titre as string,
  type: body.type as string,
  description: body.description as string,
  dateObservation: body.dateObservation as string,
  lieu: body.lieu as string,
  latitude: Number(body.latitude),
  longitude: Number(body.longitude),
  photoUrl: (body.photoUrl as string | null | undefined) ?? null
});

/**
 * Récupère la liste de toutes les pollutions depuis la base PostgreSQL.
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({
      order: [["id", "ASC"]]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    res.status(500).json({
      message: "Erreur lors de la récupération des données de pollution: " + errorMessage(err)
    });
  }
};

/**
 * Récupère une pollution par son identifiant.
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req);
  try {
    const data = await Pollutions.findByPk(id);
    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({
        message: `Aucune pollution trouvée avec l'id=${id}.`
      });
    }
  } catch (err: unknown) {
    res.status(500).json({
      message: `Erreur lors de la récupération de la pollution id=${id}: ` + errorMessage(err)
    });
  }
};

/**
 * Crée une nouvelle pollution.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.create(pickBody(req.body));
    res.status(201).json(data);
  } catch (err: unknown) {
    res.status(400).json({
      message: "Erreur lors de la création de la pollution: " + errorMessage(err)
    });
  }
};

/**
 * Met à jour une pollution existante.
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req);
  try {
    const data = await Pollutions.findByPk(id);
    if (!data) {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
      return;
    }
    await data.update(pickBody(req.body));
    res.status(200).json(data);
  } catch (err: unknown) {
    res.status(400).json({
      message: `Erreur lors de la mise à jour de la pollution id=${id}: ` + errorMessage(err)
    });
  }
};

/**
 * Supprime une pollution.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req);
  try {
    const deleted = await Pollutions.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
    }
  } catch (err: unknown) {
    res.status(500).json({
      message: `Erreur lors de la suppression de la pollution id=${id}: ` + errorMessage(err)
    });
  }
};

export default { getAll, getById, create, update, remove };
