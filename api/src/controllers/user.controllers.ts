import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { Request, Response } from "express";
import { UniqueConstraintError, ValidationError } from "sequelize";
import { promisify } from "util";
import db from "../models";
import { UserInstance } from "../models/users.model";
import { errorMessage, parseId } from "./helpers";

const Users = db.users;

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

const KEY_LENGTH = 64;

const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${hash.toString("hex")}`;
};

const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [salt, hash] = stored.split(":");
  const actual = await scryptAsync(password, salt, KEY_LENGTH);
  return timingSafeEqual(actual, Buffer.from(hash, "hex"));
};

const toPublic = ({ id, login, lastName, firstName, email }: UserInstance) => ({
  id,
  login,
  lastName,
  firstName,
  email
});

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Users.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs: " + errorMessage(err)
    });
  }
};


export const create = async (req: Request, res: Response): Promise<void> => {
  const { login, password, lastName, firstName, email } = req.body;
  if (!isNonEmptyString(password)) {
    res.status(400).json({ message: "Le mot de passe est requis." });
    return;
  }
  try {
    const user = await Users.create({
      login,
      password: await hashPassword(password),
      lastName,
      firstName,
      email
    });
    res.status(201).json(toPublic(user));
  } catch (err: unknown) {
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({ message: "Ce login ou cet email est déjà utilisé." });
    } else if (err instanceof ValidationError) {
      res.status(400).json({ message: errorMessage(err) });
    } else {
      res.status(500).json({
        message: "Erreur lors de la création de l'utilisateur: " + errorMessage(err)
      });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { login: userLogin, password } = req.body;
  if (!isNonEmptyString(userLogin) || !isNonEmptyString(password)) {
    res.status(400).json({ message: "Le login et le mot de passe sont requis." });
    return;
  }
  try {
    const user = await Users.findOne({ where: { login: userLogin } });
    if (user && (await verifyPassword(password, user.password))) {
      res.status(200).json(toPublic(user));
    } else {
      res.status(401).json({ message: "Login ou mot de passe incorrect." });
    }
  } catch (err: unknown) {
    res.status(500).json({ message: "Erreur lors de la connexion: " + errorMessage(err) });
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseId(req);
  try {
    const deleted = await Users.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: `Aucun utilisateur trouvé avec l'id=${id}.` });
    }
  } catch (err: unknown) {
    res.status(500).json({
      message: `Erreur lors de la suppression de l'utilisateur id=${id}: ` + errorMessage(err)
    });
  }
};

export default { getAll, create, login, remove };
